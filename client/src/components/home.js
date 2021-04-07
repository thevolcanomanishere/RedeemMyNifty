import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import CenterCard363 from "./centerCard363"

const Home = () => {

  const [accountConnected, setAccountConnected] = useState(false);
  const [ethAccount, setEthAccount] =  useState();
  const [nftList, setNftList] = useState();

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
      }
      return false;    
  }

  const connectWallet = () => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    
    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();
    }
    
    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
    
      // Get provided accounts and chainId
      const { accounts } = payload.params[0];
      console.log(payload);
      setEthAccount(accounts[0])
      setAccountConnected(true);
      checkAddressForNFT(accounts[0]);
    });
    
    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log('Session update')
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(accounts);
      console.log(payload);
    });
    
    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }
      setAccountConnected(false);
    });
  }

  const renderConnectButton = () => {
    if(accountConnected){
      return (
      <div>
        <p className="text-muted">ETH Address: {ethAccount} ☀</p>
      </div>
      )
    } else {
      return (
        <button className="btn btn-light btn-lg btn-block" onClick={connectWallet}>Click to connect wallet</button>
      )
    }
  }

  const renderNFTList = () => {
    if(accountConnected && nftList && nftList.length > 0 ){
      const list = nftList.map((item) => {
        return <li key={item.contractAddress + item.tokenID}>{item.tokenName} ID: {item.tokenID}</li>
    });
      return (
        <div>
          {list}
        </div>
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
  




