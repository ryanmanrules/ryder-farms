import { Link } from 'react-router-dom'

export default function ReservationConfirmed() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold font-heading mb-3">Reservation Submitted</h1>
        <p className="text-brand-text/60 text-sm leading-relaxed mb-8">
          Your reservation is pending. Mike will confirm it and reach out with pickup
          details. Payment is cash only at time of pickup — please bring your Maine
          Medical Program certification card.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/menu"
            className="bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold py-3 rounded-full transition-colors text-sm"
          >
            Back to Menu
          </Link>
          <Link
            to="/reservations"
            className="border border-brand-light text-brand-text/60 hover:text-brand-text py-3 rounded-full transition-colors text-sm"
          >
            View My Reservations
          </Link>
        </div>
      </div>
    </div>
  )
}
