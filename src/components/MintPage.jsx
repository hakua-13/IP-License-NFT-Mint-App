import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from "ethers";

import { CONTRACT_ADDRESS } from './constans';
import contractABI from './contractABI.json';
import DateSelector from './DateSelector';


export const MintPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mintableIpIndex = location.state - 1;
  console.log(mintableIpIndex);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ mintableIp, setMintableIp ] = useState();

  
  const getMintableIp = async() => {
    const {ethereum} = window;
    if(!ethereum){
      return;
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const singer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI.abi,
      singer
    )

    const maxMint = await contract.maxMint(mintableIpIndex);
    const mintCount = await contract.getMintCount(mintableIpIndex);

    const mintableIpsTxn = await contract.getAllMintableIps();
    const mintableIpTxn = mintableIpsTxn[mintableIpIndex];
    const mintableIp = {
      name: mintableIpTxn.name,
      imageURI: mintableIpTxn.imageURI,
      // startDate: mintableIpTxn.startDate.toNumber(),
      expirationDays: mintableIpTxn.expirationDays.toNumber(),
      price: ethers.utils.formatEther(mintableIpTxn.price),
      depositPrice: ethers.utils.formatEther(mintableIpTxn.depositPrice),
      owner: mintableIpTxn.owner,
      mintCount: mintCount.toNumber(),
      maxMint: maxMint.toNumber()
    }


    setMintableIp(mintableIp);
  };

  const mintNft = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI.abi,
      signer
    );

    const priceEth = String(Number(mintableIp.price) + Number(mintableIp.depositPrice));
    const startDate = Math.floor(selectedDate.getTime() / 1000);

    const mintTxn = await contract.mintNft(mintableIpIndex, startDate, {
      value: ethers.utils.parseEther(priceEth)
    })
    await mintTxn.wait();
  }
  
  const goBackToNftListPage = () => {
    navigate('/');
  };

  useEffect(() => {
    console.log('location: ', location.state);
    console.log('typeof location: ', typeof location.state);
    getMintableIp();
  }, [])

  return(
    <div className='mintPageContainer'>
      <div className="mintPageCard">
        {mintableIp && (
          <>
            <img src={mintableIp.imageURI} alt="imageURI"></img>
            <p>name: {mintableIp.name}</p>
            <p>price: {mintableIp.price} ETH</p>
            <p>depositPrice: {mintableIp.depositPrice} ETH</p>
            <p>totalPrice: {Number(mintableIp.price) + Number(mintableIp.depositPrice)} ETH</p>
            <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            <p>expiration: {mintableIp.expirationDays / 86400} days</p>
            <p>{`mint: ${mintableIp.mintCount} / ${mintableIp.maxMint}`}</p>
          </>
        )}
        <button onClick={mintNft} className="cta-button">mint</button>
      </div>
      <button onClick={goBackToNftListPage} className="cta-button">Back to NFT list</button>
    </div>
  )
}