import "./SafesList.css";
import { useState, useEffect } from "react";

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function SafesList({walletAddr, apiUrl}) {
    const [safes, setSafes] = useState([])
    
    useEffect(() => {
        async function fetchSafeData() {
            const response = await fetch(`${apiUrl}/api/v1/owners/${walletAddr}/safes`)
            const safes = await response.json()
            setSafes(safes.safes)

        }
        fetchSafeData();
    }, [walletAddr, apiUrl]);

    return (
        <div className="bg-slate-300 p-20 text-center">
            <h1 className="text-xl font-bold mb-5">Safes List</h1>
            <p>Wallet: {walletAddr}</p>
            <br></br>
            <p>Wallet is owner of the following safes</p>
            <ul>
                {safes.map(safeAddr => (
                    <li key={safeAddr}>{safeAddr}</li>
                ))}
            </ul>
        </div>
    )
}