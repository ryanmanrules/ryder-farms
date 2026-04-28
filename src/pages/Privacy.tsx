export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold font-heading mb-2">Privacy Policy</h1>
      <p className="text-brand-text/50 text-sm mb-10">Last updated: April 2026</p>

      <div className="space-y-8 text-brand-text/80 text-sm leading-relaxed">

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">Who We Are</h2>
          <p>
            Ryder Farms Maine is a licensed Maine medical cannabis caregiver operating under the
            Maine Medical Use of Cannabis Act. This policy explains what personal information we
            collect through this website, how it is used, and how it is protected.
          </p>
        </section>

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">What We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Name, date of birth, and email address</li>
            <li>Maine Medical Program certification number</li>
            <li>Photos of your medical certification card (front and back)</li>
            <li>Reservation history tied to your account</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">Why We Collect It</h2>
          <p>
            We collect only the minimum information necessary to verify your eligibility as a
            registered Maine Medical Program patient and to process your product reservations.
            Certification card images are used solely to confirm your identity and card validity
            prior to account approval — consistent with the verification practices of a licensed
            caregiver under Maine law.
          </p>
        </section>

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">How It Is Stored</h2>
          <p>
            All data is stored securely with encryption at rest and in transit. Certification
            card images are stored in a private, access-controlled file store and are only
            accessible to the licensed caregiver. No data is stored on publicly accessible servers
            without access controls.
          </p>
        </section>

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">Who Can See Your Data</h2>
          <p>
            Only the licensed caregiver of Ryder Farms has access to your personal information and
            certification documents. Your data is never sold, shared with third parties, disclosed
            to employers, or provided to law enforcement without a valid warrant or court order.
          </p>
        </section>

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">Your Rights Under Maine Law</h2>
          <p>
            Under Maine Title 22, §1711-C and the Maine Medical Use of Cannabis Act, your medical
            cannabis certification is protected by state medical privacy law. You have the right to
            request deletion of your account and associated data at any time by contacting us
            directly.
          </p>
        </section>

        <section>
          <h2 className="font-semibold font-heading text-base text-brand-text mb-2">Contact</h2>
          <p>
            Questions about this policy or your data? Reach us at{' '}
            <a href="tel:2074508798" className="text-brand-accent hover:underline">207-450-8798</a> or{' '}
            <a href="mailto:ryderfarmsmaine@gmail.com" className="text-brand-accent hover:underline">
              ryderfarmsmaine@gmail.com
            </a>.
          </p>
        </section>

      </div>
    </div>
  )
}
