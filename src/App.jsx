import React from 'react';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// import contractABI from './components/contractABI.json';
import './App.css';
import { RegisterNft  } from './components/RegisterNft';
import { NftListPage } from './components/NftListPage';
import { MintPage } from './components/MintPage';

function App() {
  const [ currentAccount, setCurrentAccount ] = useState('');

  const checkIfWalletIsConnected = async() => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        return;
      }
      const chainId = await ethereum.request({method: 'eth_chainId'});
      console.log('chainId: ', chainId);
      if(chainId !== "0x5"){
        alert('switch to goerli chain');
      }

      const accounts = await ethereum.request({method: "eth_accounts"});
      if(accounts.length > 0){
        setCurrentAccount(accounts[0]);
      }
    }catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    console.log('useEffect');
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    
  },[currentAccount]);

  const connectWallet = async() => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      if(accounts.length > 0){
        setCurrentAccount(accounts[0]);
      }
    }catch(error){
      console.log(error);
    }
  }

  return (
    <div className="App">
      {!currentAccount && (
        <button className="cta-button" onClick={connectWallet}>connect wallet</button>
      )}

      <Routes>
        <Route path='/' element={<NftListPage/>}/>
        <Route path='/create' element={<RegisterNft/>}/>
        <Route path='/mint' element={<MintPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
