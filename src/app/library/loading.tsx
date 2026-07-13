export default function Loading() {
  return (
    <div className="min-h-screen mt-16 px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header + filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
            <div className="h-4 w-56 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
          </div>
          {/* Search bar skeleton */}
          <div className="h-10 w-64 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-hidden">
          {['All', 'Movies', 'TV Shows', 'Anime', 'Books'].map((tab) => (
            <div
              key={tab}
              className="h-9 w-20 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          ))}
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              {/* Poster */}
              <div
                className="w-full aspect-[2/3] rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
              {/* Title */}
              <div className="h-3.5 w-4/5 rounded" style={{ background: 'var(--bg-card)' }} />
              {/* Year */}
              <div className="h-3 w-1/2 rounded" style={{ background: 'var(--bg-card)' }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
