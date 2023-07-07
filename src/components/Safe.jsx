import "./Safe.css";
import { useState, useEffect } from "react";

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function Safe({safeAddr, apiUrl, chainNativeToken}) {
    const [threshold, setThreshold] = useState(1000)
    const [owners, setOwners] = useState([])
    const [balances, setBalances] = useState([])
    
    useEffect(() => {
        async function fetchSafeData() {
            const safeResponse = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}`)
            const safe = await safeResponse.json()
            setThreshold(safe.threshold)
            setOwners(safe.owners)

            const balancesResponse = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}/balances?trusted=false&exclude_spam=false`)
            const rawBalances = await balancesResponse.json()
            const safeBalances = [{icon: chainNativeToken.icon, symbol: chainNativeToken.symbol, amount:rawBalances[0].balance / Math.pow(10, chainNativeToken.decimals)}]
      
            rawBalances.filter(item => item.token != null)
                .forEach(item => {
                    safeBalances.push({icon: item.token.logoUri, symbol: item.token.symbol, amount: item.balance / Math.pow(10, item.token.decimals)})
            })
            setBalances(safeBalances)

        }
        fetchSafeData();
    }, [apiUrl, safeAddr, chainNativeToken]);

    return (
        <div className="bg-slate-300 p-20 text-center">
            <h1 className="text-xl font-bold mb-5">Safe Details</h1>
            <p className="text-orange-600">Safe Address: {safeAddr}</p>
            <p className="text-orange-600">API URL: {apiUrl}</p>
            <br></br>
            <p>Threshold: {threshold}</p>
            <p>Owners:</p>
            <ul>
                {owners.map(owner => (<li key={owner}>{owner}</li>))}
            </ul>
            <p>Balances:</p>
            <ul>
                {balances.map(token => (
                    <li className="" key={token.symbol}>
                            <p className="">{token.symbol} - {token.amount}</p>
                    </li>
                    
                ))}
            </ul>
        </div>
    )
}