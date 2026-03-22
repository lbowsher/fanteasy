export default function LeagueLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="py-6">
        <div className="h-8 w-48 bg-card rounded animate-pulse"></div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-lg">
        {/* Teams grid skeleton */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="ml-auto h-6 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
