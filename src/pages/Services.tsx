import { Link } from 'react-router-dom'
import pickupImg from '../assets/services-pickup.jpeg'
import wholesaleImg from '../assets/services-wholesale.jpeg'

const services = [
  {
    image: pickupImg,
    title: 'Local Pickup',
    description:
      'Prefer to pick up your order in person? We offer convenient local pickup for all reservations. ' +
      'Once your reservation is confirmed through the app, we\'ll coordinate a pickup location that works for you. ' +
      'All sales are cash only at time of pickup. Certification card required.',
    cta: { label: 'Browse the Menu', to: '/menu' },
  },
  {
    image: wholesaleImg,
    title: 'Wholesale for Dispensaries',
    description:
      'Interested in carrying our products at your dispensary? We offer competitive wholesale pricing ' +
      'and reliable service for licensed dispensaries and caregivers across Maine. ' +
      'From top-shelf flower to premium concentrates, all products are small-batch and crafted with care.',
    cta: { label: 'Wholesale Menu', to: '/wholesale' },
  },
]

export default function Services() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative py-20 px-4 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('/hero-bg.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold font-heading mb-4 leading-tight drop-shadow-lg">
            Services
          </h1>
          <p className="text-white/55 text-base md:text-lg max-w-lg mx-auto">
            Small-batch, living soil cannabis — available for patient pickup and wholesale.
          </p>
        </div>
      </section>
      <svg viewBox="0 0 1440 110" preserveAspectRatio="none" style={{ display: 'block', background: '#100908', marginBottom: '-2px' }} className="w-full" aria-hidden="true">
        <path d="M0,55 C360,0 1080,110 1440,55 L1440,110 L0,110 Z" fill="#EEEBE8" />
      </svg>

      {/* Service cards */}
      <section className="py-14 px-4" style={{ background: '#EEEBE8' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-brand-light bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 flex flex-col flex-1">
                <h2 className="font-bold font-heading text-xl mb-3">{s.title}</h2>
                <p className="text-brand-text/60 text-sm leading-relaxed flex-1">
                  {s.description}
                </p>
                <Link
                  to={s.cta.to}
                  className="mt-6 inline-block text-center bg-brand-primary hover:bg-brand-accent text-brand-darker text-sm font-semibold py-2.5 rounded-full transition-colors"
                >
                  {s.cta.label} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-brand-darker py-14 px-4 text-center">
        <h2 className="text-white font-bold font-heading text-2xl mb-3">
          Questions? Get in touch.
        </h2>
        <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
          Call or email us directly — we're happy to answer any questions before you sign up.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="tel:2074508798"
            className="bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            207-450-8798
          </a>
          <a
            href="mailto:ryderfarmsmaine@gmail.com"
            className="border border-white/20 text-white/70 hover:text-white text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            ryderfarmsmaine@gmail.com
          </a>
        </div>
      </section>
    </div>
  )
}
