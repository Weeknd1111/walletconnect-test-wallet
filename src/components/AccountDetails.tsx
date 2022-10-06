import * as React from "react";
import styled from "styled-components";
import Dropdown from "../components/Dropdown";
import AddAccount from "./AddAccount";
import { IChainData } from "../helpers/types";
import { ellipseAddress, getViewportDimensions } from "../helpers/utilities";
import { responsive } from "../styles";
import Blockie from "./Blockie";

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

// const AccountDetails = (props: IAccountDetailsProps) => {
class AccountDetails extends React.Component<IAccountDetailsProps> {
  public state = {
    accountsMap: [],
    windowWidth: 0,
    maxWidth: 468,
    maxChar: 12,
    ellipseLength: 0,
  };

  // constructor(props: any) {
  //   super(props);
  //   this.state = {
  //     accountsMap: [],
  //     windowWidth: 0,
  //     maxWidth: 468,
  //     maxChar: 12,
  //     ellipseLength: 0,
  //   };
  // }

  public componentDidMount = async () => {
    await this.init();
    await this.updateAccountsMap();
  };

  public componentWillReceiveProps() {
    this.updateAccountsMap();
  }

  public init = async () => {
    try {
      const { maxWidth, maxChar } = this.state;
      const windowWidth = getViewportDimensions().x;
      const ellipseLength =
        windowWidth > maxWidth ? maxChar : Math.floor(windowWidth * (maxChar / maxWidth));
      await this.setState({
        windowWidth,
        ellipseLength,
      });
      return;
    } catch (error) {
      throw error;
    }
  };

  public updateAccountsMap = async () => {
    try {
      const { ellipseLength } = this.state;
      const accountsMap = this.props.accounts.map((addr: string, index: number) => ({
        index,
        display_address: ellipseAddress(addr, ellipseLength),
      }));
      await this.setState({
        accountsMap,
      });
      console.log(accountsMap);
      return;
    } catch (error) {
      throw error;
    }
  };

  public onUpdateAccounts = async () => {
    if (this.props.updateAccounts) {
      this.props.updateAccounts();
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
