type Props = {
  dateLabel: string;
  todaysProtein: number;
  dailyTarget: number;
};

const motivationalCopy = (progress: number, remaining: number) => {
  if (progress >= 1) {
    return "Incredible! You've smashed today's protein goal.";
  }
  if (remaining < 15) {
    return "You're almost there. A quick protein boost will seal the deal.";
  }
  if (progress === 0) {
    return "Let’s kick off with a high-protein breakfast.";
  }
  return "Keep the momentum going—high-protein snacks can help you stay on track.";
};

export default function SummaryHeader({
  dateLabel,
  todaysProtein,
  dailyTarget,
}: Props) {
  const ratio = dailyTarget > 0 ? todaysProtein / dailyTarget : 0;
  const remaining = Math.max(0, dailyTarget - todaysProtein);

  return (
    <header className="mb-10 flex flex-col gap-6 text-slate-100 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">
          AI Protein Tracker
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{dateLabel}</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300">
          Upload meal photos, get instant protein estimates, and stay aligned
          with your daily macro targets. We keep a rolling log of your meals so
          you can track progress at a glance.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
            Consumed
          </p>
          <p className="mt-2 text-3xl font-semibold">{todaysProtein} g</p>
        </div>
        <div className="rounded-3xl border border-emerald-400/40 bg-emerald-400/10 px-6 py-4 text-center backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
            Target
          </p>
          <p className="mt-2 text-3xl font-semibold">{dailyTarget} g</p>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm leading-6 text-slate-200 backdrop-blur-lg">
        <p>{motivationalCopy(ratio, remaining)}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-200/70">
          Remaining: {remaining} g
        </p>
      </div>
    </header>
  );
}
