export default function Loading() {
  return (
    <div className="min-h-screen mt-16" style={{ background: 'var(--bg-primary)' }}>

      {/* Profile header banner */}
      <div
        className="w-full h-48 animate-pulse"
        style={{ background: 'var(--bg-card)' }}
      />

      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Avatar + info row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 pb-2">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full animate-pulse flex-shrink-0 ring-4"
            style={{ background: 'var(--bg-card)', ringColor: 'var(--bg-primary)' }}
          />
          <div className="flex-1 space-y-2 pb-1 animate-pulse">
            <div className="h-6 w-40 rounded" style={{ background: 'var(--bg-card)' }} />
            <div className="h-4 w-28 rounded" style={{ background: 'var(--bg-card)' }} />
          </div>
          {/* Follow button skeleton */}
          <div className="h-9 w-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-center space-y-1 animate-pulse"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="h-6 w-8 rounded mx-auto" style={{ background: 'var(--border)' }} />
              <div className="h-3 w-16 rounded mx-auto" style={{ background: 'var(--border)' }} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['Activity', 'Library', 'Lists', 'Reviews'].map((tab) => (
            <div
              key={tab}
              className="h-9 w-20 rounded-t-lg animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>

        {/* Recent activity list */}
        <div className="space-y-3 pb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl p-4 animate-pulse"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="w-12 h-16 rounded-lg flex-shrink-0" style={{ background: 'var(--border)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded" style={{ background: 'var(--border)' }} />
                <div className="h-3 w-1/3 rounded" style={{ background: 'var(--border)' }} />
              </div>
              <div className="h-3 w-16 rounded flex-shrink-0" style={{ background: 'var(--border)' }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
