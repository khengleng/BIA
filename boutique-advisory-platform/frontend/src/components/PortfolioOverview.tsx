'use client'

import { useState } from 'react'
import { PieChart, TrendingUp, TrendingDown, DollarSign, Briefcase, ChevronRight, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { authorizedRequest } from '../lib/api'
import SumsubKyc from './SumsubKyc'

export default function PortfolioOverview() {
    const [showSumsub, setShowSumsub] = useState(false)

    const startKyc = async () => {
        setShowSumsub(true)
    }

    const portfolioData = [
        { name: 'Tech Startup A', sector: 'Fintech', allocation: 35.5, value: 500000, returns: 12.4, color: 'bg-blue-500' },
        { name: 'Agri-Tech Hub', sector: 'Agriculture', allocation: 22.0, value: 310000, returns: -2.1, color: 'bg-green-500' },
        { name: 'Renewable Solar', sector: 'Energy', allocation: 18.5, value: 260000, returns: 8.5, color: 'bg-yellow-500' },
        { name: 'Logistics Pro', sector: 'Logistics', allocation: 24.0, value: 338000, returns: 5.2, color: 'bg-purple-500' },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-7 h-7 text-blue-400" />
                Portfolio Analytics
            </h2>

            {/* Top Cards & Identity Verification Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Total AUM</p>
                    <p className="text-3xl font-bold text-white tracking-tight">$1,408,000</p>
                    <div className="mt-2 flex items-center gap-1 text-green-400 text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        +6.8% since last quarter
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Active Positions</p>
                    <p className="text-3xl font-bold text-white tracking-tight">4</p>
                    <div className="mt-2 text-gray-500 text-xs">
                        Across 3 industries
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Realized ROI</p>
                    <p className="text-3xl font-bold text-white tracking-tight">18.2%</p>
                    <div className="mt-2 flex items-center gap-1 text-blue-400 text-xs font-bold font-mono">
                        PLATFORM BEATING
                    </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">Identity Status</p>
                        </div>
                        <p className="text-white font-bold text-sm">Verification Required</p>
                    </div>
                    <button
                        onClick={startKyc}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
                    >
                        Verify Now
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Portfolio Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" />
                        Sector Allocation
                    </h3>
                    <div className="space-y-4">
                        {portfolioData.map((item, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-gray-300">{item.sector}</span>
                                    <span className="text-white">{item.allocation}%</span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`${item.color} h-full transition-all duration-1000`}
                                        style={{ width: `${item.allocation}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Investment Performance
                    </h3>
                    <div className="space-y-4">
                        {portfolioData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl hover:bg-gray-900/60 transition-all cursor-pointer border border-transparent hover:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center text-white font-bold`}>
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">{item.sector}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">${item.value.toLocaleString()}</p>
                                    <p className={`text-[10px] font-bold ${item.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.returns >= 0 ? '+' : ''}{item.returns}%
                                    </p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-600 ml-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showSumsub && (
                <SumsubKyc
                    onClose={() => setShowSumsub(false)}
                    onComplete={() => {
                        setShowSumsub(false);
                        // Refresh or update state logic here
                    }}
                />
            )}
        </div>
    )
}
