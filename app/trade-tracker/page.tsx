import { Metadata } from "next"
import { TradeTracker } from "@/components/trade-tracker/trade-tracker"

export const metadata: Metadata = {
  title: "Trade Tracker",
  description: "Track your option trades and monitor your P&L",
}

export default function TradeTrackerPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Trade Tracker</h1>
      <TradeTracker />
    </div>
  )
} 