import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, CircleCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const roles = [
  { title: "Student", description: "Pick up where you left off and see what to focus on next.", href: "/student", initials: "01" },
  { title: "Teacher", description: "Bring classwork, feedback, and learner progress together.", href: "/teacher", initials: "02" },
  { title: "School admin", description: "Keep people, classes, and school activity in view.", href: "/admin", initials: "03" },
  { title: "Platform owner", description: "See the health of the wider EduCore network.", href: "/owner", initials: "04" },
];

const features = [
  { icon: BookOpenCheck, title: "Learning with direction", description: "A clear view of lessons, assignments, and the next useful step." },
  { icon: Sparkles, title: "Support that stays thoughtful", description: "Helpful study guidance that keeps learners doing the thinking." },
  { icon: ChartNoAxesCombined, title: "Progress you can act on", description: "Bring evidence and progress into one calm, readable workspace." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-ink">
      <header className="relative z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-[1600px] items-center justify-between gap-5 px-5 md:px-8">
          <Link href="/" aria-label="EduCore home"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex" aria-label="Main navigation">
            <a href="#approach" className="transition hover:text-ink">Our approach</a>
            <a href="#features" className="transition hover:text-ink">What you can do</a>
            <a href="#role-preview" className="transition hover:text-ink">Role previews</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/student" className="hidden min-h-touch items-center px-3 text-sm font-semibold text-ink sm:inline-flex" aria-label="Log in to the development preview">
              Log in
            </Link>
            <a href="#role-preview" className="inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover">Get started <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </header>

      <section id="approach" className="relative mx-auto grid max-w-[1600px] items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-28 md:pt-24">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="h-2 w-2 rounded-full bg-success" /> A clearer way to learn
          </p>
          <h1 className="max-w-[13ch] text-5xl font-semibold leading-[1.04] text-ink sm:text-6xl">
            Make every next lesson count.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            EduCore brings learning, teaching, and school operations into one considered workspace, so the next step is easier to see.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#role-preview" className="inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover">Explore EduCore <ArrowRight size={16} aria-hidden="true" /></a>
            <Link href="/student" className="inline-flex min-h-touch items-center justify-center rounded-control border border-slate-200 bg-white px-4 text-sm font-medium text-ink transition hover:bg-slate-50">Log in to preview</Link>
          </div>
          <p className="mt-5 text-xs text-muted">Development preview · Sign-in is bypassed locally</p>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] md:ml-auto">
          <div className="relative overflow-hidden rounded-[20px] border border-[#dce2e9] bg-white shadow-[0_24px_70px_rgba(15,21,53,0.12)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3"><Logo compact /><span className="text-sm font-semibold">Learning overview</span></div>
              <span className="rounded-full bg-[#e7f4ee] px-3 py-1 text-[11px] font-semibold text-[#16734e]">On track</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl bg-[#f5f6fb] p-4">
                <p className="text-xs text-muted">Weekly focus</p><p className="mt-2 text-3xl font-semibold">4.5 <span className="text-sm font-medium text-muted">hrs</span></p>
                <div className="mt-4 flex h-10 items-end gap-1.5" aria-label="Weekly learning activity chart">
                  {[38, 65, 48, 82, 59, 96, 70].map((height, index) => <span key={index} className={`w-full rounded-t-sm ${index === 5 ? "bg-primary" : "bg-[#cdd2ee]"}`} style={{ height: `${height}%` }} />)}
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-[#123b36] p-4 text-white">
                <p className="text-xs text-white/70">Next step</p>
                <div><p className="text-lg font-semibold leading-6">Review linear graphs</p><p className="mt-2 text-xs text-white/70">Mathematics · 12 min</p></div>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">Continue <ArrowRight size={14} /></span>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3d8] text-[#9a6500]"><CircleCheck size={18} /></span><div><p className="text-sm font-semibold">Science homework</p><p className="text-xs text-muted">Due Thursday · 3 questions left</p></div></div>
                <span className="text-xs font-semibold text-warning">In progress</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#f8f9fc] px-5 py-3 text-xs text-muted"><span>Sample learning view</span><span>Built for steady progress</span></div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-line bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-8 md:py-20">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">One connected workspace</p><h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight">The right context for every part of learning.</h2></div>
            <p className="max-w-md text-sm leading-6 text-muted">Less time piecing together information. More room for meaningful teaching and learning.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="border-t-2 border-[#dbe1ea] pt-5">
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${index === 1 ? "bg-[#fff3d8] text-[#9a6500]" : index === 2 ? "bg-[#e2f2eb] text-[#16734e]" : "bg-primary-soft text-primary"}`}><Icon size={20} /></div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="role-preview" className="mx-auto max-w-[1600px] px-5 py-16 md:px-8 md:py-20">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Choose a workspace</p><h2 className="mt-3 text-3xl font-semibold">Explore the role previews</h2></div>
          <p className="text-sm text-muted">Local development uses clearly labeled sample users.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Link key={role.href} href={role.href} className="group flex min-h-48 flex-col border-t-2 border-[#dbe1ea] py-5 transition hover:border-primary">
              <span className="text-xs font-semibold text-muted">{role.initials}</span>
              <h3 className="mt-4 text-lg font-semibold">{role.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{role.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">Open preview <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between md:px-8"><Logo /><span>EduCore · Learning that shows you what to revise next.</span></div>
      </footer>
    </main>
  );
}