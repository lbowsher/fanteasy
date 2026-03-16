export default function LeagueLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Header skeleton */}
        <header className="flex justify-between items-center py-6 border-b border-slate-grey">
          <div className="h-8 w-48 bg-surface rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-surface rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-surface rounded animate-pulse"></div>
          </div>
        </header>

        <main className="py-6">
          {/* League header skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-surface rounded animate-pulse mb-2"></div>
            <div className="h-5 w-32 bg-surface rounded animate-pulse"></div>
          </div>

          {/* Teams grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface rounded-lg p-4 border border-border">
                <div className="h-6 w-32 bg-border rounded animate-pulse mb-3"></div>
                <div className="h-4 w-24 bg-border rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-border rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
