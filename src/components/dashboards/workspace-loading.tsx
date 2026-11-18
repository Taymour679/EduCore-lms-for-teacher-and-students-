export function WorkspaceLoading() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5" role="status" aria-label="Loading workspace">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-16 animate-pulse rounded-card bg-white" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"><div className="h-36 animate-pulse rounded-card bg-white" /><div className="h-36 animate-pulse rounded-card bg-white" /><div className="h-36 animate-pulse rounded-card bg-white" /></div>
      <div className="h-72 animate-pulse rounded-card bg-white" />
    </div>
  );
}