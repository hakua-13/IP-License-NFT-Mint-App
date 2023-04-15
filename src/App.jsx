import React from 'react';
import { useEffect, useState } from 'react';
// import {ethers} from "ethers";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// import contractABI from './components/contractABI.json';
import './App.css';
import { CreateNft  } from './components/CreateNft';
import { MintPage } from './components/MintPage';

function App() {
  // const CONTRACT_ADDRESS = "0xD2ae811F8Cf8746D31a0C579d382f32Dac1389eb";
  const [ currentAccount, setCurrentAccount ] = useState('');
  const navigate = useNavigate();

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

  const Home = () => {
    return(
      <h2>home</h2>
    )
  };

  const About = () => {
    return(
      <h2>About</h2>
    )
  };

  const LinkTest = () => {
    return(
      <>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/about'>about</Link>
          </li>
        </ul>
        <button className="cta-button" onClick={() => navigate('/about')}>
          about
        </button>

        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/about' element={<About/>} />
        </Routes>
      </>
    )
  }

  return (
    <div className="App">
      <button className="cta-button">connect wallet</button>

      <Routes>
        <Route path='/' element={<MintPage/>}/>
        <Route path='/create' element={<CreateNft/>}/>
      </Routes>

      {/* <CreateNft/>
      <MintPage/> */}
    </div>
  );
}

export default App;
