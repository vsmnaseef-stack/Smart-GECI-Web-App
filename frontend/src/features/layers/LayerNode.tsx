import { memo, useCallback } from 'react';
import type { LayerNode as LayerNodeType } from '@/types/layer';
import { useLayerStore } from '@/store/layerStore';
import { useAuthStore } from '@/store/authStore';
import { getAllDescendantIds } from './layerUtils';

interface LayerNodeProps {
  node: LayerNodeType;
  depth: number;
}

/**
 * A single node in the layer tree.
 * Memoized — only re-renders when its own data changes.
 */
const LayerNode = memo(function LayerNode({ node, depth }: LayerNodeProps) {
  const role           = useAuthStore(state => state.role);
  const activeLayerIds = useLayerStore(state => state.activeLayerIds);
  const expandedNodes  = useLayerStore(state => state.expandedNodes);
  const toggleLayer    = useLayerStore(state => state.toggleLayer);
  const toggleExpand   = useLayerStore(state => state.toggleExpand);

  const hasChildren   = (node.children?.length ?? 0) > 0;
  const isExpanded    = expandedNodes.includes(node.id);
  const isActive      = activeLayerIds.includes(node.id);
  const isRestricted  = node.restricted;

  // A parent is "partially" checked when some but not all descendants are active
  const descendantIds = hasChildren ? getAllDescendantIds(node) : [];
  const activeDescendants = descendantIds.filter(id => activeLayerIds.includes(id));
  const isIndeterminate =
    hasChildren &&
    activeDescendants.length > 0 &&
    activeDescendants.length < descendantIds.length &&
    !isActive;

  const handleToggle = useCallback(() => {
    toggleLayer(node.id, role);
  }, [toggleLayer, node.id, role]);

  const handleExpand = useCallback(() => {
    if (hasChildren) toggleExpand(node.id);
  }, [toggleExpand, node.id, hasChildren]);

  const indentPx = depth * 16;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${
          isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${8 + indentPx}px` }}
      >
        {/* expand/collapse toggle */}
        <button
          onClick={handleExpand}
          className={`w-4 h-4 flex items-center justify-center text-slate-400 shrink-0 transition-transform ${
            hasChildren ? 'hover:text-slate-600' : 'cursor-default'
          } ${isExpanded ? 'rotate-90' : ''}`}
          tabIndex={-1}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? '▶' : ''}
        </button>

        {/* checkbox */}
        <input
          type="checkbox"
          className="w-3.5 h-3.5 rounded accent-emerald-500 cursor-pointer shrink-0"
          checked={isActive}
          ref={el => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={handleToggle}
          aria-label={`Toggle ${node.name}`}
        />

        {/* label */}
        <span
          className={`text-sm truncate flex-1 ${
            isActive ? 'text-slate-800 font-medium' : 'text-slate-600'
          }`}
          title={node.name}
        >
          {node.name}
        </span>

        {/* restricted badge */}
        {isRestricted && (
          <span
            className="text-xs px-1 py-0.5 rounded bg-amber-100 text-amber-600 font-medium shrink-0"
            title="Restricted layer"
          >
            🔒
          </span>
        )}
      </div>

      {/* children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <LayerNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
});

export default LayerNode;
