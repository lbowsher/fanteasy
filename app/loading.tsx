export default function Loading() {
  return (
    <div className="w-full max-w-xl mx-auto bg-background text-foreground">
      <div className="px-4 py-6">
        <div className="h-7 w-32 bg-card rounded animate-pulse"></div>
      </div>
      <div className="flex-1 bg-card">
        <div className="flex justify-end p-4">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse"></div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-4 py-8 flex border-b border-border">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
            <div className="ml-4 space-y-2">
              <div className="h-5 w-36 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
