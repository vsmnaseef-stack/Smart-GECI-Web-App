import type { LayerNode as LayerNodeType } from '@/types/layer';
import LayerNode from './LayerNode';

interface LayerTreeProps {
  nodes: LayerNodeType[];
}

/**
 * Renders the top-level nodes of the filtered layer tree.
 * Each node renders its own children recursively via LayerNode.
 */
export default function LayerTree({ nodes }: LayerTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic px-3 py-4 text-center">
        No layers available for your access level.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {nodes.map(node => (
        <LayerNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
