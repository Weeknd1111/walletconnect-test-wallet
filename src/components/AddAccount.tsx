import * as React from "react";
import { PlusSquareOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu } from "antd";
import type { MenuProps } from "antd";
// import styled from "styled-components";
import { getAppControllers } from "../controllers";

interface IAddAccountProps {
  updateAccounts?: any;
};

class AddAccount extends React.Component<IAddAccountProps> {
  public state = {
  };

  public onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      getAppControllers().wallet.addAccount();
      this.onAddAccount();
    }
    if (key === "2") {
      getAppControllers().wallet.addAccount("ad888a3ba96ae8d2c96d7d692f734f6ebadda6e83ebfad190a582f0f34538208");
      this.onAddAccount();
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

  public render() {
    return <Dropdown overlay={this.menu} placement="bottomLeft">
      <a onClick={e => e.preventDefault()}>
        <Space>
          <PlusSquareOutlined />
          {"Add Account"}
        </Space>
      </a>
    </Dropdown>;
  };
};

export default AddAccount;
