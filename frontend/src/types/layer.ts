// types/layer.ts

export interface LayerNode {
    id: string;
    name: string;
    geoserverName: string;
    parentId: string | null;
    restricted: boolean;
    children?: LayerNode[];
}

export interface FlatLayer extends Omit<LayerNode, 'children'> {
    depth?: number;
}
