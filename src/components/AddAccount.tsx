import * as React from "react";
import { PlusSquareOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu } from "antd";
import type { MenuProps } from "antd";
// import styled from "styled-components";
import { getAppControllers } from "../controllers";

const onClick: MenuProps["onClick"] = ({ key }) => {
  if (key === "1") {
    getAppControllers().wallet.addAccount();
  }
};

const menu = (
  <Menu
    onClick={onClick}
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

const AddAccount = (props: any) => (
  <Dropdown overlay={menu} placement="bottomLeft">
    <a onClick={e => e.preventDefault()}>
      <Space>
        <PlusSquareOutlined />
        {"Add Account"}
      </Space>
    </a>
  </Dropdown>
);

export default AddAccount;
