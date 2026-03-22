export default function Loading() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-card rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-card rounded-md animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
