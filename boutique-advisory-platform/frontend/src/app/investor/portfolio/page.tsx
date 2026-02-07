'use client'

import DashboardLayout from '../../../components/layout/DashboardLayout'
import PortfolioOverview from '../../../components/PortfolioOverview'

export default function InvestorPortfolioPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Investment Portfolio</h1>
                    <p className="text-gray-400 mt-1">Track your SME investments, performance, and allocations.</p>
                </div>

                <PortfolioOverview />
            </div>
        </DashboardLayout>
    )
}
