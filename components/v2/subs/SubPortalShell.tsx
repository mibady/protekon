/**
 * Public sub-portal shell. No sidebar, no auth — just the Protekon
 * wordmark and a comfortable reading card on a parchment background.
 * Mobile-first: site workers open these on their phones.
 */
export function SubPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--parchment)",
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: 620, padding: "32px 20px 80px" }}
      >
        <div
          className="font-display mb-10"
          style={{
            color: "var(--ink)",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          Protekon
        </div>
        {children}
      </div>
    </div>
  )
}
