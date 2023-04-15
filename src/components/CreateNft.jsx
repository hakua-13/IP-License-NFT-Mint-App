import React, { useState } from 'react';
import {ethers} from "ethers";

import { CONTRACT_ADDRESS } from './constans'
import contractABI from './contractABI.json';

export const CreateNft = () => {
  // const CONTRACT_ADDRESS = "0xD2ae811F8Cf8746D31a0C579d382f32Dac1389eb";

  const [ name, setName ] = useState('');
  const [ imageURI, setImageURI ] = useState('');
  const [ expirationDays, setExpirationDays ] = useState();
  const [ price, setPrice ] = useState();
  const [ depositPrice, setDepositPrice ] = useState();
  const [ maxMint, setMaxMint ] = useState();

  const registerIpLicenseNft = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI.abi,
      signer
    )

    const expirationInt = Number(expirationDays) * 86400;
    const priceFormat = ethers.utils.parseEther(price);
    const depositPriceFormat = ethers.utils.parseEther(depositPrice);

    const registerNftTxn = await contract.registerIpLicenseNft(name, imageURI, expirationInt, priceFormat, depositPriceFormat, maxMint);
    await registerNftTxn.wait();
  }
  return(
    <div className='CreateNft'>
      <h2 className="title">CreateNft</h2>
      <p>name</p>
      <input onChange={(e) => setName(e.target.value)} value={name}/>
      <p>imageURI</p>
      <input onChange={(e) => setImageURI(e.target.value)} value={imageURI}/>
      <p>expiration days (unit: day)</p>
      <input onChange={(e) => setExpirationDays(e.target.value)} value={expirationDays} type="number" />
      <p>price (unit: eth)</p>
      <input onChange={(e) => setPrice(e.target.value)} value={price} type="number"/>
      <p>deposit price (unit: eth)</p>
      <input onChange={(e) => setDepositPrice(e.target.value)} value={depositPrice} type="number"/>
      <p>max mint</p>
      <input onChange={(e) => setMaxMint(e.target.value)} value={maxMint} type="number"/>

      <button className="cta-button" onClick={registerIpLicenseNft}>register NFT</button>

    </div>
  )
}