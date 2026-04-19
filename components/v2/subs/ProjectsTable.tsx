"use client"

import { useTransition } from "react"
import { Archive } from "@phosphor-icons/react/dist/ssr"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { archiveProject, type Project } from "@/lib/actions/projects"
import { useRouter } from "next/navigation"

type ProjectsTableProps = {
  projects: Project[]
  onRowClick: (id: string) => void
}

function statusTone(status: Project["status"]): "enforcement" | "sand" | "steel" {
  if (status === "completed" || status === "archived") return "steel"
  if (status === "paused") return "sand"
  return "enforcement"
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return d
  }
}

export function ProjectsTable({ projects, onRowClick }: ProjectsTableProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleArchive(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm("Archive this project? Assigned subs will remain in their own records.")) return
    startTransition(async () => {
      const r = await archiveProject(id)
      if (r.error) alert(r.error)
      else router.refresh()
    })
  }

  if (projects.length === 0) {
    return (
      <div
        className="p-10 text-center font-sans"
        style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
      >
        No projects yet. Create one to start rolling up sub coverage by site.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.1)" }}>
            <Th>Name</Th>
            <Th>Site / Address</Th>
            <Th>Dates</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              onClick={() => onRowClick(p.id)}
              className="cursor-pointer"
              style={{
                borderBottom: "1px solid rgba(11, 29, 58, 0.06)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(11, 29, 58, 0.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Td>
                <span
                  className="font-display"
                  style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
                >
                  {p.name}
                </span>
              </Td>
              <Td>{p.address ?? "—"}</Td>
              <Td>
                {formatDate(p.start_date)} → {formatDate(p.end_date)}
              </Td>
              <Td>
                <PriorityPill tone={statusTone(p.status)}>{p.status}</PriorityPill>
              </Td>
              <Td>
                <button
                  type="button"
                  onClick={(e) => handleArchive(e, p.id)}
                  disabled={pending || p.status === "archived"}
                  className="inline-flex items-center gap-1 font-display uppercase"
                  style={{
                    color: "var(--ink)",
                    opacity: p.status === "archived" ? 0.3 : 0.65,
                    fontSize: "11px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    background: "transparent",
                    border: "none",
                    cursor: p.status === "archived" ? "not-allowed" : "pointer",
                  }}
                >
                  <Archive size={14} weight="regular" /> Archive
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="font-display uppercase px-4 py-3"
      style={{
        color: "var(--ink)",
        opacity: 0.55,
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      className="font-sans px-4 py-3"
      style={{ color: "var(--ink)", fontSize: "14px", opacity: 0.85 }}
    >
      {children}
    </td>
  )
}
