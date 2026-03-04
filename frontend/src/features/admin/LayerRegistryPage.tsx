import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLayerStore } from '@/store/layerStore';
import { updateLayerRestricted } from '@/services/layerService';
import type { LayerNode } from '@/types/layer';
import { flattenTree } from '@/features/layers/layerUtils';

type FlatLayerEditable = {
  id: string;
  name: string;
  geoserverName: string;
  parentId: string | null;
  restricted: boolean;
  depth: number;
};

/**
 * Admin: tabular view of all registered layers.
 * Allows toggling the `restricted` flag and persisting to backend.
 */
export default function LayerRegistryPage() {
  const layerTree    = useLayerStore(state => state.layerTree);
  const fetchLayers  = useLayerStore(state => state.fetchLayers);
  const setLayerTree = useLayerStore(state => state.setLayerTree);

  const [editedTree, setEditedTree] = useState<LayerNode[]>(layerTree);
  const [isSaving, setIsSaving]     = useState(false);

  const flatRows: FlatLayerEditable[] = flattenTree(editedTree).map(n => ({
    id:            n.id,
    name:          n.name,
    geoserverName: n.geoserverName,
    parentId:      n.parentId,
    restricted:    n.restricted,
    depth:         n.depth ?? 0,
  }));

  // Collect original flat map for diff
  const originalFlat = flattenTree(layerTree);
  const originalById = Object.fromEntries(originalFlat.map(n => [n.id, n.restricted]));

  // Toggle restricted flag locally
  const toggleRestricted = useCallback(
    (id: string) => {
      function patchTree(nodes: LayerNode[]): LayerNode[] {
        return nodes.map(node =>
          node.id === id
            ? { ...node, restricted: !node.restricted }
            : { ...node, children: patchTree(node.children ?? []) },
        );
      }
      setEditedTree(prev => patchTree(prev));
    },
    [],
  );

  const handleApply = async () => {
    // Only PUT layers whose restricted flag actually changed
    const changed = flatRows.filter(r => r.restricted !== originalById[r.id]);
    if (changed.length === 0) return;

    setIsSaving(true);
    try {
      await Promise.all(changed.map(r => updateLayerRestricted(r.id, r.restricted)));
      toast.success(`Updated ${changed.length} layer(s).`);
      // Optimistically update store, then refetch for consistency
      setLayerTree(editedTree);
      await fetchLayers();
      setEditedTree(useLayerStore.getState().layerTree);
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setEditedTree(layerTree);
  };

  const hasChanges = JSON.stringify(
    flatRows.map(r => ({ id: r.id, restricted: r.restricted })),
  ) !== JSON.stringify(originalFlat.map(n => ({ id: n.id, restricted: n.restricted })));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Layer Registry</h2>
          <p className="text-sm text-slate-500">
            {flatRows.length} layers registered · Toggle restricted access per layer
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="text-sm px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              disabled={isSaving}
              className="text-sm px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-500 disabled:bg-slate-300 disabled:text-slate-500 transition-colors font-medium"
            >
              {isSaving ? 'Saving…' : 'Apply Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">Layer Name</th>
              <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">GeoServer Name</th>
              <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">Parent ID</th>
              <th className="text-center px-4 py-2.5 text-slate-600 font-semibold">Restricted</th>
            </tr>
          </thead>
          <tbody>
            {flatRows.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-slate-100 last:border-0 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                } hover:bg-purple-50/30`}
              >
                <td className="px-4 py-2.5">
                  <span
                    className="font-medium text-slate-700"
                    style={{ paddingLeft: `${row.depth * 16}px` }}
                  >
                    {row.depth > 0 && (
                      <span className="text-slate-300 mr-1">{'└'}</span>
                    )}
                    {row.name}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                  {row.geoserverName}
                </td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">
                  {row.parentId ?? <span className="text-slate-300 italic">root</span>}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => toggleRestricted(row.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      row.restricted ? 'bg-amber-400' : 'bg-slate-200'
                    }`}
                    aria-label={`Toggle restricted for ${row.name}`}
                    title={row.restricted ? 'Restricted — click to allow public' : 'Public — click to restrict'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        row.restricted ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Changes are saved to the backend via PUT /api/layers/:id/restricted.
      </p>
    </div>
  );
}
