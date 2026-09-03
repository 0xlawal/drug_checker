import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  ExternalLink,
  FileSearch,
  HeartPulse,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const DISCLAIMER =
  "This result shows registry information only. It does not certify the physical product as genuine or safe.";

const resultMeta = {
  registry_match: {
    label: "Registry match",
    eyebrow: "Record found",
    description:
      "This identifier appears in the NAFDAC Greenbook. Compare the record below with the product label before making any decision.",
    icon: CheckCircle2,
    tone: "success",
  },
  registry_match_warning: {
    label: "Match with warning",
    eyebrow: "Review required",
    description:
      "A record was found, but its status or supplied label details need further review.",
    icon: AlertTriangle,
    tone: "warning",
  },
  no_registry_match: {
    label: "No registry match",
    eyebrow: "No record returned",
    description:
      "No matching record was returned by the Greenbook at the time of this lookup. This is not proof that the product is counterfeit.",
    icon: XCircle,
    tone: "danger",
  },
  unable_to_verify: {
    label: "Unable to verify",
    eyebrow: "Source unavailable",
    description:
      "The official source could not be reached or understood. Please retry later or use an official NAFDAC channel.",
    icon: CircleHelp,
    tone: "neutral",
  },
  input_invalid: {
    label: "Check the identifier",
    eyebrow: "Input needs attention",
    description:
      "Enter a valid NAFDAC registration number using letters, numbers, hyphens, or slashes.",
    icon: AlertTriangle,
    tone: "warning",
  },
} as const;

type Tone = (typeof resultMeta)[keyof typeof resultMeta]["tone"];

function toneClasses(tone: Tone) {
  return {
    success: {
      shell: "border-emerald-200 bg-emerald-50/75",
      icon: "bg-emerald-600 text-white",
      text: "text-emerald-950",
      accent: "text-emerald-700",
    },
    warning: {
      shell: "border-amber-200 bg-amber-50/80",
      icon: "bg-amber-500 text-white",
      text: "text-amber-950",
      accent: "text-amber-800",
    },
    danger: {
      shell: "border-rose-200 bg-rose-50/80",
      icon: "bg-rose-600 text-white",
      text: "text-rose-950",
      accent: "text-rose-700",
    },
    neutral: {
      shell: "border-slate-200 bg-slate-50",
      icon: "bg-slate-700 text-white",
      text: "text-slate-950",
      accent: "text-slate-700",
    },
  }[tone];
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-t border-slate-200/80 pt-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value || "Not provided"}</dd>
    </div>
  );
}

export default function Home() {
  const [identifier, setIdentifier] = useState("");
  const [productName, setProductName] = useState("");
  const [strength, setStrength] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const verify = trpc.registry.verify.useMutation();

  const result = verify.data;
  const meta = result ? resultMeta[result.state] : null;
  const tone = meta ? toneClasses(meta.tone) : null;
  const Icon = meta?.icon;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verify.mutate({
      identifier,
      details: {
        productName: productName || undefined,
        strength: strength || undefined,
      },
    });
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8f5] text-slate-950">
      <div className="pointer-events-none absolute left-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-[18rem] h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />

      <header className="relative border-b border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="DrugCheck home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-black tracking-tight text-slate-950">DrugCheck</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Registry aid</span>
            </span>
          </a>

          {/* ✅ Navigation Links Added Here */}
          <nav className="flex items-center gap-6 text-sm font-bold">
            <a href="/about" className="text-slate-600 hover:text-emerald-700 transition">About</a>
            <a href="/contact" className="text-slate-600 hover:text-emerald-700 transition">Contact</a>
            <a href="/terms" className="text-slate-600 hover:text-emerald-700 transition">Terms</a>
            <a href="/privacy" className="text-slate-600 hover:text-emerald-700 transition">Privacy</a>
            <a
              href="https://github.com/0xlawal/drug-registry-verifier-v2"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-emerald-700 transition"
            >
              GitHub
            </a>
          </nav>

          <a
            href="https://greenbook.nafdac.gov.ng/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-emerald-700 sm:flex"
          >
            Official Greenbook <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              NAFDAC registry lookup
            </div>
            <h1 className="max-w-lg text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              Check the record.<br />
              <span className="text-emerald-700">Know the limits.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
              A clear, independent way to compare a NAFDAC registration number with Nigeria’s official registered-product database.
            </p>
            <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
              {[
                [FileSearch, "Registry record"],
                [Clock3, "Source timestamp"],
                [HeartPulse, "Safety-first guidance"],
              ].map(([FeatureIcon, label]) => (
                <div key={label as string} className="flex items-center gap-2 font-semibold">
                  <FeatureIcon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  {label as string}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Start a lookup</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Enter the NRN from the pack</h2>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-slate-800">NAFDAC registration number</label>
                <input
                  id="identifier"
                  value={identifier}
                  onChange={event => setIdentifier(event.target.value)}
                  placeholder="e.g. 03-1450"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={64}
                  className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-lg font-bold tracking-wide outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">Use the number exactly as printed. Spaces are ignored; missing characters are never guessed.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(value => !value)}
                className="text-sm font-bold text-emerald-700 underline decoration-emerald-200 underline-offset-4 transition hover:text-emerald-900"
                aria-expanded={showDetails}
              >
                {showDetails ? "Hide label comparison fields" : "Add optional label details"}
              </button>

              {showDetails && (
                <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="productName" className="mb-2 block text-xs font-bold text-slate-700">Product name</label>
                    <input id="productName" value={productName} onChange={event => setProductName(event.target.value)} maxLength={200} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                  </div>
                  <div>
                    <label htmlFor="strength" className="mb-2 block text-xs font-bold text-slate-700">Strength</label>
                    <input id="strength" value={strength} onChange={event => setStrength(event.target.value)} maxLength={120} placeholder="e.g. 500 mg" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={verify.isPending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
              >
                {verify.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                {verify.isPending ? "Checking official registry…" : "Check registry"}
              </button>
            </form>

            <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <p>{DISCLAIMER}</p>
            </div>
          </div>
        </section>

        {verify.error && (
          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900" role="alert">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="font-black">We could not complete that lookup</h2>
                <p className="mt-1 text-sm leading-6">Please check the number and try again. If the official source is unavailable, use the NAFDAC contact options below.</p>
              </div>
            </div>
          </section>
        )}

        {result && meta && tone && Icon && (
          <section className={`mx-auto mt-10 max-w-4xl rounded-[2rem] border p-5 shadow-sm sm:p-8 ${tone.shell}`} aria-live="polite">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone.icon}`}><Icon className="h-6 w-6" aria-hidden="true" /></div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.16em] ${tone.accent}`}>{meta.eyebrow}</p>
                  <h2 className={`mt-1 text-2xl font-black tracking-tight ${tone.text}`}>{meta.label}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{meta.description}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-700">
                {result.identifier || "No identifier"}
              </span>
            </div>

            {result.record && (
              <div className="mt-7 rounded-3xl border border-white/70 bg-white/80 p-5 sm:p-6">
                <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Greenbook record</p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{result.record.productName || "Unnamed product"}</h3>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${result.record.status.toLowerCase() === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {result.record.status}
                  </span>
                </div>
                <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <Detail label="NAFDAC number" value={result.record.nafdacNumber} />
                  <Detail label="Category" value={result.record.productCategory} />
                  <Detail label="Active ingredient" value={result.record.activeIngredients} />
                  <Detail label="Strength" value={result.record.strengths} />
                  <Detail label="Form / route" value={[result.record.form, result.record.routeOfAdministration].filter(Boolean).join(" · ")} />
                  <Detail label="Applicant" value={result.record.applicantName} />
                  <Detail label="Approval date" value={formatDate(result.record.approvalDate)} />
                  <Detail label="Expiry date" value={formatDate(result.record.expiryDate)} />
                </dl>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-100/80 p-4 text-sm text-amber-950">
                <p className="font-black">Review these warnings</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">{result.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>Source: {result.source.name} · Retrieved {formatDate(result.source.retrievedAt)}{result.cached ? ` · Cached ${result.cacheAgeSeconds}s ago` : ""}</span>
              <a href={result.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-black text-emerald-700 hover:text-emerald-900">Open source <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
            </div>
          </section>
        )}

        <section className="mx-auto mt-14 grid max-w-4xl gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-900 p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">When to escalate</p>
            <h2 className="mt-3 text-xl font-black tracking-tight">A match is only one check</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Compare the name, strength, form, applicant, status, packaging, and dates. If anything looks suspicious, do not rely on this lookup alone.</p>
            <a href="https://nafdac.gov.ng/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-300 hover:text-white">Visit NAFDAC <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Official help</p>
            <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">Report a concern</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">For complaints, NAFDAC publishes 0800-1-NAFDAC. Verify current contact details on the official website before calling.</p>
            <a href="https://nafdac.gov.ng/about-nafdac/contact-nafdac/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700 hover:text-emerald-900">Contact NAFDAC <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-slate-200/80 bg-white/60 px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Independent lookup aid · Not affiliated with NAFDAC</span>
          <span>Registry information is not a safety certification.</span>
        </div>
      </footer>
    </div>
  );
}