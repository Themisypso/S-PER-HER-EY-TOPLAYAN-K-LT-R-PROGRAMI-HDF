export default function Loading() {
  return (
    <div className="min-h-screen mt-16 px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Page title */}
        <div className="space-y-2">
          <div className="h-8 w-28 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
          <div className="h-4 w-64 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          {['Profile', 'Account', 'Appearance', 'Notifications'].map((tab) => (
            <div
              key={tab}
              className="h-8 w-24 rounded-lg animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>

        {/* Settings cards */}
        {Array.from({ length: 4 }).map((_, section) => (
          <div
            key={section}
            className="rounded-xl p-6 space-y-5 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Section title */}
            <div className="h-5 w-32 rounded" style={{ background: 'var(--border)' }} />

            {/* Setting rows */}
            {Array.from({ length: 3 }).map((_, row) => (
              <div key={row} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="h-4 w-40 rounded" style={{ background: 'var(--border)' }} />
                  <div className="h-3 w-64 rounded" style={{ background: 'var(--border)' }} />
                </div>
                {/* Toggle / input skeleton */}
                <div className="h-7 w-12 rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        ))}

        {/* Save button skeleton */}
        <div className="flex justify-end">
          <div className="h-10 w-28 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
        </div>

      </div>
    </div>
  );
}
