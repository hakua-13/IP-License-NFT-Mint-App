// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/Base64.sol';


import 'hardhat/console.sol';

interface IPUSHCommInterface {
    function sendNotification(address _channel, address _recipient, bytes calldata _identity) external;
}

contract IpNftLicense is ERC721{

  event nftMinted(address _sender, uint256 _id);
  event nftRegistered(address _sender, uint256 _id);

  struct TicketAttributes{
    string name;
    string imageURI;
    uint256 startDate;
    uint256 expirationDays;
    uint256 price;
    uint256 depositPrice;
    address owner;
  }
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  address public EPNS_COMM_CONTRACT_ADDRESS_FOR_SPECIFIC_BLOCKCHAIN = 0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa;

  mapping(uint256 => TicketAttributes) public nftHolderAttributes;
  mapping(uint256 => uint256) public depositAmountMap;
  mapping(uint256 => bool) public isDepositLockedMap;
  mapping(address => uint256) public revenueBalanceMap;

  mapping(uint256 => uint256) public maxMint;
  mapping(uint256 => Counters.Counter) mintCount;

  TicketAttributes[] mintableIps;
  Counters.Counter private _mintableTokenIds;

  

  constructor()ERC721("IP License NFT", "IPLIC"){}

  function mintNft(uint256 _mintNftId, uint256 startDate)public payable{
    require(mintCount[_mintNftId].current() < maxMint[_mintNftId], "upper limit");
    TicketAttributes memory mintableIp = mintableIps[_mintNftId];
    uint256 price = mintableIp.price + mintableIp.depositPrice;
    require(msg.value == price , 'eth discrepancy');

    uint256 newTokenId = _tokenIds.current();
    isDepositLockedMap[newTokenId] = true;
    depositAmountMap[newTokenId] = mintableIp.depositPrice;
    revenueBalanceMap[mintableIp.owner] += mintableIp.price;
    

    _safeMint(msg.sender, newTokenId);
    // nftHolderAttributes[newTokenId] = mintableIps[_mintNftId];
    nftHolderAttributes[newTokenId] = TicketAttributes({
      name: mintableIp.name,
      imageURI: mintableIp.imageURI,
      startDate: startDate,
      expirationDays: mintableIp.expirationDays,
      price: mintableIp.price,
      depositPrice: mintableIp.depositPrice,
      owner: mintableIp.owner
    });

    mintCount[_mintNftId].increment();
    _tokenIds.increment();

    string memory message = string(abi.encodePacked("mintedNFT mintableId-", Strings.toString(_mintNftId)));
    sendNotification(message);
    emit nftMinted(msg.sender, newTokenId);
  }

  function tokenURI(uint256 _tokenId)public view override returns(string memory){
    TicketAttributes memory ticketAttribute = nftHolderAttributes[_tokenId];
    string memory startDateStr = Strings.toString(ticketAttribute.startDate);
    string memory expirationDateStr = Strings.toString(ticketAttribute.startDate + ticketAttribute.expirationDays);
    string memory json = Base64.encode(abi.encodePacked('{"name": "', ticketAttribute.name, '", "image": "', ticketAttribute.imageURI, '", "description": "test###","attributes":[{"trait_type": "Start Date","display_type": "date", "value": ', startDateStr,'}, {"trait_type": "Expiration Date","display_type": "date", "value": ', expirationDateStr,'}]}'));

    string memory output = string(abi.encodePacked("data:application/json;base64,", json));
    return output;
  }

  function registerIpLicenseNft(string memory _name, string memory _imageURI, uint256 _expirationDays,  uint256 _price, uint256 _depositPrice, uint256 _maxMint)public{
    uint256 newMintableTokenId = _mintableTokenIds.current();

    mintableIps.push(TicketAttributes({
      name: _name,
      imageURI: _imageURI,
      startDate: 0,
      expirationDays: _expirationDays,
      price: _price,
      depositPrice: _depositPrice,
      owner: msg.sender
    }));

    maxMint[newMintableTokenId] = _maxMint;
    _mintableTokenIds.increment();

    emit nftRegistered(msg.sender, newMintableTokenId);
  }

  function withdrawDeposit(uint256 _tokenId)public{
    require(isDepositLockedMap[_tokenId] == false, 'locked deposit');
    require(msg.sender == _ownerOf(_tokenId),'not owner');
    uint256 depositEth = depositAmountMap[_tokenId];
    depositAmountMap[_tokenId] = 0;
    payable(address(msg.sender)).transfer(depositEth);
  }

  function withdrawRevenue() public {
    uint256 revenueBalance = revenueBalanceMap[msg.sender];
    revenueBalanceMap[msg.sender] = 0;
    payable(address(msg.sender)).transfer(revenueBalance);
  }

  function unLockDeposit(uint256 _tokenId) public{
    require(isDepositLockedMap[_tokenId], 'Deposit is unlocked');
    address owner = nftHolderAttributes[_tokenId].owner;
    require(msg.sender == owner, 'not owner');

    isDepositLockedMap[_tokenId] = false;
    string memory message = string(abi.encodePacked("unLockedDeposit tokenId#", _tokenId));
    sendNotification(message);
  }

  // デポジットの没収
  function forfeitDeposit(uint256 _tokenId) public {
    address owner = nftHolderAttributes[_tokenId].owner;
    require(msg.sender == owner, 'not owner');
    uint256 depositEth = depositAmountMap[_tokenId];
    depositAmountMap[_tokenId] = 0;
    payable(address(msg.sender)).transfer(depositEth);
  }

  function getAllMintableIps() public view returns(TicketAttributes [] memory){
    return mintableIps;
  }

  function getMintCount(uint256 nftId) public view returns(uint256){
    return mintCount[nftId].current();
  }

  function sendNotification(string memory message) public{
        IPUSHCommInterface(EPNS_COMM_CONTRACT_ADDRESS_FOR_SPECIFIC_BLOCKCHAIN).sendNotification(
            0xc9d7144d4Bb4fF5936D1540faaeeFd0201b5fdf8, // from channel - recommended to set channel via dApp and put it's value -> then once contract is deployed, go back and add the contract address as delegate for your channel
            address(this), // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "1", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                        "+", // segregator
                        "Title", // this is notificaiton title
                        "+", // segregator
                        message,
                        ": ",
                        msg.sender // notification body
                    )
                )
            )
        );
    }
}