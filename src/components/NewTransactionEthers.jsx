import "./NewTransaction.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function NewTransactionEthers({chain, connectedWalletAddr, safeAddr, apiUrl, chainNativeToken}) {
    const [balances, setBalances] = useState([])
    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState(0)
    const [safeNonce, setSafeNonce] = useState()
    const [txHash, setTxHash] = useState("0x")
    const [signature, setSignature] = useState()
    const [singletonAbi, setSingletonAbi] = useState()
    const [singletonAddress, setSingletonAddress] = useState()
    const [signer, setSigner] = useState()
    const [contract, setContract] = useState(null)
    
    useEffect(() => {
        async function fetchSafeData() {
            const safeResponse = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}`)
            const safe = await safeResponse.json()
            setSafeNonce(safe.nonce)

            const balancesResponse = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}/balances/usd?trusted=false&exclude_spam=false`)
            const rawBalances = await balancesResponse.json()
            const safeBalances = [{icon: chainNativeToken.icon, symbol: chainNativeToken.symbol, amount:rawBalances[0].balance / Math.pow(10, chainNativeToken.decimals)}]
      
            rawBalances.filter(item => item.token != null)
                .forEach(item => {
                    safeBalances.push({icon: item.token.logoUri, symbol: item.token.symbol, amount: item.balance / Math.pow(10, item.token.decimals)})
            })
            setBalances(safeBalances)

            const singleton = await fetch(
                "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json"
            );
            const singletonJson = await singleton.json();
            const singletonAddr = singletonJson.networkAddresses[chain.id.toString()]
            setSingletonAbi(singletonJson.abi);
            setSingletonAddress(singletonAddr)
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            // Prompt user for account connections
            await provider.send("eth_requestAccounts", []);
            setSigner(provider.getSigner());
            console.log("Account:", await provider.getSigner().getAddress())

            const contr = new ethers.Contract(singletonAddr, singletonJson.abi, provider)
            setContract(contr)
            console.log(contr);

        }
        fetchSafeData();
    }, [apiUrl, safeAddr, chainNativeToken, chain]);

    if (contract) {
        contract.getTransactionHash(
            ethers.utils.getAddress(recipient),
            amount,
            new Uint8Array(0),
            0,
            0,
            0,
            0,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            safeNonce
        ).then((res) => {
            console.log(res)
        })
    }
    

    function submitTransaction() {
        // craft transaction from state vars
        const transaction = {
            safe: safeAddr,
            to: recipient,
            value: amount,
            data: new Uint8Array(0).toString(),
            operation: 0,
            gasToken: "0x0000000000000000000000000000000000000000",
            safeTxGas: 0,
            baseGas: 0,
            gasPrice: 0,
            refundReceiver: "0x0000000000000000000000000000000000000000",
            nonce: safeNonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is accurate
            contractTransactionHash: "0x", // Contract transaction hash calculated from all the fields
            sender: connectedWalletAddr, // must be checksummed Owner of the Safe
            signature: "", // One or more ECDSA signatures of the `contractTransactionHash` as an hex string
            origin: "",
        };
    
        console.log(transaction);
        const options = {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            },
            body: JSON.stringify(transaction),
        };

        fetch(`${apiUrl}/api/v1/safes/${safeAddr}/multisig-transactions/`, options)
            .then(response => response.json()).catch(err => console.error('Error parsing JSON:', err))
            .then(response => console.log(response));
    }

    return (
        <div className="bg-primary-black text-white border border-gray-dark">
            <h1 className="text-xl font-bold border-b border-gray-dark py-3 px-8">New Transaction</h1>
            <div className="px-8 py-5 flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-light">Sending from</p>
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="bg-slate-300 rounded-full w-10 h-10"></div>
                    <div className="">{safeAddr}</div>
                </div>
                
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-light">Recipient</label>
                    <input type="text" id="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="0xdeadbeef...deadbeef" required/>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-light">Select asset</label>
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option>xDAI</option>
                        <option>Shitcoin</option>
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-light">Amount</label>
                    <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(Number(e.target.value) * 10**18)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-primary-green block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                </div>
                
                <button type="submit" onClick={() => submitTransaction()} className="text-white bg-primary-green focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center 0">Submit</button>

            </div>
        </div>
    )
}