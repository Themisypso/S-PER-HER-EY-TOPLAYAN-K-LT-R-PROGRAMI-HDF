export default function Loading() {
  return (
    <div className="min-h-screen mt-16 px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
          <div className="h-4 w-72 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
        </div>

        {/* Search bar */}
        <div
          className="h-12 w-full max-w-2xl rounded-2xl animate-pulse"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        />

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-full animate-pulse"
              style={{ width: `${60 + i * 8}px`, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          ))}
        </div>

        {/* Trending section */}
        <div className="space-y-4">
          <div className="h-6 w-28 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden animate-pulse"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {/* Wide thumbnail */}
                <div className="w-full h-40" style={{ background: 'var(--border)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded" style={{ background: 'var(--border)' }} />
                  <div className="h-3 w-1/2 rounded" style={{ background: 'var(--border)' }} />
                  <div className="flex gap-2">
                    <div className="h-5 w-12 rounded-full" style={{ background: 'var(--border)' }} />
                    <div className="h-5 w-12 rounded-full" style={{ background: 'var(--border)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular section */}
        <div className="space-y-4">
          <div className="h-6 w-24 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 space-y-2 animate-pulse">
                <div className="w-28 h-40 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <div className="h-3 w-24 rounded" style={{ background: 'var(--bg-card)' }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
