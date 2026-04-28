import { Link } from 'react-router-dom'
import IMG_HERO_BG  from '../assets/hero-bg.webp'
import IMG_JAR_MAIN from '../assets/jar-main.webp'
import IMG_GLUBERRY from '../assets/gluberry.svg'
import IMG_SOURD    from '../assets/sourd.svg'
import IMG_LINEUP   from '../assets/lineup.webp'

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

export default function About() {
  return (
    <div>

      {/* ── Hero ── */}
      <section
        className="relative py-20 px-4 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('${IMG_HERO_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold font-heading mb-4 leading-tight drop-shadow-lg">
            About Ryder Farms
          </h1>
          <p className="text-white/55 text-base md:text-lg max-w-lg mx-auto">
            Small-batch medical cannabis grown in living organic super soil.
            Maine Medical Program licensed caregiver.
          </p>
        </div>
      </section>

      <WaveDarkToLight />

      {/* ── Who We Are ── */}
      <section className="py-20 px-4" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-5 leading-tight">
              <span className="text-brand-accent">Who</span> We Are
            </h2>
            <div className="space-y-4 text-brand-text/70 leading-relaxed text-sm md:text-base">
              <p>
                At Ryder Farms, we're committed to cultivating premium, small-batch medical
                cannabis with unmatched terpene profiles and intensely flavorful experiences.
                Our journey began over a decade ago on a humble outdoor farm, laying the
                foundation of knowledge, technique, and passion we carry today.
              </p>
              <p>
                After years of working in well-known commercial gardens, we've finally
                realized our dream: growing cannabis exactly how we believe it should
                be — pure, simple, and handcrafted.
              </p>
              <p>
                We firmly believe in the power of nature, not synthetic solutions. Our
                carefully perfected super soil is thoughtfully blended by hand and requires
                at least 30 days to fully "cook," ensuring a balanced, nutrient-rich medium
                without the harshness of synthetic additives.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
            <img
              src={IMG_JAR_MAIN}
              alt="Ryder Farms cannabis jar"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Flagship Strains ── */}
      <section className="py-20 px-4 border-t border-black/5" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-10 text-center leading-tight">
            <span className="text-brand-accent">In-House</span> Flagship Strains
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Gluberry */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
              <div className="bg-black">
                <img
                  src={IMG_GLUBERRY}
                  alt="Gluberry strain"
                  className="w-full object-contain max-h-56"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold font-heading text-lg mb-0.5">Gluberry</h3>
                <p className="text-brand-accent text-xs italic mb-3">GG4 × MOB</p>
                <p className="text-brand-text/70 text-sm leading-relaxed">
                  Classic GG4 glue notes harmonized with creamy, fruity accents for an
                  unparalleled aromatic experience. Syrupy resin glands, purple hues,
                  and a wave of couch-friendly euphoria.
                </p>
              </div>
            </div>

            {/* Sour Glueberry */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
              <div className="bg-black">
                <img
                  src={IMG_SOURD}
                  alt="Sour Glueberry strain"
                  className="w-full object-contain max-h-56"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold font-heading text-lg mb-0.5">Sour Glueberry</h3>
                <p className="text-brand-accent text-xs italic mb-3">Sour Diesel × GG4 × MOB</p>
                <p className="text-brand-text/70 text-sm leading-relaxed">
                  A Maine-born classic delivering robust gas undertones layered with sour,
                  pungent funk that lingers deliciously. Sour fuel collides with grape-berry
                  sweetness for a nose-tingling profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Lineup + CTA ── */}
      <section className="py-20 px-4 border-t border-black/5" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-5 leading-tight">
              Our Mission
            </h2>
            <p className="text-brand-text/70 leading-relaxed mb-6 text-sm md:text-base">
              At Ryder Farms, our mission is clear: stay humble, preserve authenticity, and
              keep craft cannabis genuinely crafted. If you haven't experienced our remarkable
              flavors yet — it's time to Ryde the wave.
            </p>
            <Link
              to="/auth/signup"
              className="inline-block bg-brand-darker text-white font-semibold px-7 py-2.5 rounded-full text-sm hover:bg-brand-accent transition-colors"
            >
              Create Account to View Menu
            </Link>
          </div>

          <div
            className="overflow-hidden shadow-xl"
            style={{ borderRadius: '55% 45% 60% 40% / 50% 50% 50% 50%' }}
          >
            <img
              src={IMG_LINEUP}
              alt="Ryder Farms full product lineup"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
