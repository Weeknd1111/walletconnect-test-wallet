## 20221002
### 新增接口
src/controllers/wallet.ts
- setMnemonic(value : string) 设置助记词
- addAccount(privateKey? : string) 添加一个账户 
- removeAccount(index : number) 删除账户
- getAccounts() : string[] 获取账号列表
- getPrivateKey(index: number) :string 获取账户私钥

## 20221006
### 新增接口
1. src/controllers/wallet.ts
- 账户备注 IAccount.name
- 设置备注 setName(index: number, name: string): void
- 获取账户备注 getName(index: number): string

## 20221007
1. 更新账户储存，减少序列化
2. 测试助记词
- act oyster page lounge engage evil isolate current winter two woman panda
3. 增加导入导出接口
- src/controllers/wallet.ts 
    - 导出数据 exportConfig(): string
    - 导入数据 importConfig(value: string): void

## 20221008
1. 地址转换账户
- src/controllers/wallet.ts 
    - public addrToAccount(addr : string) : IAccount
    - public addrsToAccounts(addrs : string []) : IAccount[]