import * as React from "react";
import styled from "styled-components";
// import { colors } from "../styles";
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

const SButtonBlock = styled(Button)`
  width: 100%;
  height: 40px;
`;

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
    console.log("init");
    const { mnemonic } = this.props;
    console.log(mnemonic);
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
      this.props.onSetMnemonic(mnemonic);
    }
  };

  // 导入助记词
  public onImport = async () => {
    console.log("onImport");
  };

  public render() {
    return (
      <SMnemonic>
        <h5>{"Secret Recovery Phrase"}</h5>
        <SField>
          <SInput onChange={this.onInputPhrase} placeholder={"Enter Secret Recovery Phrase"} />
          <SButtonInline onClick={this.onSetMnemonic}>{`SET`}</SButtonInline>
        </SField>
        <SButtonBlock onClick={this.onImport}>{`IMPORT`}</SButtonBlock>
      </SMnemonic>
    );
  }
}

export default SceretPhrase;
