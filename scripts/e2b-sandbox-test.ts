#!/usr/bin/env npx tsx
/**
 * E2B Sandbox Test Runner for Protekon
 *
 * Runs quality gates (tsc, lint, test, build) in an isolated E2B cloud sandbox.
 * Usage:
 *   npx tsx scripts/e2b-sandbox-test.ts --all
 *   npx tsx scripts/e2b-sandbox-test.ts --test
 *   npx tsx scripts/e2b-sandbox-test.ts --build
 *   npx tsx scripts/e2b-sandbox-test.ts --typecheck
 *   npx tsx scripts/e2b-sandbox-test.ts --lint
 *
 * Requires: E2B_API_KEY environment variable
 */

import { Sandbox } from "e2b"
import { readFileSync, readdirSync, statSync } from "fs"
import { join, relative } from "path"

const TEMPLATE = process.env.SANDBOX_TEMPLATE || "base"
const TIMEOUT = parseInt(process.env.SANDBOX_TIMEOUT || "300000")
const PROJECT_ROOT = join(import.meta.dirname, "..")

// ── File Collection ──

const INCLUDE_PATTERNS = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "next.config.mjs",
  "tailwind.config.ts",
  "postcss.config.mjs",
  "vitest.config.ts",
  "eslint.config.mjs",
  ".env.test",
  "components.json",
]

const INCLUDE_DIRS = [
  "app",
  "components",
  "lib",
  "inngest",
  "supabase",
  "__tests__",
  "public",
]

const EXCLUDE = new Set([
  "node_modules",
  ".next",
  ".git",
  ".claude",
  ".vercel",
  "e2e",
  "journey-results",
  "scripts",
  ".env.local",
  "package-lock.json",
])

function collectFiles(dir: string, base: string = ""): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = []
  const entries = readdirSync(dir)

  for (const entry of entries) {
    if (EXCLUDE.has(entry)) continue
    const fullPath = join(dir, entry)
    const relPath = base ? `${base}/${entry}` : entry

    try {
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        files.push(...collectFiles(fullPath, relPath))
      } else if (stat.size < 500_000) {
        // Skip files > 500KB
        files.push({ path: relPath, content: readFileSync(fullPath, "utf-8") })
      }
    } catch {
      // Skip unreadable files
    }
  }

  return files
}

function getProjectFiles(): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = []

  // Root config files
  for (const name of INCLUDE_PATTERNS) {
    const fullPath = join(PROJECT_ROOT, name)
    try {
      files.push({ path: name, content: readFileSync(fullPath, "utf-8") })
    } catch {
      // File doesn't exist, skip
    }
  }

  // Source directories
  for (const dir of INCLUDE_DIRS) {
    const fullPath = join(PROJECT_ROOT, dir)
    try {
      statSync(fullPath)
      files.push(...collectFiles(fullPath, dir))
    } catch {
      // Directory doesn't exist
    }
  }

  return files
}

// ── Sandbox Execution ──

interface GateResult {
  gate: string
  success: boolean
  duration: number
  output: string
}

async function runGate(sandbox: Sandbox, gate: string, command: string): Promise<GateResult> {
  const start = Date.now()
  console.log(`\n── ${gate} ──`)

  try {
    const result = await sandbox.commands.run(command, {
      cwd: "/home/user/project",
      timeoutMs: TIMEOUT,
    })

    const output = (result.stdout || "") + (result.stderr || "")
    const success = result.exitCode === 0
    const duration = Date.now() - start

    if (success) {
      console.log(`✓ ${gate}: PASS (${(duration / 1000).toFixed(1)}s)`)
    } else {
      console.log(`✗ ${gate}: FAIL (${(duration / 1000).toFixed(1)}s)`)
      console.log(output.slice(-2000)) // Last 2K of output
    }

    return { gate, success, duration, output }
  } catch (err) {
    const duration = Date.now() - start
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`✗ ${gate}: ERROR (${(duration / 1000).toFixed(1)}s) — ${msg}`)
    return { gate, success: false, duration, output: msg }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const runAll = args.includes("--all") || args.length === 0
  const runTest = runAll || args.includes("--test")
  const runBuild = runAll || args.includes("--build")
  const runTypecheck = runAll || args.includes("--typecheck")
  const runLint = runAll || args.includes("--lint")

  if (!process.env.E2B_API_KEY) {
    console.error("ERROR: E2B_API_KEY environment variable not set")
    console.error("Get your key at https://e2b.dev/dashboard")
    process.exit(1)
  }

  console.log("╔══════════════════════════════════════╗")
  console.log("║  PROTEKON — E2B Sandbox Test Runner  ║")
  console.log("╚══════════════════════════════════════╝")
  console.log()

  // Collect project files
  console.log("Collecting project files...")
  const files = getProjectFiles()
  console.log(`  ${files.length} files collected`)
  const totalSize = files.reduce((sum, f) => sum + f.content.length, 0)
  console.log(`  ${(totalSize / 1024 / 1024).toFixed(1)}MB total`)

  // Create sandbox
  console.log("\nCreating E2B sandbox...")
  const sandbox = await Sandbox.create(TEMPLATE, { timeoutMs: TIMEOUT })
  console.log(`  Sandbox ID: ${sandbox.sandboxId}`)

  try {
    // Upload files
    console.log("Uploading project files...")
    for (const file of files) {
      await sandbox.files.write(`/home/user/project/${file.path}`, file.content)
    }
    console.log("  Upload complete")

    // Install dependencies
    console.log("\nInstalling dependencies...")
    const installResult = await sandbox.commands.run("npm install --prefer-offline 2>&1 | tail -5", {
      cwd: "/home/user/project",
      timeoutMs: TIMEOUT,
    })
    if (installResult.exitCode !== 0) {
      console.error("npm install failed:", installResult.stderr)
      process.exit(1)
    }
    console.log("  Dependencies installed")

    // Run gates
    const results: GateResult[] = []

    if (runTypecheck) {
      results.push(await runGate(sandbox, "TypeScript", "npx tsc --noEmit"))
    }

    if (runLint) {
      results.push(await runGate(sandbox, "Lint", "npx eslint . --max-warnings 0"))
    }

    if (runTest) {
      results.push(await runGate(sandbox, "Vitest", "npx vitest run"))
    }

    if (runBuild) {
      results.push(await runGate(sandbox, "Build", "npx next build"))
    }

    // Summary
    console.log("\n╔══════════════════════════════════════╗")
    console.log("║           RESULTS SUMMARY            ║")
    console.log("╠══════════════════════════════════════╣")

    const passed = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

    for (const r of results) {
      const icon = r.success ? "✓" : "✗"
      const time = (r.duration / 1000).toFixed(1)
      console.log(`║  ${icon} ${r.gate.padEnd(20)} ${time.padStart(6)}s  ║`)
    }

    console.log("╠══════════════════════════════════════╣")
    console.log(`║  ${passed} passed, ${failed} failed${" ".repeat(14 - String(passed).length - String(failed).length)}${(totalDuration / 1000).toFixed(1).padStart(6)}s  ║`)
    console.log("╚══════════════════════════════════════╝")

    process.exit(failed > 0 ? 1 : 0)
  } finally {
    await sandbox.kill()
    console.log("\nSandbox destroyed.")
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
