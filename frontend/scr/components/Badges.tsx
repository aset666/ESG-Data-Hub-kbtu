import { blockColors, blockLabels, statusColors, statusLabels } from "@/lib/labels";
import { ESGBlock, MetricStatus } from "@/lib/types";

export function BlockBadge({ block }: { block: ESGBlock }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${blockColors[block]}`}>
      {block}
    </span>
  );
}

export function BlockBadgeFull({ block }: { block: ESGBlock }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${blockColors[block]}`}>
      {blockLabels[block]}
    </span>
  );
}

export function StatusBadge({ status }: { status: MetricStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
