import Link from "next/link";
import { ClearlistLogo } from "@/components/brand/ClearlistLogo";
import { ThemeToggle } from "@/components/providers/ThemeToggle";

export default function Home() {
  return (
    <main className="landing-shell overflow-hidden">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Clearlist home">
          <ClearlistLogo priority />
          <span className="text-lg font-bold tracking-tight text-slate-950">clearlist</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          <a href="#features" className="transition-colors hover:text-slate-950">Features</a>
          <a href="#workflow" className="transition-colors hover:text-slate-950">How it works</a>
          <a href="#focus" className="transition-colors hover:text-slate-950">Focus better</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 sm:block">
            Log in
          </Link>
          <Link href="/register" className="landing-nav-cta">
            Start for free <ArrowIcon />
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <div className="eyebrow">
            <SparkleIcon /> Your calmer productivity ritual
          </div>
          <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[5.35rem]">
            A clear mind starts with a{" "}
            <span className="text-indigo-600">clear list.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500 sm:text-xl">
            Capture what matters, focus on the next step, and finish your day with less noise. Clearlist makes getting organized feel effortless.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/register" className="landing-primary-cta">
              Create your free list <ArrowIcon />
            </Link>
            <a href="#workflow" className="landing-text-link">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="mt-9 flex items-center gap-3 text-sm text-slate-500">
            <div className="flex -space-x-2" aria-hidden="true">
              <span className="avatar avatar-peach">A</span>
              <span className="avatar avatar-lavender">M</span>
              <span className="avatar avatar-mint">J</span>
              <span className="avatar avatar-sky">S</span>
            </div>
            <span><strong className="font-semibold text-slate-700">2,400+</strong> people finding their flow</span>
          </div>
        </div>

        <div className="relative min-h-125 lg:min-h-152.5">
          <div className="hero-orb hero-orb-purple" />
          <div className="hero-orb hero-orb-peach" />
          <div className="dot-grid" />
          <div className="float-card float-card-top">
            <span className="float-card-icon bg-emerald-100 text-emerald-600"><CheckIcon /></span>
            <span><strong className="block text-xs font-semibold text-slate-800">Nice progress</strong><small className="text-[11px] text-slate-400">3 tasks cleared today</small></span>
          </div>
          <div className="float-card float-card-bottom">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Weekly focus</span>
            <strong className="mt-1 block text-2xl font-semibold tracking-tight text-slate-900">84%</strong>
            <span className="mt-2 block h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><span className="block h-full w-[84%] rounded-full bg-indigo-500" /></span>
          </div>
          <div className="product-preview">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ClearlistLogo className="clearlist-logo-small" />
                <span className="text-sm font-bold tracking-tight text-slate-900">clearlist</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
            </div>
            <div className="px-6 pb-7 pt-7 sm:px-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Tuesday, Oct 24</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Good morning, Alex.</h2>
                  <p className="mt-1.5 text-xs text-slate-400">Let&apos;s make today count.</p>
                </div>
                <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 sm:block">4 of 7 done</span>
              </div>
              <div className="mt-7 flex h-2 overflow-hidden rounded-full bg-slate-100"><span className="w-[57%] rounded-full bg-indigo-500" /></div>
              <div className="mt-7 space-y-3">
                <PreviewTask done title="Review project brief" meta="Completed · 9:00 AM" />
                <PreviewTask title="Plan the afternoon sprint" meta="Today · 11:30 AM" active />
                <PreviewTask title="Book a quiet hour" meta="Today · 2:00 PM" />
                <PreviewTask title="Write tomorrow&apos;s first step" meta="Tomorrow" />
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 text-xs font-medium text-indigo-500">
                <span className="text-base">＋</span> Add a task you&apos;ll feel good about
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-slate-200/70 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-3 lg:px-10">
          <Feature icon={<FocusIcon />} title="One clear next step" text="Turn a noisy brain dump into a list that tells you exactly where to begin." color="indigo" />
          <Feature icon={<CalendarIcon />} title="Plans that breathe" text="Add a due date when it helps, leave it off when it doesn&apos;t. Stay flexible." color="peach" />
          <Feature icon={<ShieldIcon />} title="Yours, always" text="Private by default, with secure accounts that keep your work in your hands." color="mint" />
        </div>
      </section>

      <section id="workflow" className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-32">
        <div id="focus">
          <div className="eyebrow">Less managing. More doing.</div>
          <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Productivity should feel like <span className="text-indigo-600">relief.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-500">
            Clearlist is intentionally simple. No complicated systems, no endless settings — just a thoughtful place to put the things you want to move forward.
          </p>
          <Link href="/register" className="landing-inline-cta mt-8">Find your focus <ArrowIcon /></Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Step number="01" title="Capture" text="Get every open loop out of your head and into a trusted place." />
          <Step number="02" title="Choose" text="Use search and filters to see only what deserves attention now." />
          <Step number="03" title="Complete" text="Check off progress and make space for what comes next." />
        </div>
      </section>

      <section className="mx-6 mb-8 overflow-hidden rounded-4xl bg-slate-950 px-6 py-16 text-center sm:px-10 lg:mx-auto lg:max-w-7xl lg:py-20">
        <div className="cta-glow" />
        <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Your next chapter starts small</p>
        <h2 className="relative mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">Make today a little clearer.</h2>
        <p className="relative mx-auto mt-5 max-w-lg text-base leading-7 text-slate-400">Join Clearlist and build a task habit that leaves more room for the life around it.</p>
        <Link href="/register" className="landing-light-cta relative mt-8">Start your free list <ArrowIcon /></Link>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-8 text-sm text-slate-400 sm:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <ClearlistLogo className="clearlist-logo-tiny" />
          <span className="font-semibold text-slate-600">clearlist</span>
        </div>
        <p>Make room for what matters.</p>
        <div className="flex gap-5">
          <Link href="/login" className="transition-colors hover:text-slate-700">Log in</Link>
          <Link href="/register" className="transition-colors hover:text-slate-700">Create account</Link>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="m4 10.5 3.6 3.5L16 5.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SparkleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="m8 1 1.15 4.85L14 7l-4.85 1.15L8 13l-1.15-4.85L2 7l4.85-1.15L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="m13 11 .45 1.55L15 13l-1.55.45L13 15l-.45-1.55L11 13l1.55-.45L13 11Z" fill="currentColor" /></svg>;
}

function FocusIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /><path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

function ShieldIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 3.5 19 6v5.1c0 4.5-2.95 7.95-7 9.4-4.05-1.45-7-4.9-7-9.4V6l7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="m8.5 12 2.2 2.2 4.8-4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PreviewTask({ title, meta, done, active }: { title: string; meta: string; done?: boolean; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${active ? "border-indigo-200 bg-indigo-50/60" : "border-slate-100 bg-white"}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-200 text-transparent"}`}><CheckIcon /></span>
      <span className="min-w-0 flex-1"><strong className={`block truncate text-xs font-semibold ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>{title}</strong><small className="mt-0.5 block text-[10px] text-slate-400">{meta}</small></span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
    </div>
  );
}

function Feature({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: "indigo" | "peach" | "mint" }) {
  return (
    <div className="flex gap-4">
      <span className={`feature-icon feature-icon-${color}`}>{icon}</span>
      <div><h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-500">{text}</p></div>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="step-card">
      <span className="text-xs font-bold tracking-[0.15em] text-indigo-500">{number}</span>
      <h3 className="mt-7 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
