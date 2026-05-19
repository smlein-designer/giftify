import { useState } from 'react'
import { Loader2 } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">🎁 Giftify</h1>
        <p className="text-sm text-muted mb-8">A personal gift-planning app.</p>

        <button
          onClick={handleDemo}
          disabled={demoLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 mb-6"
        >
          {demoLoading && <Loader2 size={14} className="animate-spin" />}
          {demoLoading ? 'Loading…' : 'Try the demo'}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">or sign in with your email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {sent ? (
          <div className="p-4 bg-surface border border-border rounded-md">
            <p className="text-sm font-medium text-foreground">Check your email</p>
            <p className="text-sm text-muted mt-1">We sent a login link to {email}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 border border-border hover:bg-surface text-foreground text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
