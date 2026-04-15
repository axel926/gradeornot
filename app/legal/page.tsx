'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function LegalPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0A0A0B', zIndex: 50 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ height: 14, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', letterSpacing: 1 }}>LEGAL</span>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 80px' }}>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 3, color: '#E8E8EC', marginBottom: 8 }}>LEGAL</h1>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)', marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {[
          {
            title: 'Terms of Service',
            content: [
              {
                subtitle: '1. Acceptance of Terms',
                text: 'By using GradeOrNot, you agree to these terms. GradeOrNot is a decision-support tool for TCG card investors. It does not guarantee any specific grade outcome, market price, or return on investment.'
              },
              {
                subtitle: '2. No Financial Advice',
                text: 'GradeOrNot provides informational tools only. Nothing on this platform constitutes financial, investment, or legal advice. Always conduct your own research before making investment decisions.'
              },
              {
                subtitle: '3. Grade Estimates',
                text: 'PSA grade estimates are statistical predictions based on visual analysis and historical population data. No tool, expert, or grading service can guarantee a specific grade outcome before physical inspection. GradeOrNot\'s estimates are for decision support only.'
              },
              {
                subtitle: '4. Market Data',
                text: 'Prices are sourced from third-party APIs (TCGPlayer, Scryfall, PriceCharting, eBay) and may not reflect real-time market conditions. GradeOrNot is not responsible for discrepancies between displayed prices and actual market prices.'
              },
              {
                subtitle: '5. User Accounts',
                text: 'You are responsible for maintaining the security of your account. GradeOrNot reserves the right to suspend accounts that violate these terms.'
              },
              {
                subtitle: '6. Credits & Payments',
                text: 'Scan credits are non-refundable once used. Unused credits expire 12 months after purchase. Payments are processed securely by Stripe.'
              },
            ]
          },
          {
            title: 'Privacy Policy',
            content: [
              {
                subtitle: '1. Data We Collect',
                text: 'We collect: email address (for authentication), card scan images (processed temporarily, not stored permanently), scan results and portfolio data (stored to provide our service), usage analytics (anonymous, to improve the product).'
              },
              {
                subtitle: '2. How We Use Your Data',
                text: 'Your data is used to: provide and improve GradeOrNot services, calculate grade predictions and ROI, maintain your portfolio and scan history, send alerts you have opted into. We do not sell your personal data to third parties.'
              },
              {
                subtitle: '3. Card Images',
                text: 'Card images you submit are sent to Anthropic\'s Claude API for visual analysis. Images are processed in real-time and are not permanently stored by GradeOrNot or Anthropic for training purposes.'
              },
              {
                subtitle: '4. Third-Party Services',
                text: 'We use: Supabase (database), Stripe (payments), Anthropic Claude (AI analysis), Vercel (hosting), Resend (emails). Each service has its own privacy policy.'
              },
              {
                subtitle: '5. eBay Data',
                text: 'We use eBay\'s Finding API to display sold listing prices. We do not persist eBay user data. eBay data is cached for up to 24 hours for performance.'
              },
              {
                subtitle: '6. Your Rights',
                text: 'You can request deletion of your account and all associated data at any time by contacting us. Data deletion is processed within 30 days.'
              },
              {
                subtitle: '7. Contact',
                text: 'For privacy concerns or data deletion requests: projet@axelcormont.fr'
              },
            ]
          },
          {
            title: 'Disclaimer',
            content: [
              {
                subtitle: 'Investment Risk',
                text: 'Card grading involves financial risk. Cards may receive lower grades than estimated, reducing or eliminating potential profit. Past ROI performance does not guarantee future results. GradeOrNot is not liable for financial losses resulting from grading decisions made using our platform.'
              },
              {
                subtitle: 'Grade Probability Disclaimer',
                text: 'Grade probabilities displayed in GradeOrNot are statistical estimates based on PSA population report data and visual analysis. No tool, platform, or human expert can guarantee a specific PSA, BGS, or CGC grade before physical examination by the grading company.'
              },
            ]
          }
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: '#F5B731', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(245,183,49,0.15)' }}>
              {section.title.toUpperCase()}
            </h2>
            {section.content.map((item, j) => (
              <div key={j} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 8 }}>{item.subtitle}</h3>
                <p style={{ fontSize: 13, color: '#666', fontFamily: 'var(--font-body)', lineHeight: 1.7, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        ))}

        <div style={{ padding: '20px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)', margin: 0 }}>
            GradeOrNot · projet@axelcormont.fr · gradeornot.vercel.app
          </p>
        </div>
      </div>
    </div>
  )
}
