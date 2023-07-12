import {
    useAccount,
    useConnect,
    useContract,
    useContractRead,
    useContractWrite,
    useNetwork,
    useWaitForTransaction,
    useSigner,
    useProvider,
} from "wagmi";

import { ethers } from "ethers";
import { useState, useEffect, useMemo } from "react";
import proxyFactoryAbi from "../abi/proxyFactoryAbi.json"; 
import singletonAbi from "../abi/singletonAbi.json"; 


export default function CreateSafe({ chain, connectedWalletAddr}){

  const [factoryContractAddress, setFactoryContractAddress] = useState()
  const [singletonAddress, setSingletonAddress] = useState()
  const [nonce, setNonce] = useState()


  const provider = useProvider()
  const signer = useSigner()
  let proxyFactory
  let proxyFactoryJson 
  let singleton
  let singletonJson
  let chainId
  let encodedData


  const iface = new ethers.utils.Interface(singletonAbi);
  const ownersAddress = [connectedWalletAddr];
  const threeshold = 1;
  const address0 = "0x0000000000000000000000000000000000000000";
  const bytes0 = new Uint8Array(0);
   encodedData = iface.encodeFunctionData(
    "setup(address[],uint256, address,bytes, address, address, uint256, address)",
    [ownersAddress, threeshold, address0, bytes0, address0, address0, 0, address0]
  );


  async function fetchNonce() {
  const nonce = await provider.getTransactionCount(connectedWalletAddr);
  setNonce(nonce)
  }

  useEffect(() => {
    async function fetchSafeData() {
  
      singleton = await fetch(
        "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json"
        );
  
      singletonJson = await singleton.json()
      setSingletonAddress(singletonJson.networkAddresses[chain.id.toString()])
  
      proxyFactory =  await fetch(
        "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/proxy_factory.json"
        );
      proxyFactoryJson = await proxyFactory.json()
      setFactoryContractAddress(proxyFactoryJson.networkAddresses[chain.id.toString()])
     
    }
    fetchSafeData()
    fetchNonce()
  }, [chain, connectedWalletAddr])

  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: factoryContractAddress,
    abi: proxyFactoryAbi,
    functionName: 'createProxyWithNonce',
    args: [singletonAddress, encodedData, nonce],
  })
 



  function createSafeWallet() {
    write(singletonAddress, encodedData, nonce)
    console.log("hi")
  }


  

  return (
    <div className="bg-slate-300 p-20 text-center">
      <button  onClick={() => createSafeWallet()}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
        >Deploy Safe</button>
    </div>
)
}