import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fragmentPath = resolve(themeRoot, 'playground/pnpm-workspace.yaml')
const workspaceFile = resolve(process.cwd(), 'pnpm-workspace.yaml')

const fragment = readFileSync(fragmentPath, 'utf8')
let clientText = readFileSync(workspaceFile, 'utf8')

const allowMatch = fragment.match(/^allowBuilds:\n((?:  .+\n?)+)/m)
if (!allowMatch) {
  console.error('playground/pnpm-workspace.yaml: allowBuilds block not found')
  process.exit(1)
}

const entries = allowMatch[1]
  .split('\n')
  .map(line => line.trimEnd())
  .filter(line => line.trim())

if (!clientText.includes('allowBuilds:')) {
  console.error('client pnpm-workspace.yaml: allowBuilds block not found')
  process.exit(1)
}

const lines = clientText.split('\n')
let allowStart = lines.findIndex(line => line === 'allowBuilds:')
if (allowStart === -1) {
  console.error('client pnpm-workspace.yaml: allowBuilds block not found')
  process.exit(1)
}

let allowEnd = allowStart + 1
while (allowEnd < lines.length && lines[allowEnd].startsWith('  ')) {
  allowEnd++
}

for (const entry of entries) {
  const key = entry.replace(/: true$/, '').trim()
  if (clientText.includes(key)) {
    continue
  }
  lines.splice(allowEnd, 0, entry)
  allowEnd++
}

const next = `${lines.join('\n')}\n`
writeFileSync(workspaceFile, next)

for (const entry of entries) {
  const key = entry.replace(/: true$/, '').trim()
  if (!next.includes(key)) {
    console.error(`failed to merge allowBuilds entry: ${key}`)
    process.exit(1)
  }
}

console.log('merged theme-win95 playground allowBuilds into client workspace')
