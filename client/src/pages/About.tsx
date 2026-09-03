import { ShieldCheck, ExternalLink } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-950">
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">About DrugCheck</h1>
              <p className="mt-2 text-lg text-slate-600">Registry verification for Nigeria</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <p className="text-xl leading-relaxed text-slate-700">
              DrugCheck is an independent verification tool that helps Nigerians confirm whether a drug's
              NAFDAC registration number appears in the official Greenbook database.
            </p>

            <hr className="my-10 border-slate-200" />

            <h2 className="text-2xl font-black tracking-tight text-slate-950">The Problem</h2>
            <p>
              Counterfeit and substandard drugs are a major public health crisis in Nigeria. According to
              NAFDAC, fake pharmaceuticals contribute to thousands of avoidable deaths each year. The agency
              maintains a public web portal and the Greenbook mobile app for verifying registered products,
              but these tools often lack a developer-friendly API and can be difficult to use for quick checks.
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-950">The Solution</h2>
            <p>
              DrugCheck provides a fast, simple, and professional web interface for registry verification.
              It queries the same official NAFDAC Greenbook data that the agency uses, but presents it in
              a clean, accessible format. The app includes:
            </p>
            <ul>
              <li>Registry lookup by NAFDAC registration number</li>
              <li>Optional package-field comparison (product name, strength)</li>
              <li>Persistent caching for fast results</li>
              <li>Clear safety disclaimers (match ≠ authenticity)</li>
              <li>Mobile-responsive design</li>
            </ul>

            <hr className="my-10 border-slate-200" />

            <h2 className="text-2xl font-black tracking-tight text-slate-950">About the Developer</h2>
            <p>
              <strong>Lawal Goodness Inioluwa</strong> is a software developer passionate about using
              technology to solve real-world problems in Nigeria. This project was built to demonstrate
              the power of open data and independent verification in healthcare.
            </p>
            <p>
              Lawal is a student at Bayero University Kano and has experience building full-stack applications
              with React, TypeScript, Node.js, and modern cloud platforms. DrugCheck is part of a portfolio
              of projects aimed at driving digital transformation in Nigeria.
            </p>

            <h3 className="text-lg font-black text-slate-950">Connect</h3>
            <ul>
              <li>GitHub: <a href="https://github.com/0xlawal" target="_blank" rel="noreferrer">0xlawal</a></li>
              <li>Email: <a href="mailto:goodnesslawal6@gmail.com">goodnesslawal6@gmail.com</a></li>
            </ul>

            <hr className="my-10 border-slate-200" />

            <h2 className="text-2xl font-black tracking-tight text-slate-950">Data Sources</h2>
            <p>
              DrugCheck uses the official <strong>NAFDAC Greenbook</strong> as its primary data source.
              The Greenbook contains information on all registered pharmaceutical products in Nigeria.
            </p>
            <p>
              <a
                href="https://greenbook.nafdac.gov.ng/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-black text-emerald-700 hover:text-emerald-900"
              >
                Visit NAFDAC Greenbook <ExternalLink className="h-4 w-4" />
              </a>
            </p>
            <p className="text-sm text-slate-500">
              <strong>Disclaimer:</strong> This application is an independent verification aid.
              A registry match does not certify the physical product as genuine, correctly stored,
              safe, or legally sold.
            </p>
          </div>
        </div>
      </div>

      <footer className="relative border-t border-slate-200/80 bg-white/60 px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Independent lookup aid · Not affiliated with NAFDAC</span>
          <span>Registry information is not a safety certification.</span>
        </div>
      </footer>
    </div>
  );
}