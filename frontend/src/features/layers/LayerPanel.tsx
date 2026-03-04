import { useState } from 'react';
import { useLayerStore } from '@/store/layerStore';
import { useAuthStore } from '@/store/authStore';
import LayerTree from './LayerTree';

/**
 * Collapsible left-side panel showing the layer tree.
 * Layer visibility is filtered by user role inside the layerStore selector.
 */
export default function LayerPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role        = useAuthStore(state => state.role);
  const getVisible  = useLayerStore(state => state.getVisibleLayers);
  const activeCount = useLayerStore(state => state.activeLayerIds.length);
  const isLoading   = useLayerStore(state => state.isLoading);
  const error       = useLayerStore(state => state.error);

  // Filtering happens here via the store selector — NOT in JSX
  const visibleLayers = getVisible(role);

  return (
    <div
      className={`flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-200 shrink-0 ${
        isCollapsed ? 'w-10' : 'w-64'
      }`}
      style={{ minHeight: 0 }}
    >
      {/* ── header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-slate-600 text-sm font-semibold truncate">Layers</span>
            {activeCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                {activeCount}
              </span>
            )}
            {isLoading && (
              <span className="text-xs text-slate-400 shrink-0">⟳</span>
            )}
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded hover:bg-slate-100 shrink-0 ml-auto"
          aria-label={isCollapsed ? 'Expand layer panel' : 'Collapse layer panel'}
          title={isCollapsed ? 'Expand layer panel' : 'Collapse layer panel'}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {/* ── layer tree or error ── */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {error && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1.5 mb-2">
              {error}
            </p>
          )}
          <LayerTree nodes={visibleLayers} />
        </div>
      )}

      {/* ── footer ── */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-slate-100 shrink-0 bg-slate-50">
          <p className="text-xs text-slate-400">
            {role === 'guest'
              ? 'Login to access restricted layers'
              : `Role: ${role}`}
          </p>
        </div>
      )}
    </div>
  );
}
