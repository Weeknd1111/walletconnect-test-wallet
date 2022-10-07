import * as ethers from "ethers";
import { signTypedData_v4 } from "eth-sig-util";
import { getChainData } from "../helpers/utilities";
import { setLocal, getLocal, removeLocal } from "../helpers/local";
import {
  ENTROPY_KEY,
  MNEMONIC_KEY,
  DEFAULT_ACTIVE_INDEX,
  DEFAULT_CHAIN_ID,
  DEFAULT_NEXT_MNEMONIC_PATH_INDEX,
  NEXT_MNEMONIC_PATH_INDEX,
  SAVEDS,
} from "../constants/default";
import { getAppConfig } from "../config";

export const AccountSource = {
  mnemonic: 0, // 助记词
  privateKey: 1, // 私钥
};

export interface IAccount {
  address: string;
  source: number; // 账户来源AccountSource
  pathIndex: number; // 助记词中的index
  privateKey: string;
  name: string; // 备注
}

export class WalletController {
  public path: string;
  public entropy: string;
  public mnemonic: string;
  public wallet: ethers.Wallet;

  public activeIndex: number = DEFAULT_ACTIVE_INDEX;
  public activeChainId: number = DEFAULT_CHAIN_ID;

  // 账户
  public accounts: IAccount[] = [];
  // 下次使用的词索引
  public nextMnemonicPathIndex: number = DEFAULT_NEXT_MNEMONIC_PATH_INDEX;
  // 保存的账户
  private saveds: string[];

  constructor() {
    this.loadSaveds();
    this.loadAccounts();
    this.loadMnemonic();
    if (this.accounts.length > 0) {
      this.wallet = this.init();
    }
  }

  get provider(): ethers.providers.Provider {
    return this.wallet.provider;
  }

  public isActive() {
    if (!this.wallet) {
      return this.wallet;
    }
    return null;
  }

  public getIndex() {
    return this.activeIndex;
  }

  public getWallet(index?: number, chainId?: number): ethers.Wallet {
    if (!this.wallet || this.activeIndex === index || this.activeChainId === chainId) {
      return this.init(index, chainId);
    }
    return this.wallet;
  }

  // 每次增加或者删除账户需要更新账户
  public getAccounts(): string[] {
    const accounts: string[] = [];
    for (let i = 0; i < this.accounts.length; i++) {
      const account: IAccount = this.accounts[i];
      accounts.push(account.address);
    }
    return accounts;
  }

  // 获取索引账户私钥
  public getPrivateKey(index: number): string {
    if (index < this.accounts.length) {
      const account: IAccount = this.accounts[index];
      return account.privateKey;
    } else {
      throw Error("error index: " + index);
    }
  }

  // 设置账户备注
  public setName(index: number, name: string): void {
    if (index < this.accounts.length) {
      const account: IAccount = this.accounts[index];
      account.name = name;
      this.saveAccount(account);
    } else {
      throw Error("error index: " + index);
    }
  }

  // 获取账户备注
  public getName(index: number): string {
    if (index < this.accounts.length) {
      const account: IAccount = this.accounts[index];
      return account.name;
    } else {
      throw Error("Error index: " + index);
    }
  }

  // 根据索引删除一个账户
  public removeAccount(index: number): void {
    if (index < this.accounts.length) {
      this.accounts.splice(index, 1);
      removeLocal(this.saveds[index]);
      this.saveds.splice(index, 1);
      setLocal(SAVEDS, this.saveds);
    } else {
      throw Error("Error index: " + index);
    }
  }

  private newAccountName(): string {
    return "Account " + this.accounts.length;
  }

  // 添加一个账户
  public addAccount(privateKey?: string): void {
    if (typeof privateKey === "string") {
      //缺少0x的私钥
      if (privateKey.length === 64 && privateKey.match(/^[0-9a-f]*$/i)) {
        privateKey = "0x" + privateKey;
      } else if (privateKey.length === 66 && privateKey.match(/^[0-9a-fx]*$/i)) {
        //正常私钥,不需要判断
      } else {
        throw new Error("The private key is illegal");
      }
      // 添加到账户上
      const wallet = new ethers.Wallet(privateKey);
      const address: string = wallet.address;

      //判断账户是否已经存在
      for (let i = 0; i < this.accounts.length; i++) {
        const item: IAccount = this.accounts[i];
        // if (ethers.utils.getAddress(item.address) === ethers.utils.getAddress(address)) {
        if (item.address === address) {
          throw new Error("The private key is imported");
        }
      }

      const account: IAccount = {
        address,
        source: AccountSource.privateKey,
        privateKey,
        pathIndex: 0,
        name: this.newAccountName(),
      };
      // 保存账户
      this.saveAccount(account);
      this.accounts.push(account);

      // 保存账户地址
      this.saveds.push(account.address);
      setLocal(SAVEDS, this.saveds);

    } else {
      const wallet = this.oneGenerateWallet();
      const address: string = wallet.address;
      const privateKey: string = wallet.privateKey;

      const account: IAccount = {
        address,
        source: AccountSource.mnemonic,
        privateKey,
        pathIndex: this.nextMnemonicPathIndex,
        name: this.newAccountName(),
      };
      // 保存账户
      this.saveAccount(account);
      this.accounts.push(account);
      // 保存账户地址
      this.saveds.push(account.address);
      setLocal(SAVEDS, this.saveds);

      // 存储当前词index
      this.nextMnemonicPathIndex++;
      setLocal(NEXT_MNEMONIC_PATH_INDEX, this.nextMnemonicPathIndex);
    }
  }

  private loadSaveds(): void {
    this.saveds = getLocal(SAVEDS) || [];
  }

  // 加载词
  private loadMnemonic(): void {
    this.mnemonic = getLocal(MNEMONIC_KEY);
    this.nextMnemonicPathIndex = this.getData(NEXT_MNEMONIC_PATH_INDEX);
  }

  // 加载账户
  private loadAccounts(): void {
    for (let i = 0; i < this.saveds.length; i++) {
      this.accounts.push(getLocal(this.saveds[i]));
    }
  }

  // 保存单个账户
  private saveAccount(account: IAccount) {
    setLocal(account.address, account);
  }

  // 设置默认词
  public setMnemonic(value: string): void {
    this.mnemonic = value;
    this.nextMnemonicPathIndex = DEFAULT_NEXT_MNEMONIC_PATH_INDEX;

    setLocal(NEXT_MNEMONIC_PATH_INDEX, this.nextMnemonicPathIndex);
    setLocal(MNEMONIC_KEY, this.mnemonic);
  }

  public getData(key: string): any {
    let value = getLocal(key);
    if (!value) {
      switch (key) {
        case ENTROPY_KEY:
          value = this.generateEntropy();
          break;
        case MNEMONIC_KEY:
          value = this.generateMnemonic();
          break;
        case NEXT_MNEMONIC_PATH_INDEX:
          value = this.nextMnemonicPathIndex;
          break;
        default:
          throw new Error(`Unknown data key: ${key}`);
      }
      setLocal(key, value);
    }
    return value;
  }

  public getPath(index: number = this.activeIndex): string {
    this.path = `${getAppConfig().derivationPath}/${index}`;
    return this.path;
  }

  public generateEntropy(): string {
    this.entropy = ethers.utils.hexlify(ethers.utils.randomBytes(16));
    return this.entropy;
  }

  public generateMnemonic(): string {
    this.mnemonic = ethers.utils.entropyToMnemonic(this.getEntropy());
    return this.mnemonic;
  }

  // 通过accouns的index获取wallet
  public getIndexWallet(index: number): ethers.ethers.Wallet {
    const privateKey = this.getPrivateKey(index);
    if (privateKey !== "") {
      return new ethers.Wallet(privateKey);
    }
    throw Error("Error index: " + index);
  }

  // 不断移动索引生成新的词账户,保证生成账户是唯一生成
  private oneGenerateWallet(): ethers.ethers.Wallet {
    while (true) {
      const wallet = this.generateWallet(this.nextMnemonicPathIndex);
      const address: string = wallet.address;
      // 词生成账户此前已经存在私钥导入情况
      let imported = false;
      for (let i = 0; i < this.accounts.length; i++) {
        const item: IAccount = this.accounts[i];
        if (item.source === AccountSource.privateKey && item.address === address) {
          this.nextMnemonicPathIndex++;
          imported = true;
          break;
        }
      }
      if (!imported) {
        return wallet;
      }
    }
  }

  public generateWallet(index: number): ethers.ethers.Wallet {
    this.wallet = ethers.Wallet.fromMnemonic(this.getMnemonic(), this.getPath(index));
    return this.wallet;
  }

  public getEntropy(): string {
    return this.getData(ENTROPY_KEY);
  }

  public getMnemonic(): string {
    //当前不存在词则采用生成
    // if (!this.mnemonic || this.mnemonic === "") {
    //   return this.generateMnemonic();
    // }
    return this.mnemonic;
  }

  public init(index = DEFAULT_ACTIVE_INDEX, chainId = DEFAULT_CHAIN_ID): ethers.Wallet {
    if (index < this.accounts.length) {
      return this.update(index, chainId);
    } else {
      // error
      return this.wallet;
    }
  }

  public update(index: number, chainId: number): ethers.Wallet {
    const firstUpdate = typeof this.wallet === "undefined";
    this.activeIndex = index;
    this.activeChainId = chainId;
    // const wallet = this.generateWallet(index);
    if (index < this.accounts.length) {
      const rpcUrl = getChainData(chainId).rpc_url;
      const wallet = this.getIndexWallet(index);
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.wallet = wallet.connect(provider);
    }
    else {
      throw Error("Error index: " + index);
    }
    if (!firstUpdate) {
      // update another controller if necessary here
    }
    return this.wallet;
  }

  public async populateTransaction(transaction: any) {
    let tx = Object.assign({}, transaction);
    if (this.wallet) {
      if (tx.gas) {
        tx.gasLimit = tx.gas;
        delete tx.gas;
      }
      if (tx.from) {
        tx.from = ethers.utils.getAddress(tx.from);
      }

      try {
        tx = await this.wallet.populateTransaction(tx);
        tx.gasLimit = ethers.BigNumber.from(tx.gasLimit).toHexString();
        tx.gasPrice = ethers.BigNumber.from(tx.gasPrice).toHexString();
        tx.nonce = ethers.BigNumber.from(tx.nonce).toHexString();
      } catch (err) {
        console.error("Error populating transaction", tx, err);
      }
    }

    return tx;
  }

  public async sendTransaction(transaction: any) {
    if (this.wallet) {
      if (
        transaction.from &&
        transaction.from.toLowerCase() !== this.wallet.address.toLowerCase()
      ) {
        console.error("Transaction request From doesn't match active account");
      }

      if (transaction.from) {
        delete transaction.from;
      }

      // ethers.js expects gasLimit instead
      if ("gas" in transaction) {
        transaction.gasLimit = transaction.gas;
        delete transaction.gas;
      }

      const result = await this.wallet.sendTransaction(transaction);
      return result.hash;
    } else {
      console.error("No Active Account");
    }
    return null;
  }

  public async signTransaction(data: any) {
    if (this.wallet) {
      if (data && data.from) {
        delete data.from;
      }
      data.gasLimit = data.gas;
      delete data.gas;
      const result = await this.wallet.signTransaction(data);
      return result;
    } else {
      console.error("No Active Account");
    }
    return null;
  }

  public async signMessage(data: any) {
    if (this.wallet) {
      const signingKey = new ethers.utils.SigningKey(this.wallet.privateKey);
      const sigParams = await signingKey.signDigest(ethers.utils.arrayify(data));
      const result = await ethers.utils.joinSignature(sigParams);
      return result;
    } else {
      console.error("No Active Account");
    }
    return null;
  }

  public async signPersonalMessage(message: any) {
    if (this.wallet) {
      const result = await this.wallet.signMessage(
        ethers.utils.isHexString(message) ? ethers.utils.arrayify(message) : message,
      );
      return result;
    } else {
      console.error("No Active Account");
    }
    return null;
  }

  public async signTypedData(data: any) {
    if (this.wallet) {
      const result = signTypedData_v4(Buffer.from(this.wallet.privateKey.slice(2), "hex"), {
        data: JSON.parse(data),
      });
      return result;
    } else {
      console.error("No Active Account");
    }
    return null;
  }

  public async resetWallet() {
    try {

      this.activeIndex = DEFAULT_ACTIVE_INDEX;
      this.activeChainId = DEFAULT_CHAIN_ID;
      this.nextMnemonicPathIndex = DEFAULT_NEXT_MNEMONIC_PATH_INDEX;

      for (let i = 0; i < this.saveds.length; i++) {
        removeLocal(this.saveds[i]);
      }
      this.saveds = [];
      removeLocal(SAVEDS);

      this.accounts = [];
      removeLocal(ENTROPY_KEY);
      removeLocal(MNEMONIC_KEY);
      removeLocal(NEXT_MNEMONIC_PATH_INDEX);
    } catch (error) {
      throw new Error("error reset wallet");
    }
  }
}

export function getWalletController() {
  return new WalletController();
}
