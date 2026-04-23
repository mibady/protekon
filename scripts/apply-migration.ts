import { Client } from "pg"
import { readFileSync } from "node:fs"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

const url = process.env.POSTGRES_URL_NON_POOLING
if (!url) throw new Error("POSTGRES_URL_NON_POOLING not set")

const files = process.argv.slice(2)
if (files.length === 0) {
  throw new Error("Usage: tsx apply-migration.ts <file1.sql> [file2.sql] ...")
}

async function main() {
  // Strip sslmode from URL so our explicit ssl config takes effect
  const cleanUrl = url!.replace(/([?&])sslmode=[^&]*&?/g, "$1").replace(/[?&]$/, "")
  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  try {
    for (const file of files) {
      const sql = readFileSync(file, "utf8")
      console.log(`\n→ ${file} (${sql.length} chars)`)
      await client.query("BEGIN")
      try {
        await client.query(sql)
        await client.query("COMMIT")
        console.log(`  ✅ applied`)
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      }
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("\n❌ Migration failed:", err.message)
  process.exit(1)
})
