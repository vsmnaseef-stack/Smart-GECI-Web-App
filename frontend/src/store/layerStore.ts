import { create } from 'zustand';
import type { LayerNode } from '@/types/layer';
import type { UserRole } from '@/types/auth';

// ─── helpers ────────────────────────────────────────────────────────────────

function findNodeInTree(tree: LayerNode[], id: string): LayerNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNodeInTree(node.children ?? [], id);
    if (found) return found;
  }
  return undefined;
}

function getAllDescendantIds(node: LayerNode): string[] {
  if (!node.children || node.children.length === 0) return [];
  return node.children.flatMap(child => [child.id, ...getAllDescendantIds(child)]);
}

function filterTreeByRole(nodes: LayerNode[], role: UserRole): LayerNode[] {
  if (role !== 'guest') return nodes;
  return nodes
    .filter(node => !node.restricted)
    .map(node => ({ ...node, children: filterTreeByRole(node.children ?? [], role) }));
}

// ─── mock seed data (replaced by backend response later) ────────────────────

const MOCK_LAYER_TREE: LayerNode[] = [
  {
    id: 'buildings',
    name: 'Buildings',
    geoserverName: 'smart_geci:buildings',
    parentId: null,
    restricted: false,
    children: [
      {
        id: 'main_building',
        name: 'Main Building',
        geoserverName: 'smart_geci:main_building',
        parentId: 'buildings',
        restricted: false,
      },
      {
        id: 'science_lab',
        name: 'Science Laboratory',
        geoserverName: 'smart_geci:science_lab',
        parentId: 'buildings',
        restricted: false,
      },
      {
        id: 'admin_block',
        name: 'Administration Block',
        geoserverName: 'smart_geci:admin_block',
        parentId: 'buildings',
        restricted: true,
      },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    geoserverName: 'smart_geci:infrastructure',
    parentId: null,
    restricted: false,
    children: [
      {
        id: 'water_network',
        name: 'Water Network',
        geoserverName: 'smart_geci:water_network',
        parentId: 'infrastructure',
        restricted: false,
      },
      {
        id: 'power_grid',
        name: 'Power Grid',
        geoserverName: 'smart_geci:power_grid',
        parentId: 'infrastructure',
        restricted: true,
      },
      {
        id: 'fiber_optic',
        name: 'Fiber Optic Network',
        geoserverName: 'smart_geci:fiber_optic',
        parentId: 'infrastructure',
        restricted: true,
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    geoserverName: 'smart_geci:security',
    parentId: null,
    restricted: true,
    children: [
      {
        id: 'cctv_zones',
        name: 'CCTV Zones',
        geoserverName: 'smart_geci:cctv_zones',
        parentId: 'security',
        restricted: true,
      },
      {
        id: 'access_control',
        name: 'Access Control Points',
        geoserverName: 'smart_geci:access_control',
        parentId: 'security',
        restricted: true,
      },
    ],
  },
  {
    id: 'green_spaces',
    name: 'Green Spaces',
    geoserverName: 'smart_geci:green_spaces',
    parentId: null,
    restricted: false,
    children: [
      {
        id: 'parks',
        name: 'Parks & Gardens',
        geoserverName: 'smart_geci:parks',
        parentId: 'green_spaces',
        restricted: false,
      },
      {
        id: 'sports_fields',
        name: 'Sports Fields',
        geoserverName: 'smart_geci:sports_fields',
        parentId: 'green_spaces',
        restricted: false,
      },
    ],
  },
];

// ─── store interface ──────────────────────────────────────────────────────────

interface LayerState {
  layerTree: LayerNode[];
  activeLayerIds: string[];
  expandedNodes: string[];
  isLoading: boolean;
  error: string | null;

  setLayerTree: (tree: LayerNode[]) => void;
  toggleLayer: (id: string, role: UserRole) => void;
  toggleExpand: (id: string) => void;
  getVisibleLayers: (role: UserRole) => LayerNode[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ─── store ───────────────────────────────────────────────────────────────────

export const useLayerStore = create<LayerState>((set, get) => ({
  layerTree: MOCK_LAYER_TREE,
  activeLayerIds: [],
  expandedNodes: ['buildings', 'infrastructure', 'green_spaces'],
  isLoading: false,
  error: null,

  setLayerTree: (tree) => set({ layerTree: tree }),

  toggleLayer: (id, role) => {
    const { layerTree, activeLayerIds } = get();
    const node = findNodeInTree(layerTree, id);
    if (!node) return;

    // Guests cannot toggle restricted layers
    if (node.restricted && role === 'guest') return;

    const isActive = activeLayerIds.includes(id);
    const descendantIds = getAllDescendantIds(node);
    const affected = [id, ...descendantIds];

    if (isActive) {
      // Turn OFF node + all descendants
      set({ activeLayerIds: activeLayerIds.filter(lid => !affected.includes(lid)) });
    } else {
      // Turn ON node + all descendants (respecting guest restrictions)
      const toAdd = role === 'guest'
        ? affected.filter(aid => {
            const n = findNodeInTree(layerTree, aid);
            return n !== undefined && !n.restricted;
          })
        : affected;
      set({ activeLayerIds: [...new Set([...activeLayerIds, ...toAdd])] });
    }
  },

  toggleExpand: (id) => {
    const { expandedNodes } = get();
    const isExpanded = expandedNodes.includes(id);
    set({
      expandedNodes: isExpanded
        ? expandedNodes.filter(nid => nid !== id)
        : [...expandedNodes, id],
    });
  },

  getVisibleLayers: (role) => filterTreeByRole(get().layerTree, role),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
