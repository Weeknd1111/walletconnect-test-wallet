import * as React from "react";
import styled from "styled-components";
import { PlusSquareOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu, Modal, Input, message } from "antd";
import type { MenuProps } from "antd";
import { getAppControllers } from "../controllers";

const SDropdown = styled(Dropdown)`
  font-size: 14px;
  margin-right: 5px;
`;

const SInput = styled(Input)`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`;

interface IAddAccountProps {
  onAddAccount?: any;
};

interface IAddAccountState {
  isCreatModalOpen: boolean;
  isImportModalOpen: boolean;
  accountName: string;
  privateKey: string;
}

class AddAccount extends React.Component<IAddAccountProps> {
  public state: IAddAccountState;

  constructor(props: any) {
    super(props);
    this.state = {
      isCreatModalOpen: false,
      isImportModalOpen: false,
      accountName: "",
      privateKey: "",
    };
  };

  public onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      this.showCreatAccountModal();
    }
    if (key === "2") {
      this.showImportAccountModal();
    }
  };

  public menu = (
    <Menu
      onClick={this.onClick}
      items={[
        {
          key: "1",
          label: "Creat Account",
        },
        {
          key: "2",
          label: "Import Account",
        },
      ]}
    />
  );

  // 监听添加账户
  public onAddAccount = async () => {
    if (this.props.onAddAccount) {
      this.props.onAddAccount();
    }
  };

  public setIsCreatModalOpen = (isCreatModalOpen: boolean) => {
    this.setState({
      isCreatModalOpen,
    });
  };

  public showCreatAccountModal = async () => {
    const accountName = await getAppControllers().wallet.newAccountName();
    await this.setState({
      accountName,
    });
    this.setIsCreatModalOpen(true);
  };

  // 确定创建账户
  public handleCreatAccountOk = async () => {
    const { accountName } = this.state;
    if (!accountName) {
      message.error("Please enter account name");
      return;
    }
    try {
      await getAppControllers().wallet.addAccount();
      this.onAddAccount();
      this.setIsCreatModalOpen(false);
      message.success("Creat account successfully");
    } catch (error) {
      message.error(error.message);
    }
  };

  public handleCreatAccountCancel = () => {
    this.setIsCreatModalOpen(false);
  };

  public setIsImportModalOpen = (isImportModalOpen: boolean) => {
    this.setState({
      isImportModalOpen,
    });
  };

  public showImportAccountModal = async () => {
    const accountName = await getAppControllers().wallet.newAccountName();
    await this.setState({
      accountName,
      privateKey: "",
    });
    this.setIsImportModalOpen(true);
  };

  // 确定导入账户
  public handleImportAccountOk = async () => {
    const { accountName, privateKey } = this.state;
    if (!privateKey) {
      message.error("Please enter your private key string");
      return;
    }
    try {
      await getAppControllers().wallet.addAccount(privateKey, accountName);
      this.onAddAccount();
      this.setIsImportModalOpen(false);
      message.success("Import account successfully");
    } catch (error) {
      message.error(error.message);
    }
  };

  public handleImportAccountCancel = () => {
    this.setIsImportModalOpen(false);
  };

  public onAccountNameChange = async (e: any) => {
    const data = e.target.value;
    const accountName = typeof data === "string" ? data : "";
    if (accountName) {
      await this.setState({ accountName });
    }
  };

  public onPrivateKeyChange = async (e: any) => {
    const data = e.target.value;
    const privateKey = typeof data === "string" ? data : "";
    if (privateKey) {
      await this.setState({ privateKey });
    }
  };

  public render() {
    const { isCreatModalOpen, isImportModalOpen, accountName } = this.state;
    return (
      <React.Fragment>
        <SDropdown overlay={this.menu} placement="bottomLeft">
          <a onClick={e => e.preventDefault()}>
            <Space>
              <PlusSquareOutlined />
              {"Add Account"}
            </Space>
          </a>
        </SDropdown>
        <Modal title="Creat Account" open={isCreatModalOpen} onOk={this.handleCreatAccountOk} onCancel={this.handleCreatAccountCancel}>
          <SInput value={accountName} onChange={this.onAccountNameChange} placeholder="Enter account name string here" />
        </Modal>
        <Modal title="Import Account" open={isImportModalOpen} onOk={this.handleImportAccountOk} onCancel={this.handleImportAccountCancel}>
          <SInput value={accountName} onChange={this.onAccountNameChange} placeholder="Enter account name string here" />
          <SInput onChange={this.onPrivateKeyChange} placeholder="Enter your private key string here" />
        </Modal>
      </React.Fragment>
    );
  };
};

export default AddAccount;
