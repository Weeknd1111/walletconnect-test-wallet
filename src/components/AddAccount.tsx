import * as React from "react";
import { PlusSquareOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu, Modal, Input, message } from "antd";
import type { MenuProps } from "antd";
// import styled from "styled-components";
import { getAppControllers } from "../controllers";

interface IAddAccountProps {
  updateAccounts?: any;
};

interface IAddAccountState {
  isModalOpen: boolean;
  privateKey: string;
}

class AddAccount extends React.Component<IAddAccountProps> {
  public state: IAddAccountState;

  constructor(props: any) {
    super(props);
    this.state = {
      isModalOpen: false,
      privateKey: "",
    };
  };

  public onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      getAppControllers().wallet.addAccount();
      this.onAddAccount();
      message.success("Creat account successfully");
    }
    if (key === "2") {
      this.showModal();
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

  public onAddAccount = async () => {
    if (this.props.updateAccounts) {
      this.props.updateAccounts();
    }
  };

  public setIsModalOpen = (isModalOpen: boolean) => {
    this.setState({
      isModalOpen,
    });
  };

  public showModal = async () => {
    await this.setState({ privateKey: "" });
    this.setIsModalOpen(true);
  };

  public handleOk = async () => {
    const { privateKey } = this.state;
    if (!privateKey) {
      message.error("Please enter your private key string");
      return;
    }
    try {
      await getAppControllers().wallet.addAccount(privateKey);
      this.onAddAccount();
      this.setIsModalOpen(false);
      message.success("Import account successfully");
    } catch (error) {
      message.error(error.message);
    }
  };

  public handleCancel = () => {
    this.setIsModalOpen(false);
  };

  public onPrivateKeyChange = async (e: any) => {
    const data = e.target.value;
    const privateKey = typeof data === "string" ? data : "";
    if (privateKey) {
      await this.setState({ privateKey });
    }
  };

  public render() {
    const { isModalOpen } = this.state;
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
        <Modal title="Import Account" open={isModalOpen} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Input onChange={this.onPrivateKeyChange} placeholder="Enter your private key string here" />
        </Modal>
      </React.Fragment>
    );
  };
};

export default AddAccount;
