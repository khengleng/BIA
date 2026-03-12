import { redirect } from 'next/navigation'
import { TRADING_FRONTEND_URL } from '@/lib/platform'

export default function CoreWalletRedirectPage() {
  redirect(`${TRADING_FRONTEND_URL}/trading/wallet`)
}
