import api from './api';
import type { LayerNode } from '@/types/layer';

/**
 * Fetch the full layer tree from the backend.
 * The backend returns a nested hierarchy ready to render.
 */
export async function fetchLayerTree(): Promise<LayerNode[]> {
  const response = await api.get<LayerNode[]>('/layers/tree');
  return response.data;
}

/**
 * Persist a reordered / re-parented layer hierarchy (admin only).
 * Backend integration pending — structure is ready.
 */
export async function saveLayerHierarchy(tree: LayerNode[]): Promise<void> {
  await api.put('/layers/hierarchy', { tree });
}

/**
 * Toggle the `restricted` flag of a single layer (admin only).
 */
export async function updateLayerRestricted(
  id: string,
  restricted: boolean,
): Promise<LayerNode> {
  const response = await api.patch<LayerNode>(`/layers/${id}`, { restricted });
  return response.data;
}
