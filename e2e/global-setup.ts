import { execSync } from 'node:child_process'

export default async function globalSetup() {
  execSync('npx tsx server/src/seed.ts', { stdio: 'inherit' })
  console.log('[e2e] seed concluído')
}
