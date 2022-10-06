import * as React from "react";
import styled from "styled-components";
import { Upload, message } from "antd";
import Input from "./Input";
import Button from "./Button";

const SMnemonic = styled.div`
  width: 100%;
`;

const SField = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
`;

const SInput = styled(Input)`
  flex: 1;
  display: block;
  width: 100%;
  font-size: 14px;
  height: 40px;
`;

const SButtonInline = styled(Button)`
  width: 100px;
  margin-left: 10px;
`;

// const SButtonBlock = styled(Button)`
//   width: 100%;
//   height: 40px;
// `;

// const SUpload = styled(Upload)`
//   .ant-upload-select {
//     display: block;
//   }
//   .ant-upload-list {
//     display: none;
//   }
// `;

interface IMnemonicProps {
  mnemonic: string;
  onSetMnemonic: any;
}

class SceretPhrase extends React.Component<IMnemonicProps> {
  public state = {
    mnemonic: "",
  };

  public componentDidMount() {
    this.init();
  }

  public init = async () => {
    const { mnemonic } = this.props;
    this.setState({ mnemonic });
  };

  // 监听助记词输入
  public onInputPhrase = async (e: any) => {
    const data = e.target.value;
    const mnemonic = typeof data === "string" ? data : "";
    if (mnemonic) {
      await this.setState({ mnemonic });
    }
  };

  // 设置助记词
  public onSetMnemonic = async () => {
    const { mnemonic } = this.state;
    if (this.props.onSetMnemonic) {
      await this.props.onSetMnemonic(mnemonic);
    }
  };

  // 导入助记词
  public onImport = async () => {
    console.log("onImport");
  };

  public uploadProps = {
    beforeUpload: (file: { type: string; name: any }) => {
      const isPNG = file.type === "json";
      if (!isPNG) {
        message.error(`${file.name} is not a png file`);
      }
      return isPNG || Upload.LIST_IGNORE;
    },
    onChange: (info: { fileList: any }) => {
      console.log(info.fileList);
    },
  };

  public render() {
    return (
      <SMnemonic>
        <h5>{"Secret Recovery Phrase"}</h5>
        <SField>
          <SInput onChange={this.onInputPhrase} placeholder={"Enter Secret Recovery Phrase"} />
          <SButtonInline onClick={this.onSetMnemonic}>{`SET`}</SButtonInline>
        </SField>
        {/* <SUpload {...this.uploadProps}>
          <SButtonBlock onClick={this.onImport}>{`IMPORT`}</SButtonBlock>
        </SUpload> */}
      </SMnemonic>
    );
  }
}

export default SceretPhrase;
