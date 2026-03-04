import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useLayerStore } from '@/store/layerStore';
import type { LayerNode } from '@/types/layer';
import { flattenTree, buildTree } from '@/features/layers/layerUtils';
import type { FlatLayer } from '@/types/layer';

// ─── SortableRow ─────────────────────────────────────────────────────────────

interface SortableRowProps {
  row: FlatLayer;
  allLayers: FlatLayer[];
  onParentChange: (id: string, newParentId: string | null) => void;
  onRestrictedChange: (id: string, restricted: boolean) => void;
}

function SortableRow({ row, allLayers, onParentChange, onRestrictedChange }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 10 : undefined,
  };

  // Possible parents: any layer that is not itself and not its descendant
  const possibleParents = allLayers.filter(l => l.id !== row.id);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 last:border-0 bg-white hover:bg-purple-50/30 transition-colors ${
        isDragging ? 'shadow-lg ring-2 ring-purple-300' : ''
      }`}
    >
      {/* drag handle */}
      <td className="px-3 py-2.5 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing text-base"
          aria-label={`Drag ${row.name}`}
        >
          ⠿
        </button>
      </td>

      {/* name */}
      <td className="px-3 py-2.5">
        <span
          className="text-sm font-medium text-slate-700"
          style={{ paddingLeft: `${(row.depth ?? 0) * 14}px` }}
        >
          {(row.depth ?? 0) > 0 && <span className="text-slate-300 mr-1">└</span>}
          {row.name}
        </span>
      </td>

      {/* parent selector */}
      <td className="px-3 py-2.5">
        <select
          value={row.parentId ?? ''}
          onChange={e => onParentChange(row.id, e.target.value || null)}
          className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white hover:border-purple-300 focus:outline-none focus:border-purple-500 transition-colors max-w-36"
        >
          <option value="">— root —</option>
          {possibleParents.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </td>

      {/* restricted toggle */}
      <td className="px-3 py-2.5 text-center">
        <button
          onClick={() => onRestrictedChange(row.id, !row.restricted)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            row.restricted ? 'bg-amber-400' : 'bg-slate-200'
          }`}
          aria-label={`Toggle restricted for ${row.name}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              row.restricted ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </td>
    </tr>
  );
}

// ─── LayerHierarchyEditor ────────────────────────────────────────────────────

export default function LayerHierarchyEditor() {
  const layerTree    = useLayerStore(state => state.layerTree);
  const setLayerTree = useLayerStore(state => state.setLayerTree);

  // Work on a flat representation; rebuild tree when saving
  const [flatLayers, setFlatLayers] = useState<FlatLayer[]>(() => flattenTree(layerTree));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFlatLayers(prev => {
      const oldIndex = prev.findIndex(l => l.id === active.id);
      const newIndex = prev.findIndex(l => l.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleParentChange = useCallback((id: string, newParentId: string | null) => {
    setFlatLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, parentId: newParentId } : l)),
    );
  }, []);

  const handleRestrictedChange = useCallback((id: string, restricted: boolean) => {
    setFlatLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, restricted } : l)),
    );
  }, []);

  const handleApply = () => {
    const newTree: LayerNode[] = buildTree(flatLayers);
    setLayerTree(newTree);
    // Re-flatten to reflect rebuilt depths
    setFlatLayers(flattenTree(newTree));
  };

  const handleReset = () => {
    setFlatLayers(flattenTree(layerTree));
  };

  const hasChanges =
    JSON.stringify(flatLayers) !== JSON.stringify(flattenTree(layerTree));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Hierarchy Editor</h2>
          <p className="text-sm text-slate-500">
            Drag rows to reorder · Change parent relationships · Toggle restricted access
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
              className="text-sm px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium"
            >
              Apply Hierarchy
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2.5 w-8" />
              <th className="text-left px-3 py-2.5 text-slate-600 font-semibold">Layer Name</th>
              <th className="text-left px-3 py-2.5 text-slate-600 font-semibold">Parent Layer</th>
              <th className="text-center px-3 py-2.5 text-slate-600 font-semibold">Restricted</th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={flatLayers.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {flatLayers.map(row => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    allLayers={flatLayers}
                    onParentChange={handleParentChange}
                    onRestrictedChange={handleRestrictedChange}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        ⚠️ Changes are applied locally. Backend persistence will be added in a future release.
      </p>
    </div>
  );
}
