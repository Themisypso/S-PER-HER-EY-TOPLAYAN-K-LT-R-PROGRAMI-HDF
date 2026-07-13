export default function Loading() {
  return (
    <div className="min-h-screen mt-16 px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
          <div className="h-4 w-80 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
        </div>

        {/* Stats cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5 space-y-3 animate-pulse"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="h-4 w-16 rounded" style={{ background: 'var(--border)' }} />
              <div className="h-8 w-12 rounded" style={{ background: 'var(--border)' }} />
              <div className="h-3 w-24 rounded" style={{ background: 'var(--border)' }} />
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recently Watched — wide */}
          <div
            className="lg:col-span-2 rounded-xl p-6 space-y-4 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="h-5 w-40 rounded" style={{ background: 'var(--border)' }} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-20 rounded-lg flex-shrink-0" style={{ background: 'var(--border)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded" style={{ background: 'var(--border)' }} />
                    <div className="h-3 w-1/2 rounded" style={{ background: 'var(--border)' }} />
                    <div className="h-2 w-full rounded-full" style={{ background: 'var(--border)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity sidebar */}
          <div
            className="rounded-xl p-6 space-y-4 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="h-5 w-32 rounded" style={{ background: 'var(--border)' }} />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-full rounded" style={{ background: 'var(--border)' }} />
                    <div className="h-2 w-2/3 rounded" style={{ background: 'var(--border)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom media row */}
        <div
          className="rounded-xl p-6 space-y-4 animate-pulse"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="h-5 w-36 rounded" style={{ background: 'var(--border)' }} />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 space-y-2">
                <div className="w-28 h-40 rounded-lg" style={{ background: 'var(--border)' }} />
                <div className="h-3 w-24 rounded" style={{ background: 'var(--border)' }} />
                <div className="h-2 w-16 rounded" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
