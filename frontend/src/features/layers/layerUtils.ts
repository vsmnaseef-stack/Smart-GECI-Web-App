import type { LayerNode } from '@/types/layer';
import type { FlatLayer } from '@/types/layer';

/**
 * Recursively flatten a layer tree into a depth-annotated list.
 */
export function flattenTree(nodes: LayerNode[], depth = 0): FlatLayer[] {
  return nodes.flatMap(node => [
    { id: node.id, name: node.name, geoserverName: node.geoserverName, parentId: node.parentId, restricted: node.restricted, depth },
    ...flattenTree(node.children ?? [], depth + 1),
  ]);
}

/**
 * Find a node anywhere in the tree by id.
 */
export function findNodeById(tree: LayerNode[], id: string): LayerNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNodeById(node.children ?? [], id);
    if (found) return found;
  }
  return undefined;
}

/**
 * Collect ids of all descendants of a node.
 */
export function getAllDescendantIds(node: LayerNode): string[] {
  if (!node.children || node.children.length === 0) return [];
  return node.children.flatMap(child => [child.id, ...getAllDescendantIds(child)]);
}

/**
 * Build a nested tree from a flat list.
 * Nodes without a matching parent are treated as root nodes.
 */
export function buildTree(flat: FlatLayer[]): LayerNode[] {
  const map = new Map<string, LayerNode>();
  flat.forEach(item => map.set(item.id, { ...item, children: [] }));

  const roots: LayerNode[] = [];
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

/**
 * Check whether a layer (or any of its ancestors) is restricted.
 */
export function isEffectivelyRestricted(tree: LayerNode[], id: string): boolean {
  const node = findNodeById(tree, id);
  return node?.restricted ?? false;
}
