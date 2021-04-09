import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import CenterCard363 from "./centerCard363"
import { signPersonalMessage } from '../utils';

const Home = () => {

  const localStorageEthAccount = localStorage.getItem("ethAccount");
  const localStorageNFTList = JSON.parse(localStorage.getItem("nftList"));

  const [accountConnected, setAccountConnected] = useState(false);
  const [connector, setConnector] = useState();
  const [ethAccount, setEthAccount] =  useState(localStorageEthAccount ? localStorageEthAccount : "");
  const [nftList, setNftList] = useState(localStorageNFTList ? localStorageNFTList : "");


  const createNFTTokenURL = (walletAddress) => {
    return `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${walletAddress}&startblock=0&endblock=999999999&sort=asc&apikey=M2FJABY1V2USTHUEXF1HTMPYFEMW66J55P`
  }
  
  const checkAddressForNFT = async (walletAddress) => {
    const url = createNFTTokenURL(walletAddress)
    const response = await Axios.get(url,
      { 
        transformRequest: (data, headers) => {
          delete headers.common['Authorization']
        }
      }
    );

    const NFT = response.data;
    if ( NFT.message === "OK") {
      const NFTList = NFT.result;
      console.log(NFTList);
      setNftList(NFTList);
      const stringifiedNFTList = JSON.stringify(NFTList);
      localStorage.setItem("nftList", stringifiedNFTList);
      }
      return false;    
  }
  
  const connectWallet = () => {

    const walletConnect = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });

    // Check if connection is already established
    if (!walletConnect.connected) {
      // create new session
      walletConnect.createSession();
    } else {
      // Sometimes a session is left in the wrong state. Kill and reset
      walletConnect.killSession().then(() => walletConnect.createSession());
    }
    
    // Subscribe to connection events
    walletConnect.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
    
      // Get provided accounts and chainId
      const { accounts } = payload.params[0];
      console.log(payload);
      setConnector(walletConnect);
      setEthAccount(accounts[0])
      localStorage.setItem("ethAccount", accounts[0]);
      setAccountConnected(true);
      checkAddressForNFT(accounts[0]);
    });
    
    walletConnect.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log('Session update')
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(accounts);
      console.log(payload);
    });
    
    walletConnect.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }
      resetState();
    });
  }

  const disconnectWallet = () => {
    if(connector){
      connector.killSession();
    }
    resetState();
  }

  const resetState = () => {
    setAccountConnected(false);
    setConnector();
    setEthAccount();
    setNftList();
    localStorage.removeItem("ethAccount");
    localStorage.removeItem("nftList");
  }

  const sendMessageToWallet = async () => {
    await signPersonalMessage(ethAccount, connector, "Hello there");
  }

  const renderConnectButton = () => {
    if(accountConnected || ethAccount){
      return (
      <div>
        <p className="text-muted">ETH Address: {ethAccount} ☀</p>
        <button className="btn btn-light btn-lg btn-block" onClick={disconnectWallet}>Disconnect</button>
        <button className="btn btn-light btn-lg btn-block" onClick={sendMessageToWallet}>Sign Message</button>
      </div>
      )
    } else {
      return (
        <button className="btn btn-light btn-lg btn-block" onClick={connectWallet}>Click to connect wallet</button>
      )
    }
  }

  const renderNFTList = () => {
    if(nftList && nftList.length > 0 ){
      const list = nftList.map((item) => {
        return <li className="list-group-item" key={item.contractAddress + item.tokenID}>{item.tokenName} ID: {item.tokenID}</li> 
      });
      return (
        <ul className="list-group nft-list">
          {list}
        </ul>
      )
    }
  }

  return (
    <CenterCard363>
      <div className='card border-secondary'>
        <h4 className="card-header">
          Check your wallet for NFT Redemptions
        </h4>
        <div className='card-body'>
          {renderConnectButton()}
          {renderNFTList()}
        </div>
      </div>
    </CenterCard363>
  );
}

export default Home;
  




