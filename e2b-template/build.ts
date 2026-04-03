#!/usr/bin/env npx tsx
/**
 * Build the nextjs-quality-gates E2B template (v2 — remote build, no Docker needed)
 *
 * Usage: npx tsx e2b-template/build.ts
 * Requires: E2B_API_KEY environment variable
 */
import { Template, defaultBuildLogger } from "e2b"
import { template } from "./template"

async function main() {
  if (!process.env.E2B_API_KEY) {
    console.error("ERROR: E2B_API_KEY not set")
    process.exit(1)
  }

  console.log("Building E2B template: nextjs-quality-gates")
  console.log("  2 vCPUs, 4096 MB RAM, Node.js 22 LTS")
  console.log()

  await Template.build(template, "nextjs-quality-gates", {
    cpuCount: 2,
    memoryMB: 4096,
    onBuildLogs: defaultBuildLogger(),
  })

  console.log()
  console.log("Template built successfully!")
  console.log('Use: Sandbox.create("nextjs-quality-gates") in your code')
}

main().catch((err) => {
  console.error("Build failed:", err)
  process.exit(1)
})
