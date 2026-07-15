import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'

/** Shared shell for every public marketing/legal page: locks the light brand
 *  theme (.cb-public), and provides the consistent header + footer. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cb-public">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}
