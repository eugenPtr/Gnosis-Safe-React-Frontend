import "./TransactionsList.css";
import { useState, useEffect } from "react";
import * as Collapsible from "@radix-ui/react-collapsible"
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons';

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function TransactionsList({safeAddr, apiUrl}) {
    const [transactions, setTransactions] = useState([])
    const [openStates, setOpenStates] = useState([]);
    
    useEffect(() => {
        async function fetchSafeData() {
            const response = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}/all-transactions/`)
            const rawTxs = (await response.json()).results
            const transferTxs = rawTxs.filter(tx => tx.data == null || (tx.data != null && tx.dataDecoded?.method === "transfer"))
            console.log(transferTxs)
            setTransactions(transferTxs)
            setOpenStates(new Array(transferTxs.length).fill(false));

        }
        fetchSafeData();
    }, [safeAddr, apiUrl]);

    const toggleOpen = index => {
        setOpenStates(openStates.map((val, idx) => (idx === index ? !val : val)));
    };

    return (
        <div className="bg-slate-300 p-20 text-center">
            <h1 className="text-xl font-bold mb-5">Transactions List (Work In Progress)</h1>
            <p>Safe: {safeAddr}</p>
            <br></br>
            <p className="mb-5 text-xl">Token Transfers</p>
            <ul className="">
                {transactions.map((tx, index) => (
                    <li className="mb-2" key={index}>
                        {/* {index + " "}{tx.to === safeAddr ? "Received" : "Sent"}{tx.executionDate === null ? "Queued" : "Executed"} */}
                        <Collapsible.Root className="" open={openStates[index]} onOpenChange={() => toggleOpen(index)}>
                            <div className="flex justify-between p-2 border border-orange-500 ">
                                <span>
                                    {tx.to === safeAddr ? "Received" : "Sent"} - {tx.executionDate === null ? "Queued" : "Executed"}
                                </span>
                                <Collapsible.Trigger asChild> 
                                    <button className="">{openStates[index] ? <Cross2Icon /> : <RowSpacingIcon />}</button>
                                </Collapsible.Trigger>
                            </div>
                            
                            <Collapsible.Content>
                                <div className="p-3 border-x border-b border-orange-500">
                                    <p>To: {tx.to}</p>
                                    {tx.to !== safeAddr && 
                                        <p>Confirmations: {tx.confirmations?.length}/{tx.confirmationsRequired}</p>
                                    }
                
                                </div>
                            </Collapsible.Content>
                        </Collapsible.Root>
                    </li>
                ))}
            </ul>
        </div>
    )
}