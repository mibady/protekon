import { Template } from "e2b"

export const template = Template()
  .fromUbuntuImage("22.04")
  .aptInstall(["curl", "git", "ca-certificates", "xz-utils"])
  .setEnvs({
    NODE_OPTIONS: "--max-old-space-size=3072",
    NEXT_TELEMETRY_DISABLED: "1",
  })
  // Install Node.js 22 LTS as root
  .setUser("root")
  .runCmd(
    "curl -fsSL https://nodejs.org/dist/v22.16.0/node-v22.16.0-linux-x64.tar.xz | tar -xJ --no-same-owner -C /usr/local --strip-components=1"
  )
  .runCmd("node --version && npm --version")
  // Switch back to default user
  .setUser("user")
  .setWorkdir("/home/user/project")
