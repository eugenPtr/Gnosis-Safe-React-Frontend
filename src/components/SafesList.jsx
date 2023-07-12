import "./SafesList.css";
import { useState, useEffect } from "react";

// Inputs: Safe Addr & API URL
// List balances, owners and threshold
export default function SafesList({walletAddr, apiUrl}) {
    const [safes, setSafes] = useState([])
    
    useEffect(() => {
        async function fetchSafeData() {
            const response = await fetch(`${apiUrl}/api/v1/owners/${walletAddr}/safes`)
            //const safes = await response.json()
            const safes = {
                safes: [
                    "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
                    "0x86bb3fEABAe516b778e1CF7E4aA17Abf70d71F4F",
                    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                ]
            }
            setSafes(safes.safes)

        }
        fetchSafeData();
    }, [walletAddr, apiUrl]);

    return (
        <div className="bg-primary-black text-white border border-gray-dark">
            <h1 className="text-xl font-bold border-b border-gray-dark py-3 px-8 text-primary-green">My Safe Accounts</h1>
            <ul className="py-10 mb-20">
                {safes.map((safeAddr, index) => (
                    <li key={safeAddr} className="border-b border-gray-dark px-8">
                        <div className="grid grid-cols-12 gap-4 items-center py-2">
                            <div>Acct{index}</div>
                            <div className="w-10 h-10 bg-slate-300 rounded-full col-start-3"></div>
                            <div>{safeAddr}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
        
}