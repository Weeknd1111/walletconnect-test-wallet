## 账户来源

1. 启动初始化
src/App.tsx
 - INITIAL_STATE
 - DEFAULT_ACCOUNTS

2. 每次启动都新账户生成
src/controllers/wallet.ts
 - getAccounts

## 修改内容
1. 导入一份默认的词
 - 当前词的索引

2. 账户内容
 - 地址
 - 来源（词/导入私钥)
 - 词对应的index
 - 私钥（导入私钥/词的index私钥）

## 接口
src/controllers/wallet.ts
- setMnemonic(value : string) 设置助记词
- addAccount(privateKey? : string) 添加一个账户 
- removeAccount(index : number) 删除账户
- getAccounts() : string[] 获取账号列表
- getPrivateKey(index: number) :string 获取账户私钥