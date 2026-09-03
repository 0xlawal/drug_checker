export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-950 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1>Privacy Policy</h1>
        <p><strong>Last updated:</strong> September 3, 2026</p>

        <h2>1. Data Collected</h2>
        <ul>
          <li><strong>NAFDAC registration numbers</strong> – the identifier you search for</li>
          <li><strong>Optional package fields</strong> – product name, strength (if you provide them)</li>
          <li><strong>Hashed IP address</strong> – used for rate limiting and abuse prevention</li>
          <li><strong>User agent</strong> – browser/device information</li>
        </ul>

        <h2>2. Data Retention</h2>
        <p>Verification logs are retained for 7 days and then automatically deleted. Registry records are cached for up to 24 hours to improve performance.</p>

        <h2>3. Data Sharing</h2>
        <p>DrugCheck does not share your data with third parties. The NAFDAC Greenbook is queried directly for each lookup.</p>

        <h2>4. Cookies</h2>
        <p>DrugCheck does not use tracking cookies. Session cookies may be used for authentication (if enabled).</p>

        <h2>5. Contact</h2>
        <p>For privacy concerns, contact <a href="mailto:goodnesslawal6@gmail.com">goodnesslawal6@gmail.com</a>.</p>
      </div>
    </div>
  );
}