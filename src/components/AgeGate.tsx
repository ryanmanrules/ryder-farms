import { useState } from 'react'

interface Props {
  onVerified: () => void
}

export default function AgeGate({ onVerified }: Props) {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const dob = new Date(Number(year), Number(month) - 1, Number(day))
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    const isOldEnough =
      age > 21 || (age === 21 && monthDiff > 0) ||
      (age === 21 && monthDiff === 0 && today.getDate() >= dob.getDate())

    if (isNaN(dob.getTime())) {
      setError('Please enter a valid date of birth.')
      return
    }

    if (!isOldEnough) {
      setError('You must be 21 or older to access this site.')
      return
    }

    localStorage.setItem('age_verified', 'true')
    onVerified()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #100908 0%, #1C1611 60%, #2a1a0e 100%)',
      }}
    >
      <div className="max-w-sm w-full text-center">
        <img
          src="/logo.png"
          alt="Ryder Farms Maine"
          className="h-16 w-auto mx-auto mb-6"
        />

        <h1 className="text-white text-2xl font-bold font-heading mb-2">
          Age Verification
        </h1>
        <p className="text-white/50 text-sm mb-8">
          This site is restricted to patients 21 and older with a valid Maine
          Medical Program certification.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-white/40 text-xs mb-1 text-left">Month</label>
              <input
                type="number"
                placeholder="MM"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-center text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-white/40 text-xs mb-1 text-left">Day</label>
              <input
                type="number"
                placeholder="DD"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-center text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-white/40 text-xs mb-1 text-left">Year</label>
              <input
                type="number"
                placeholder="YYYY"
                min={1900}
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2.5 text-center text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold py-3 rounded-full transition-colors text-sm"
          >
            Enter Site
          </button>
        </form>

        <p className="text-white/25 text-xs mt-6 leading-relaxed">
          By entering you confirm you are 21+ and a registered Maine Medical
          Program patient. This site is not for recreational use.
        </p>
      </div>
    </div>
  )
}
