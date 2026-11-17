import { useState } from 'react'
import { Loader2, ArrowRight, MailCheck } from 'lucide-react'
import Logo, { LogoMark } from '../components/ui/Logo'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDemo = async () => {
    setDemoLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@giftify.app',
      password: 'giftify-demo-2024',
    })
    if (error) setError('Demo sign-in failed. Please try again.')
    setDemoLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const upcoming = [
    { m: 'Nov', d: 29, name: "Arden's birthday", tag: 'Shop this week', tone: 'bg-marigold text-ink' },
    { m: 'Dec', d: 25, name: 'Christmas', tag: '5 of 7 ready', tone: 'bg-paper/10 text-paper' },
    { m: 'Feb', d: 2, name: 'Our anniversary', tag: 'Idea saved', tone: 'bg-paper/10 text-paper' },
  ]

  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink text-paper p-12">
        <span className="pointer-events-none absolute -right-40 -bottom-40 w-[520px] h-[520px] rounded-full border border-paper/10" />
        <span className="pointer-events-none absolute -right-20 -bottom-20 w-[340px] h-[340px] rounded-full border border-paper/10" />
        <span className="inline-flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="font-display font-bold text-[20px]">Giftify</span>
        </span>

        <div className="relative max-w-md">
          <h1 className="text-[52px] leading-[1.02] font-semibold">
            Every person.
            <br />
            Every occasion.
            <br />
            <span className="text-marigold">Handled.</span>
          </h1>
          <p className="mt-5 text-[17px] text-paper/70">
            Birthdays, anniversaries, holidays and everything between. Keep the ideas, the dates and the
            history in one calm place.
          </p>

          <ul className="mt-10 flex flex-col gap-2.5">
            {upcoming.map((u) => (
              <li key={u.name} className="flex items-center gap-4 rounded-xl bg-paper/[0.06] border border-paper/10 px-4 py-3">
                <div className="w-10 text-center">
                  <p className="text-[11px] font-semibold text-marigold leading-none">{u.m}</p>
                  <p className="font-display font-semibold text-[20px] leading-none mt-1 tracking-numeral">{u.d}</p>
                </div>
                <p className="flex-1 font-medium">{u.name}</p>
                <span className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center ${u.tone}`}>{u.tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[13px] text-paper/50">A personal gift planner.</p>
      </aside>

      {/* Sign in */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Logo className="lg:hidden mb-10" />
          <h2 className="text-[32px] leading-tight font-semibold text-ink">Welcome in</h2>
          <p className="text-ink-soft mt-2 mb-8">Look around with sample data, or sign in to your own planner.</p>

          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="group w-full flex items-center justify-center gap-2 h-12 rounded-full bg-ink hover:bg-ink-hover text-paper font-medium transition-colors disabled:opacity-50"
          >
            {demoLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {demoLoading ? 'Opening the demo…' : 'Explore the demo'}
            {!demoLoading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
          </button>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[13px] text-ink-faint">or use your email</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {sent ? (
            <div className="rounded-xl bg-sage-tint px-5 py-5 flex gap-3.5">
              <MailCheck size={22} strokeWidth={1.75} className="text-sage shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-ink">Check your inbox</p>
                <p className="text-[14px] text-ink-soft mt-1">We sent a sign-in link to {email}.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label htmlFor="email" className="field-label">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field h-12 -mt-1.5"
              />
              {error && <p className="text-[14px] text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full border border-line-strong bg-card hover:border-ink-faint text-ink font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Email me a sign-in link'}
              </button>
              <p className="text-[13px] text-ink-faint text-center mt-1">No password needed.</p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
