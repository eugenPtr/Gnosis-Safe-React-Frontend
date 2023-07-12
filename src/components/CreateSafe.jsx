import {
    useAccount,
    useConnect,
    useContract,
    useContractRead,
    useContractWrite,
    useNetwork,
    useWaitForTransaction,
    useWalletClient,
} from "wagmi";

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import proxyFactoryAbi from "../abi/proxyFactoryAbi.json"; 
import singletonAbi from "../abi/singletonAbi.json"; 
////////////////////////
export function walletClientToSigner(walletClient) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new ethers.providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}
 
/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner( { chainId } = {}) {
  const { walletClient } = useWalletClient({ chainId })
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient): undefined),
    [walletClient],
  )
}


////////////////////////////

export default function CreateSafe() {

  const [factoryContractAddress, setFactoryContractAddress] = useState()
  const [singletonAddress, setSingletonAddress] = useState()

  const { chain } = useNetwork()
  const {address} = useAccount()


  let proxyFactory
  let proxyFactoryJson 
  let singleton
  let singletonJson
  let chainId

  async function fetchSafeData() {
    
    
    singleton =  await fetch(
      "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json"
      );

    singletonJson = await singleton.json()
    setSingletonAddress(singletonJson.networkAddresses[chainId.toString()])

    proxyFactory =  await fetch(
      "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/proxy_factory.json"
      );
    proxyFactoryJson = await proxyFactory.json()
    setFactoryContractAddress(proxyFactoryJson.networkAddresses[chainId.toString()])
   
  }
  if (!chain) {
    return "Please connect wallet"
  }
  else {
    chainId = chain.id;
    fetchSafeData();
    const iface = new ethers.utils.Interface(singletonAbi);
    const ownersAddress = [address];
    const address0 = "0x0000000000000000000000000000000000000000";
    const bytes0 = new Uint8Array(0);
    const encodedData = iface.encodeFunctionData(
      "setup(address[],uint256, address,bytes, address, address, uint256, address)",
      [ownersAddress, 1, address0, bytes0, address0, address0, 0, address0]
    );

    //Instanciate contract
    const safeProxyFactory = new ethers.Contract(
      factoryContractAddress,
      proxyFactoryAbi,
      useEthersSigner(chainId)
      )
  }
  
  

  /*const safeProxyFactory = new ethers.Contract(
    factoryContractAddress,
    proxyFactoryAbi,
    ethers.providers.getSigner()
  );

  async function createNewMultiSig() {
    const tx = await safeProxyFactory.createProxyWithNonce(singletonAddress, encodedData, state.walletNonce)
    const receipt = await tx.wait();
    console.log("receipt",receipt)
  }*/




  

  return (
    <div className="bg-slate-300 p-20 text-center">hi
         <button onClick={() => createNewMultiSig()}>Deploy Safe</button>
    </div>
)
}