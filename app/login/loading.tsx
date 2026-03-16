export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg p-8 border border-border">
          {/* Logo skeleton */}
          <div className="h-12 w-48 bg-muted rounded animate-pulse mx-auto mb-8"></div>

          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded animate-pulse"></div>
            <div className="h-12 bg-muted rounded animate-pulse"></div>
            <div className="h-12 bg-liquid-lava/20 rounded animate-pulse"></div>
          </div>

          {/* Divider skeleton */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Social login skeleton */}
          <div className="h-12 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
