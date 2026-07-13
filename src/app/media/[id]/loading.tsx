export default function Loading() {
  return (
    <div className="min-h-screen mt-16" style={{ background: 'var(--bg-primary)' }}>

      {/* Hero backdrop */}
      <div className="relative w-full h-72 sm:h-96 animate-pulse" style={{ background: 'var(--bg-card)' }}>
        {/* Gradient overlay placeholder */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--bg-primary))' }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 space-y-8 pb-12">

        {/* Poster + info row */}
        <div className="flex flex-col sm:flex-row gap-6 items-end">
          {/* Poster */}
          <div
            className="w-36 h-52 rounded-2xl flex-shrink-0 animate-pulse shadow-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          />
          {/* Info */}
          <div className="flex-1 space-y-3 animate-pulse pb-2">
            <div className="h-8 w-3/4 rounded-lg" style={{ background: 'var(--bg-card)' }} />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full" style={{ background: 'var(--bg-card)' }} />
              <div className="h-5 w-20 rounded-full" style={{ background: 'var(--bg-card)' }} />
              <div className="h-5 w-14 rounded-full" style={{ background: 'var(--bg-card)' }} />
            </div>
            <div className="h-4 w-full rounded" style={{ background: 'var(--bg-card)' }} />
            <div className="h-4 w-5/6 rounded" style={{ background: 'var(--bg-card)' }} />
            <div className="h-4 w-2/3 rounded" style={{ background: 'var(--bg-card)' }} />
            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-32 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
              <div className="h-10 w-24 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
              <div className="h-10 w-10 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main detail card */}
          <div
            className="md:col-span-2 rounded-xl p-6 space-y-4 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="h-5 w-24 rounded" style={{ background: 'var(--border)' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3.5 w-full rounded" style={{ background: 'var(--border)' }} />
            ))}
            <div className="h-3.5 w-2/3 rounded" style={{ background: 'var(--border)' }} />
          </div>

          {/* Sidebar info */}
          <div
            className="rounded-xl p-6 space-y-3 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-20 rounded" style={{ background: 'var(--border)' }} />
                <div className="h-3 w-24 rounded" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Cast row */}
        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-16 rounded" style={{ background: 'var(--bg-card)' }} />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 text-center space-y-2">
                <div className="w-20 h-20 rounded-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <div className="h-3 w-16 rounded mx-auto" style={{ background: 'var(--bg-card)' }} />
                <div className="h-2 w-12 rounded mx-auto" style={{ background: 'var(--bg-card)' }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
