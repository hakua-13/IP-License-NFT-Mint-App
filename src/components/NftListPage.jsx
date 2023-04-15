import {ethers} from "ethers";
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { CONTRACT_ADDRESS } from './constans';
import contractABI from './contractABI.json';

export const NftListPage = () => {
  const [ mintableIps, setMintableIps ] = useState([]);
  const navigate = useNavigate();


  const getMintableIps = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const singer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI.abi,
      singer
    )

    const mintableIpsTxn = await contract.getAllMintableIps();
    console.log("---- mintableIps txn ----");
    console.log(mintableIpsTxn[0]);

    const mintableIps = mintableIpsTxn.map((mintableIp) => {
      return{
        name: mintableIp.name,
        imageURI: mintableIp.imageURI,
        // startDate: mintableIp.startDate.toNumber(),
        expirationDays: mintableIp.expirationDays.toNumber(),
        price: ethers.utils.formatEther(mintableIp.price),
        depositPrice: ethers.utils.formatEther(mintableIp.depositPrice),
        owner: mintableIp.owner,
      }
    })
    
    setMintableIps(mintableIps);
    console.log('mintableIps: ', mintableIps);
  }

  useEffect(() => {
    console.log('first render mintpage');
    getMintableIps();
  }, [])

  return(
    <>
      <div className="nftListContainer">
        {mintableIps.map((mintableIp, index) => {
          console.log('index: ', index);
          return(
            <div key={index} className="nftListCard">
              <p>name: {mintableIp.name}</p>
              <img src={mintableIp.imageURI} alt="imageURI"></img>
              <p>price: {mintableIp.price} ETH</p>
              <p>depositPrice: {mintableIp.depositPrice} ETH</p>
              <p>expiration: {mintableIp.expirationDays / 86400} days</p>
              {/* indexが0の場合stateがundefinedになってしまうため+1する */}
              <button onClick={() => navigate("/mint", { state: index+ 1 })} className='cta-button'>detail / mint</button>
            </div>
          )
        })}

      </div>
      <button className="cta-button nftList" onClick={() => navigate("/create")}>register NFT Page</button>
    </>
  )
}