import * as React from "react";
import styled from "styled-components";
import Dropdown from "../components/Dropdown";
import AddAccount from "./AddAccount";
import { IChainData } from "../helpers/types";
import { ellipseAddress, getViewportDimensions } from "../helpers/utilities";
import { responsive } from "../styles";
import Blockie from "./Blockie";
import { getAppControllers } from "../controllers";

const SSection = styled.div`
  width: 100%;
`;

const SAccountHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SBlockie = styled(Blockie)`
  margin-right: 5px;
  @media screen and (${responsive.xs.max}) {
    margin-right: 1vw;
  }
`;

const SAddressDropdownWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface IAccountDetailsProps {
  chains: IChainData[];
  updateAddress?: any;
  updateChain?: any;
  updateAccounts?: any;
  accounts: string[];
  activeIndex: number;
  address: string;
  chainId: number;
}

interface IAccountDetailsState {
  accountsMap: any[] | object;
  windowWidth: number;
  maxWidth: number;
  maxChar: number;
  ellipseLength: number;
}

class AccountDetails extends React.Component<IAccountDetailsProps> {
  public state: IAccountDetailsState;

  constructor(props: any) {
    super(props);
    const windowWidth = getViewportDimensions().x;
    const maxWidth = 468;
    const maxChar = 12;
    this.state = {
      accountsMap: [],
      windowWidth,
      maxWidth,
      maxChar,
      ellipseLength:
        windowWidth > maxWidth ? maxChar : Math.floor(windowWidth * (maxChar / maxWidth)),
    };
  }

  public componentDidMount = async () => {
    await this.updateAccountsMap();
  };

  public componentWillReceiveProps = async () => {
    await this.updateAccountsMap();
  };

  public updateAccountsMap = async () => {
    try {
      const { ellipseLength } = this.state;
      const accounts = getAppControllers().wallet.getAccounts();
      const accountsMap = accounts.map((addr: string, index: number) => ({
        index,
        display_address: ellipseAddress(addr, ellipseLength),
      }));
      await this.setState({
        accountsMap,
      });
      this.forceUpdate(); // 强制更新组件视图
      return;
    } catch (error) {
      throw error;
    }
  };

  public onUpdateAccounts = async () => {
    if (this.props.updateAccounts) {
      await this.props.updateAccounts();
    }
  };

  public render() {
    const { chains, chainId, address, activeIndex, updateAddress, updateChain } = this.props;
    const { accountsMap } = this.state;
    return (
      <React.Fragment>
        <SSection>
          <SAccountHead>
            <h6>{"Account"}</h6>
            <AddAccount updateAccounts={this.onUpdateAccounts} />
          </SAccountHead>
          <SAddressDropdownWrapper>
            <SBlockie size={40} address={address} />
            <Dropdown
              monospace
              selected={activeIndex}
              options={accountsMap}
              displayKey={"display_address"}
              targetKey={"index"}
              onChange={updateAddress}
            />
          </SAddressDropdownWrapper>
        </SSection>
        <SSection>
          <h6>{"Network"}</h6>
          <Dropdown
            selected={chainId}
            options={chains}
            displayKey={"name"}
            targetKey={"chain_id"}
            onChange={updateChain}
          />
        </SSection>
      </React.Fragment>
    );
  }
}
export default AccountDetails;
