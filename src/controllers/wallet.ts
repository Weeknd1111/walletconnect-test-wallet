import * as ethers from "ethers";
import { signTypedData_v4 } from "eth-sig-util";
import { getChainData } from "../helpers/utilities";
import { setLocal, getLocal } from "../helpers/local";
import {
  ENTROPY_KEY,
  MNEMONIC_KEY,
  DEFAULT_ACTIVE_INDEX,
  DEFAULT_CHAIN_ID,
  DEFAULT_NEXT_MNEMONIC_PATH_INDEX,
  NEXT_MNEMONIC_PATH_INDEX,
  ACCOUNTS,
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
  private accounts: IAccount[];
  // 下次使用的词索引
  public nextMnemonicPathIndex: number = DEFAULT_NEXT_MNEMONIC_PATH_INDEX;

  constructor() {
    // this.path = this.getPath();
    // this.entropy = this.getEntropy();
    // this.mnemonic = this.getMnemonic();
    // console.log(this.mnemonic);
    // this.wallet = this.init();

    this.loadAccounts();
    this.loadMnemonic();

    if (!this.accounts) {
      this.accounts = [];
    }

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
      this.saveAccounts();
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
      throw Error("error index: " + index);
    }
  }

  // 根据索引删除一个账户
  public removeAccount(index: number): void {
    if (index < this.accounts.length) {
      this.accounts.splice(index, 1);
      this.saveAccounts();
      // TODO 更新当前选中
    } else {
      throw Error("error index: " + index);
    }
  }

  // 添加一个账户
  // 返回值:0=成功 1=私钥不合法 2=账户已经存在
  public addAccount(privateKey?: string): number {
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
        const item = this.accounts[i];
        // if (ethers.utils.getAddress(item.address) === ethers.utils.getAddress(address)) {
        if (item.address === address) {
          return 2;
        }
      }

      // console.log("addAccount privateKey: "+ privateKey + " , address: " + address);

      const account: IAccount = {
        address,
        source: AccountSource.privateKey,
        privateKey,
        pathIndex: 0,
        name: "",
      };

      this.accounts.push(account);
      this.saveAccounts();

      // 更新选中账户
      this.update(this.accounts.length - 1, this.activeChainId);
    } else {
      const wallet = this.generateWallet(this.nextMnemonicPathIndex);
      const address: string = wallet.address;
      const privateKey: string = wallet.privateKey;
      const account: IAccount = {
        address,
        source: AccountSource.mnemonic,
        privateKey,
        pathIndex: this.nextMnemonicPathIndex,
        name: "",
      };
      this.accounts.push(account);
      this.saveAccounts();
      // 存储当前词index
      this.nextMnemonicPathIndex++;
      setLocal(NEXT_MNEMONIC_PATH_INDEX, this.nextMnemonicPathIndex);
      // 更新选中账户
      this.update(this.accounts.length - 1, this.activeChainId);
    }

    return 0;
  }

  // 加载词
  private loadMnemonic(): void {
    this.mnemonic = getLocal(MNEMONIC_KEY);
    this.nextMnemonicPathIndex = this.getData(NEXT_MNEMONIC_PATH_INDEX);
  }

  // 加载账户
  private loadAccounts(): void {
    this.accounts = getLocal(ACCOUNTS);
  }

  // 保存账户
  private saveAccounts(): void {
    setLocal(ACCOUNTS, this.accounts);
  }

  // 设置默认词
  public setMnemonic(value: string): void {
    this.mnemonic = value;
    this.init();
    setLocal(MNEMONIC_KEY, this.mnemonic);
    // setLocal(NEXT_MNEMONIC_PATH_INDEX, this.nextMnemonicPathIndex);
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
    throw new Error("error index privateKey");
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
}

export function getWalletController() {
  return new WalletController();
}
