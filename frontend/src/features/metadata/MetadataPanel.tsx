import { useMetadata } from './useMetadata';

/**
 * Slide-in panel that shows facility metadata after a map click.
 * Visible to all user roles.
 */
export default function MetadataPanel() {
  const { metadata, isLoading, error, clickedLocation, close, refetch } = useMetadata();

  return (
    <div className="slide-in-right w-80 h-full bg-white shadow-xl border-l border-slate-200 flex flex-col">
      {/* ── header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Facility Info</h2>
          {clickedLocation && (
            <p className="text-xs text-slate-400 mt-0.5">
              {clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}
            </p>
          )}
        </div>
        <button
          onClick={close}
          className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
          aria-label="Close metadata panel"
        >
          ✕
        </button>
      </div>

      {/* ── body ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading facility data…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refetch}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && metadata === null && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">📍</p>
            <p className="text-sm text-slate-500">No facility found at this location.</p>
            <button
              onClick={refetch}
              className="text-xs text-emerald-600 hover:underline mt-2"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && metadata && (
          <div className="flex flex-col gap-4">
            {/* facility name */}
            <div>
              <h3 className="text-base font-bold text-slate-800">{metadata.name}</h3>
              <span className="inline-block text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full mt-1 font-medium">
                {metadata.type}
              </span>
            </div>

            {/* description */}
            {metadata.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{metadata.description}</p>
            )}

            {/* properties table */}
            {Object.keys(metadata.properties).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Properties
                </h4>
                <div className="flex flex-col gap-1">
                  {Object.entries(metadata.properties).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-2 py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-xs text-slate-500 capitalize shrink-0">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-700 text-right font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── footer ── */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 shrink-0">
        <p className="text-xs text-slate-400">Click anywhere on the map to inspect a facility</p>
      </div>
    </div>
  );
}
