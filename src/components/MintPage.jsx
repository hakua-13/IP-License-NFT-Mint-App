import {ethers} from "ethers";
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { CONTRACT_ADDRESS } from './constans';
import contractABI from './contractABI.json';
import DateSelector from "./DateSelector";

export const MintPage = () => {
  const [ mintableIps, setMintableIps ] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const mintNft = async(id) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const singer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI.abi,
      singer
    )

    const priceEth = String(Number(mintableIps[id].price) + Number(mintableIps[id].depositPrice));

    const mintTxn = await contract.mintNft(id, 100000, {
      value: ethers.utils.parseEther(priceEth)
    });
    await mintTxn.wait();
  }

  useEffect(() => {
    console.log('first render mintpage');
    getMintableIps();
  }, [])

  const getDate2 = () => {
    console.log('start date2: ', selectedDate);
  }

  return(
    <div>
      {mintableIps.map((mintableIp, index) => {
        return(
          <div key={index}>
            <p>name: {mintableIp.name}</p>
            <img src={mintableIp.imageURI} alt="imageURI"></img>
            <p>price: {Number(mintableIp.price) + Number(mintableIp.depositPrice)} ETH</p>
            <p>expiration: {mintableIp.expirationDays / 86400} days</p>
            <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            <button onClick={() => mintNft(index)} className="cta-button">mint</button>
            <button onClick={getDate2}>get date</button>
          </div>
        )
      })}

      <button className="cta-button" onClick={() => navigate("/create")}>page</button>
    </div>
  )
}