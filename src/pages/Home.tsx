import { Link } from 'react-router-dom'
import billyAwardsImg from '../assets/billy-awards.png'
import IMG_HERO_BG  from '../assets/hero-bg.webp'
import IMG_JAR_MAIN from '../assets/jar-main.webp'
import IMG_CLUSTER  from '../assets/cluster.svg'
import IMG_GLUBERRY from '../assets/gluberry.svg'
import IMG_CLUSTER2 from '../assets/cluster2.svg'
import IMG_LINEUP   from '../assets/lineup.webp'

/** Smooth organic wave transitioning a light (#EEEBE8) section into a dark (#100908) one */
function WaveLightToDark() {
  return (
    <svg
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
      style={{ display: 'block', background: '#EEEBE8', marginBottom: '-2px' }}
      className="w-full"
      aria-hidden="true"
    >
      <path d="M0,55 C360,110 1080,0 1440,55 L1440,110 L0,110 Z" fill="#100908" />
    </svg>
  )
}

/** Smooth organic wave transitioning a dark (#100908) section into a light (#EEEBE8) one */
function WaveDarkToLight() {
  return (
    <svg
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
      style={{ display: 'block', background: '#100908', marginBottom: '-2px' }}
      className="w-full"
      aria-hidden="true"
    >
      <path d="M0,55 C360,0 1080,110 1440,55 L1440,110 L0,110 Z" fill="#EEEBE8" />
    </svg>
  )
}

export default function Home() {
  return (
    <div>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('${IMG_HERO_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark scrim for legibility */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Floating blob – left */}
        <div
          className="absolute left-[4%] top-[28%] w-52 h-52 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(223,174,138,0.30) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />

        {/* Floating blob – right */}
        <div
          className="absolute right-[6%] top-[18%] w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(183,107,50,0.22) 0%, transparent 70%)',
            animation: 'float-slow 11s ease-in-out infinite',
          }}
        />

        {/* Floating triangle – right */}
        <div
          className="absolute right-[4%] top-[42%] pointer-events-none opacity-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: '72px solid transparent',
            borderRight: '72px solid transparent',
            borderBottom: '126px solid #DFAE8A',
            animation: 'float-tri 13s ease-in-out infinite 1.5s',
          }}
        />

        {/* Floating triangle – left lower */}
        <div
          className="absolute left-[10%] bottom-[22%] pointer-events-none opacity-15"
          style={{
            width: 0,
            height: 0,
            borderLeft: '44px solid transparent',
            borderRight: '44px solid transparent',
            borderBottom: '78px solid #DFAE8A',
            animation: 'float-tri 10s ease-in-out infinite 3s',
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-4 max-w-2xl mx-auto">
          <h1 className="text-white text-5xl md:text-7xl font-extrabold font-heading mb-4 leading-tight tracking-tight drop-shadow-lg">
            Ryder Farms Cannabis
          </h1>
          <p className="text-white/60 text-base md:text-lg mb-10 tracking-wide">
            Organic super soil &nbsp;·&nbsp; Small-batch craft &nbsp;·&nbsp; In-house genetics
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth/signup"
              className="bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold px-8 py-3 rounded-full transition-colors text-sm shadow-md"
            >
              Create Account to View Menu
            </Link>
            <Link
              to="/about"
              className="border border-white/30 text-white hover:border-brand-primary hover:text-brand-primary font-semibold px-8 py-3 rounded-full transition-colors text-sm"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Bounce arrow */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 animate-bounce opacity-40 pointer-events-none">
          <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Award Banner ── */}
      <section className="bg-brand-darker py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left – copy */}
          <div className="flex-1 text-center md:text-left">
            {/* Trophy badge */}
            <div className="inline-flex items-center gap-2 bg-brand-primary/15 border border-brand-primary/30 text-brand-primary rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v1c0 2.97 1.66 5.54 4.07 6.82C7.72 14.42 9.76 15.8 12 16c2.24-.2 4.28-1.58 4.93-3.18C19.34 11.54 21 8.97 21 6V5c0-1.1-.9-2-2-2zm-7 11c-1.37 0-2.67-.46-3.72-1.23-.4-.29-.78-.62-1.13-.98C5.85 10.7 5 8.93 5 7V5h14v2c0 1.93-.85 3.7-2.15 4.79-.35.36-.73.69-1.13.98C14.67 13.54 13.37 14 12 14zm2 3H10v2H7v2h10v-2h-3v-2z"/>
              </svg>
              2026 Billy Awards · New York City
            </div>

            <div className="flex items-baseline gap-3 justify-center md:justify-start mb-2">
              <span className="text-brand-primary font-extrabold font-heading" style={{ fontSize: '5rem', lineHeight: 1 }}>#4</span>
              <span className="text-white/50 text-lg font-medium">of 65 entries</span>
            </div>

            <h2 className="text-white text-2xl md:text-3xl font-extrabold font-heading mb-3 leading-tight">
              Sour Glue Flower
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              Competing against premier cultivators from across the country,
              our Sour Glue flower placed 4th at the 2026 Billy Awards —
              New York City's premier cannabis competition.
            </p>
          </div>

          {/* Right – phone-framed screenshot */}
          <div className="shrink-0 flex justify-center">
            <div
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60"
              style={{
                background: '#0d0d0d',
                border: '6px solid #2a2a2a',
                width: 220,
              }}
            >
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-black/60 rounded-full z-10" />
              <img
                src={billyAwardsImg}
                alt="2026 Billy Awards leaderboard – Ryder Farms Sour Glue #4"
                className="w-full object-cover"
                style={{ marginTop: 16 }}
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Organic Super Soil ── */}
      <section className="py-20 px-4" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-5 leading-tight">
              <span className="text-brand-accent">Organic Super Soil,</span>{' '}
              Water Only
            </h2>
            <p className="text-brand-text/70 leading-relaxed mb-7">
              At Ryder Farms we believe elite flower starts in the dirt. Every plant grows
              in living, organic super soil that teems with beneficial microbes and natural
              nutrients. We never chase quick gains with bottled salts or synthetic boosters.
              Instead, we rely on pure water and a thriving soil food web to deliver clean,
              resonant flavor from root to jar.
            </p>
            <Link
              to="/about"
              className="inline-block bg-brand-darker text-white font-semibold px-7 py-2.5 rounded-full text-sm hover:bg-brand-accent transition-colors"
            >
              Learn more
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
            <img
              src={IMG_JAR_MAIN}
              alt="Ryder Farms – Barf Breath cannabis jar"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <WaveLightToDark />

      {/* ── Small-Batch Craft ── */}
      <section className="bg-brand-darker py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white text-3xl md:text-5xl font-extrabold font-heading mb-5 leading-tight">
            Small-Batch Craft,<br />Big-League Terps
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-14 leading-relaxed">
            Our garden stays intentionally tight. Fewer plants mean more hands-on care,
            longer cure times, and dialed-in environments. Each run is pheno-hunted for
            potency, resin production, and terpene richness, then slow-dried and
            glass-cured to lock in that mouth-staining punch you feel on the first inhale.
          </p>

          {/* Circular product cluster */}
          <div className="mx-auto w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden bg-black shadow-2xl shadow-black/60">
            <img
              src={IMG_CLUSTER}
              alt="Ryder Farms product collection"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <WaveDarkToLight />

      {/* ── In-House Genetics ── */}
      <section className="py-20 px-4" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Jar images stacked */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
              <img
                src={IMG_GLUBERRY}
                alt="Gluberry strain jar"
                className="w-full object-contain max-h-80"
                loading="lazy"
              />
            </div>
            <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
              <img
                src={IMG_CLUSTER2}
                alt="Sour Glue product cluster"
                className="w-full object-contain max-h-56"
                loading="lazy"
              />
            </div>
          </div>

          {/* Text */}
          <div className="md:pt-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-7 leading-tight">
              <span className="text-brand-accent">In-House</span> Genetics
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold font-heading text-brand-text mb-0.5">Gluberry</h3>
                <p className="text-brand-accent text-xs italic mb-1.5">Lineage: GG4 × MOB</p>
                <p className="text-brand-text/70 text-sm leading-relaxed">
                  Sticky glue structure meets bold Maine blueberry candy. Expect syrupy resin glands,
                  purple hues, and a wave of couch-friendly euphoria.
                </p>
              </div>

              <div>
                <h3 className="font-semibold font-heading text-brand-text mb-0.5">Sour Glueberry</h3>
                <p className="text-brand-accent text-xs italic mb-1.5">Lineage: Sour D × GG4 × MOB</p>
                <p className="text-brand-text/70 text-sm leading-relaxed">
                  Sour fuel collides with grape-berry sweetness for a nose-tingling profile that coats
                  the palate and lingers long after exhale.
                </p>
              </div>

              <p className="text-brand-text/55 text-sm leading-relaxed">
                Our breeding program never stops. Each season we pop fresh seeds, hunt rare
                expressions, and keep only the standouts that meet our high terp standards.
              </p>

              <Link
                to="/auth/signup"
                className="inline-block bg-brand-darker text-white font-semibold px-7 py-2.5 rounded-full text-sm hover:bg-brand-accent transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Ryde With Us ── */}
      <section className="py-20 px-4 border-t border-black/5" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Product lineup in organic ellipse clip */}
          <div
            className="overflow-hidden shadow-xl"
            style={{ borderRadius: '60% 40% 55% 45% / 50% 50% 50% 50%' }}
          >
            <img
              src={IMG_LINEUP}
              alt="Ryder Farms product lineup"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Bullets */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-7 leading-tight">
              Why <span className="text-brand-accent">Ryde</span> With Us?
            </h2>
            <div className="space-y-4">
              {[
                { title: 'Pure Inputs',        desc: 'Organic soil, water only, zero pesticides' },
                { title: 'Hand-Trimmed',       desc: 'Every bud is trimmed by people, not machines' },
                { title: 'Third-Party Tested', desc: 'Potency and cleanliness verified for every batch' },
                { title: 'Flavor-Forward',     desc: 'Terpenes guide our process, potency follows' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-accent shrink-0" />
                  <p className="text-sm text-brand-text/80">
                    <span className="font-semibold text-brand-text">{item.title}</span>
                    {' – '}{item.desc}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 mt-8 text-brand-accent font-semibold text-sm hover:text-brand-darker transition-colors"
            >
              Discover more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
