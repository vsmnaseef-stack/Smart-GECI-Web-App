import api from './api';
import { getDemoRoleHeaders } from '@/store/authStore';
import type { LayerNode } from '@/types/layer';

/**
 * Fetch the full layer hierarchy from the backend.
 * - Demo mode: sends x-role header so backend filters correctly.
 * - Real mode: JWT is attached automatically by api.ts interceptor.
 */
export async function fetchLayerHierarchy(): Promise<LayerNode[]> {
  const response = await api.get<LayerNode[]>('/layers/hierarchy', {
    headers: getDemoRoleHeaders(),
  });
  return response.data;
}

/** @deprecated Use fetchLayerHierarchy instead */
export async function fetchLayerTree(): Promise<LayerNode[]> {
  return fetchLayerHierarchy();
}

/**
 * Update the parent of a layer (admin only).
 */
export async function updateLayerParent(
  id: string,
  parentId: string | null,
): Promise<LayerNode> {
  const response = await api.put<LayerNode>(
    `/layers/${id}/parent`,
    { parentId },
    { headers: getDemoRoleHeaders() },
  );
  return response.data;
}

/**
 * Toggle the `restricted` flag of a single layer (admin only).
 */
export async function updateLayerRestricted(
  id: string,
  restricted: boolean,
): Promise<LayerNode> {
  const response = await api.put<LayerNode>(
    `/layers/${id}/restricted`,
    { restricted },
    { headers: getDemoRoleHeaders() },
  );
  return response.data;
}

/**
 * Persist a reordered / re-parented layer hierarchy (admin only).
 */
export async function saveLayerHierarchy(tree: LayerNode[]): Promise<void> {
  await api.put('/layers/hierarchy', { tree }, { headers: getDemoRoleHeaders() });
}
