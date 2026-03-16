export default function DraftLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Header skeleton */}
        <header className="flex justify-between items-center py-6 border-b border-border">
          <div className="h-6 w-32 bg-card rounded animate-pulse"></div>
          <div className="h-6 w-48 bg-card rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-card rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-card rounded animate-pulse"></div>
          </div>
        </header>

        <main className="py-6">
          {/* Draft room skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Player list skeleton */}
            <div className="lg:col-span-2 bg-card rounded-lg p-4 border border-border">
              <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Draft order skeleton */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="h-8 w-32 bg-muted rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Queue skeleton */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="h-8 w-24 bg-muted rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
