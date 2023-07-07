import "./TransactionsList.css";
import { useState, useEffect } from "react";

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function TransactionsList({safeAddr, apiUrl}) {
    const [transactions, setTransactions] = useState([])
    
    useEffect(() => {
        async function fetchSafeData() {
            const response = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}/all-transactions/`)
            const rawTxs = (await response.json()).results
            const transferTxs = rawTxs.filter(tx => tx.transfers.length > 0)
            console.log(transferTxs)

        }
        fetchSafeData();
    }, [safeAddr, apiUrl]);

    return (
        <div className="bg-slate-300 p-20 text-center">
            <h1 className="text-xl font-bold mb-5">Transactions List (Work In Progress)</h1>
            <p>Safe: {safeAddr}</p>
            <br></br>
            <p>Transactions</p>
            <ul>
                {transactions.map(tx => (
                    <li key={tx.hash}>{tx.hash}</li>
                ))}
            </ul>
        </div>
    )
}