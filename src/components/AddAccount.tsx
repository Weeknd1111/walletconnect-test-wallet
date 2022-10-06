import * as React from "react";
import { PlusSquareOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu, Modal, Input, message } from "antd";
import type { MenuProps } from "antd";
import { getAppControllers } from "../controllers";

interface IAddAccountProps {
  updateAccounts?: any;
};

interface IAddAccountState {
  isImportModalOpen: boolean;
  privateKey: string;
}

class AddAccount extends React.Component<IAddAccountProps> {
  public state: IAddAccountState;

  constructor(props: any) {
    super(props);
    this.state = {
      isImportModalOpen: false,
      privateKey: "",
    };
  };

  public onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      this.creatAccount();
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
    if (this.props.updateAccounts) {
      this.props.updateAccounts();
    }
  };

  // 创建账户
  public creatAccount = async () => {
    try {
      await getAppControllers().wallet.addAccount();
      this.onAddAccount();
      message.success("Creat account successfully");
    } catch (error) {
      message.error(error.message);
    }
  };

  public setIsImportModalOpen = (isImportModalOpen: boolean) => {
    this.setState({
      isImportModalOpen,
    });
  };

  public showImportAccountModal = async () => {
    await this.setState({ privateKey: "" });
    this.setIsImportModalOpen(true);
  };

  // 确定导入账户
  public handleImportAccountOk = async () => {
    const { privateKey } = this.state;
    if (!privateKey) {
      message.error("Please enter your private key string");
      return;
    }
    try {
      await getAppControllers().wallet.addAccount(privateKey);
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

  public onPrivateKeyChange = async (e: any) => {
    const data = e.target.value;
    const privateKey = typeof data === "string" ? data : "";
    if (privateKey) {
      await this.setState({ privateKey });
    }
  };

  public render() {
    const { isImportModalOpen } = this.state;
    return (
      <React.Fragment>
        <Dropdown overlay={this.menu} placement="bottomLeft">
          <a onClick={e => e.preventDefault()}>
            <Space>
              <PlusSquareOutlined />
              {"Add Account"}
            </Space>
          </a>
        </Dropdown>
        <Modal title="Import Account" open={isImportModalOpen} onOk={this.handleImportAccountOk} onCancel={this.handleImportAccountCancel}>
          <Input onChange={this.onPrivateKeyChange} placeholder="Enter your private key string here" />
        </Modal>
      </React.Fragment>
    );
  };
};

export default AddAccount;
