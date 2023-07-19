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
  const [walletOwners, setWalletOwners] = useState([connectedWalletAddr])
  const [threeshold, setThreeshold] = useState(1)
  const [encondeDatas, setEncondeDatas] = useState()


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
  //const ownersAddress = walletOwners;
  //const threeshold = 1;
  const address0 = "0x0000000000000000000000000000000000000000";
  const bytes0 = new Uint8Array(0);
  console.log("hiiii",walletOwners)




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

  console.log('walletOwners',walletOwners)
  console.log('threeshold',threeshold)
  console.log('address0',address0)
  console.log('bytes0',bytes0)
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: factoryContractAddress,
    abi: proxyFactoryAbi,
    functionName: 'createProxyWithNonce',
    args: [singletonAddress, encondeDatas, nonce],
  })
 



  function createSafeWallet() {

    encodedData = iface.encodeFunctionData(
      "setup(address[],uint256, address,bytes, address, address, uint256, address)",
      [walletOwners, threeshold, address0, bytes0, address0, address0, 0, address0]
    );
    write(singletonAddress, encondeDatas, nonce)
  }


  

  return (
    <div className="bg-primary-black text-white border border-gray-dark">
      <h1 className="text-xl font-bold border-b border-gray-dark py-3 px-8">Create Safe Account</h1>
      <h1 className="text-xl font-bold border-b border-gray-dark py-3 px-8 text-primary-green">Wallet Owners</h1>
      <div className="p-4 flex flex-col gap-2">
        {walletOwners.map( (walletOwner, index) =>
          <div className="px-4 py-3 bg-gray-dark rounded-md" key={index}>
            <label>Owner Address</label>
            &nbsp;
            <input 
              className="bg-primary-black border border-gray-dark rounded text-white" 
              type="text"
              style={{width:"82%"}}
              value={walletOwner}
              onChange={(e) => {
                const a = [...walletOwners]
                a[index]=e.target.value
                setWalletOwners(a)
                console.log("walletOwners",walletOwners)
              }}
            />
             &nbsp;
            <button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-5 py-1 sm:w-auto text-primary-green  border border-gray-dark"
              onClick={()=>{
                const a = [...walletOwners]
                a.splice(index, 1);
                setWalletOwners(a)
              }}
            >-</button>  
          </div>
        )}
      </div>
      &nbsp;
      <button className="bg-gray-dark hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto text-primary-green border border-gray-dark"
        onClick={()=>{
          const a = [...walletOwners]                
          console.log("beginning",a)
          a.push("")
          console.log("after",a)
          setWalletOwners(a)
        }}
      >+ Add new owner</button>  
      &nbsp;
      <div className="p-4 flex flex-col gap-2">
          <div className="px-4 py-3 bg-gray-dark rounded-md">
            <label>Threeshold</label>
            &nbsp;
            <input 
              className="bg-primary-black border border-gray-dark rounded text-white" 
              type="text"
              style={{width:"82%"}}
              value={threeshold}
              onChange={(e) => {
                let a=e.target.value
                setThreeshold(a)
              }}
            /> 
          </div>
      </div>
      &nbsp;
      <button  onClick={() => {
        let a = iface.encodeFunctionData(
          "setup(address[],uint256, address,bytes, address, address, uint256, address)",
          [walletOwners, threeshold, address0, bytes0, address0, address0, 0, address0]
        );
        setEncondeDatas(a)
        createSafeWallet()
      }}
        className="bg-gray-dark  hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto text-primary-green border border-gray-dark"
        >Create Wallet </button>
    </div>
)
}