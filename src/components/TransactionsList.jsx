import '../styles/globals.css'
import { useState, useEffect } from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import { CaretDownIcon, CaretUpIcon } from "@radix-ui/react-icons"
import * as Tabs from '@radix-ui/react-tabs'

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
        <div className="bg-primary-black text-white border border-gray-dark">
            <h1 className="text-xl font-bold px-8 py-4">Transactions</h1>
            {/* Tabs */}
            {/* Tx List */}
            <Tabs.Root className="" defaultValue="tab1">
                <Tabs.List className="grid grid-cols-2 text-center " aria-label="">
                    <Tabs.Trigger className="py-3 px-5 border border-gray-dark hover:text-primary-green focus:text-primary-green focus:border-b-primary-green focus:border-b" value="tab1">
                        Queue
                    </Tabs.Trigger>
                    <Tabs.Trigger className="py-3 px-5 border border-gray-dark hover:text-primary-green focus:text-primary-green focus:border-b-primary-green focus:border-b" value="tab2">
                        History
                    </Tabs.Trigger>
                </Tabs.List>
                {/* TX QUEUE */}
                <Tabs.Content className="" value="tab1">
                    <ul className="p-4 flex flex-col gap-2">
                        {transactions
                            .filter(tx => tx.executionDate === null)
                            .map((tx, index) => (
                            <li className="px-4 py-3 bg-gray-dark rounded-md" key={index}>
                                <Collapsible.Root className="" open={openStates[index]} onOpenChange={() => toggleOpen(index)}>
                                    <div className="flex justify-between">
                                        <span>
                                            {tx.to === safeAddr ? "Received" : "Sent"} - {tx.executionDate === null ? "Queued" : "Executed"}
                                        </span>
                                        <Collapsible.Trigger asChild> 
                                            <button className="">{openStates[index] ? <CaretUpIcon /> : <CaretDownIcon />}</button>
                                        </Collapsible.Trigger>
                                    </div>
                                    
                                    <Collapsible.Content>
                                        <div className="p-3">
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
                </Tabs.Content>
                <Tabs.Content className="TabsContent" value="tab2">
                <ul className="p-4 flex flex-col gap-2">
                    {transactions
                        .filter(tx => tx.executionDate !== null)
                        .map((tx, index) => (
                            <li className="px-4 py-3 bg-gray-dark rounded-md" key={index}>
                                <Collapsible.Root className="" open={openStates[index]} onOpenChange={() => toggleOpen(index)}>
                                    <div className="flex justify-between">
                                        <span>
                                            {tx.to === safeAddr ? "Received" : "Sent"} - {tx.executionDate === null ? "Queued" : "Executed"}
                                        </span>
                                        <Collapsible.Trigger asChild> 
                                            <button className="">{openStates[index] ? <CaretUpIcon /> : <CaretDownIcon />}</button>
                                        </Collapsible.Trigger>
                                    </div>
                                    
                                    <Collapsible.Content>
                                        <div className="p-3">
                                            <p>To: {tx.to}</p>
                                            {tx.to !== safeAddr && 
                                                <div>
                                                    <p>Confirmations: {tx.confirmations?.length}/{tx.confirmationsRequired}</p>
                                                </div>
                                                
                                            }
                        
                                        </div>
                                    </Collapsible.Content>
                                </Collapsible.Root>
                            </li>
                        ))
                    }
                </ul>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}