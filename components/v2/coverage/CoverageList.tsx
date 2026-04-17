import type {
  ResourceConfig,
  ResourceRow,
  ResourceType,
} from "@/lib/v2/coverage-types"
import { CoverageRow } from "./CoverageRow"

/**
 * List-mode body. Shows one CoverageRow per canonical-table row and, when
 * the underlying v_client_resources view reports more rows than we fetched
 * from the canonical table, a plain-language footer acknowledging that the
 * rollup counts legacy records that haven't been migrated yet.
 */
export function CoverageList({
  config,
  rows,
  resourceType,
  label,
  notMigrated,
}: {
  config: ResourceConfig
  rows: ResourceRow[]
  resourceType: ResourceType
  label: string
  notMigrated: number
}) {
  return (
    <div className="flex-1 px-8 pb-12 max-w-5xl w-full mx-auto">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-sans text-sm text-steel">
          Showing {rows.length}{" "}
          {rows.length === 1
            ? config.defaultSingular.toLowerCase()
            : label.toLowerCase()}
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const rowId = (row.id as string | undefined) ?? ""
          return (
            <CoverageRow
              key={rowId || `${resourceType}-${rows.indexOf(row)}`}
              config={config}
              row={row}
              resourceType={resourceType}
            />
          )
        })}
      </div>

      {notMigrated > 0 && (
        <p className="mt-8 text-xs font-sans text-steel/70 italic">
          {notMigrated}{" "}
          {notMigrated === 1 ? "row" : "rows"} not yet migrated from legacy
          tables.
        </p>
      )}
    </div>
  )
}
