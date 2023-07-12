import "./NewTransaction.css";
import { useState, useEffect } from "react";
import * as Collapsible from '@radix-ui/react-collapsible';
import { CaretUpIcon, CaretDownIcon } from '@radix-ui/react-icons';

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function NewTransaction({chain, connectedWalletAddr, safeAddr, apiUrl, chainNativeToken}) {
    const [threshold, setThreshold] = useState(1000)
    const [owners, setOwners] = useState([])
    const [balances, setBalances] = useState([])
    const [valueInUSD, setValueInUSD] = useState(null)
    const [openOwners, setOpenOwners] = useState(false)
    const [openBalances, setOpenBalances] = useState(false)
    
    useEffect(() => {
        async function fetchSafeData() {
            const safeResponse = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}`)
            const safe = await safeResponse.json()
            setThreshold(safe.threshold)
            setOwners(safe.owners)

            const balancesResponse = await fetch(`${apiUrl}/api/v1/safes/${safeAddr}/balances/usd?trusted=false&exclude_spam=false`)
            const rawBalances = await balancesResponse.json()
            const safeBalances = [{icon: chainNativeToken.icon, symbol: chainNativeToken.symbol, amount:rawBalances[0].balance / Math.pow(10, chainNativeToken.decimals)}]
      
            rawBalances.filter(item => item.token != null)
                .forEach(item => {
                    safeBalances.push({icon: item.token.logoUri, symbol: item.token.symbol, amount: item.balance / Math.pow(10, item.token.decimals)})
            })
            setBalances(safeBalances)

            const totalValueUSD = rawBalances.reduce((acc, token) => acc + Number(token.fiatBalance), 0)
            setValueInUSD(totalValueUSD)

        }
        fetchSafeData();
    }, [apiUrl, safeAddr, chainNativeToken]);

    return (
        <div className="bg-primary-black text-white border border-gray-dark">
            <h1 className="text-xl font-bold border-b border-gray-dark py-3 px-8">New Transaction</h1>
            <div className="px-8 py-5 flex flex-col gap-3">
                <p className="text-gray-light">Sending from</p>
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="bg-slate-300 rounded-full w-10 h-10"></div>
                    <div className="">{safeAddr}</div>
                </div>
                <div className="flex gap-16 items-center">
                    <div className="">
                        <p className="text-gray-light">Value</p>
                        <p>${valueInUSD}</p>
                    </div>
                    <div className="">
                        <p className="text-gray-light">Threshold</p>
                        <p>{threshold}</p>
                    </div>
                    <div className="">
                        <p className="text-gray-light">Owners</p>
                        <p>{owners.length}</p>
                    </div>
                </div>
                <br></br>
                <Collapsible.Root className="" open={openOwners} onOpenChange={setOpenOwners}>
                    <div className="flex justify-between">
                        <p> Owners </p>
                        <Collapsible.Trigger asChild> 
                            <button className="">{openOwners ? <CaretUpIcon /> : <CaretDownIcon />}</button>
                        </Collapsible.Trigger>
                    </div>
                    
                    <Collapsible.Content className="px-3">
                        <ul>
                            {owners.map(owner => (
                                <li key={owner}>{owner}</li>
                            ))}
                        </ul> 
                    </Collapsible.Content>
                </Collapsible.Root>

                <Collapsible.Root className="" open={openBalances} onOpenChange={setOpenBalances}>
                    <div className="flex justify-between">
                        <p> Balances </p>
                        <Collapsible.Trigger asChild> 
                            <button className="">{openBalances ? <CaretUpIcon /> : <CaretDownIcon />}</button>
                        </Collapsible.Trigger>
                    </div>
                    
                    <Collapsible.Content>
                        <ul className="px-3">
                            {balances.map(token => (
                                <li className="" key={token.symbol}>
                                        <p className="">{token.symbol} - {token.amount}</p>
                                </li>
                                
                            ))}
                        </ul> 
                    </Collapsible.Content>
                </Collapsible.Root>

            </div>
        
        </div>
    )
}