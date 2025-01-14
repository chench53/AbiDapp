import React, {useState, useEffect } from "react";
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider'

import { creditABI, creditAddress, nftABI, nftAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

// const { ethereum } = window;
var ethereumProvider = null;

const getEthereum = async () => {
  if (!ethereumProvider) {
    ethereumProvider = await detectEthereumProvider()
    window.ethereum = ethereumProvider; // for compatibility
  }
  return ethereumProvider;
}


const createCreditContract = async () => {
  const ethereum = await getEthereum();
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const creditContract = new ethers.Contract(
    creditAddress,
    creditABI,
    signer
  );

  return creditContract;
};

const createNftContract = async () => {
  const ethereum = await getEthereum();
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const NftContract = new ethers.Contract(
    nftAddress,
    nftABI,
    signer
  );

  return NftContract;
};

export const TransactionProvider = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState({
    address: null,
    balance: null,
  });

  const [error, setError] = useState(null);
  useEffect(() => {
    if (error) 
      console.log(error)
  }, [error])

  const [currentAccount, setCurrentAccount] = useState('');

  const handleChange = (e, name) => {
    setWalletInfo((prevState) => ({ ...prevState, [address]: e.target.value }));
  };

  const checkIfWalletIsConnect = async () => {
    const ethereum = await getEthereum();
    try {
      if (!ethereum) {
        setError("Please install MetaMask.");
        return alert('Please install MetaMask.');
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        if (ethereum.networkVersion !== '4') {
          setError('Please connect to the Rinkeby test network.');
        }
      }

    } catch (error) {
      console.log('No Wallet Connected Error:', error);
      setError('No Wallet Connected Error:', error);
      throw new Error('No Account Connected');
    }
  };

  const connectWallet = async () => {
    const ethereum = await getEthereum();
    setError(null)
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      try {
        const { chainId } = await provider.getNetwork()
        // if (chainId.toString() !== network.mumbai.chainId) {
        //   handleNetworkChange()
        // }
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setCurrentAccount(address);
        setError(null)
      } catch (error) {
        setError("Error Connecting Wallet...")
        console.error(error)
      }
    } else {
      setError("Metamask is not installed")
    }
  };

  const approve = async () => {
    const ethereum = await getEthereum();
    try {
      if (ethereum) {
        const creditContract = createCreditContract();
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  });

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        handleChange,
        error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
