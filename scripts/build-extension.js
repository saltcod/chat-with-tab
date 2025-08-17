import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Build the extension
console.log('Building extension...')
execSync('pnpm build:prod', { stdio: 'inherit' })

// Get the generated background script filename
const distAssetsDir = path.join(process.cwd(), 'dist', 'assets')
const files = fs.readdirSync(distAssetsDir)
const backgroundFile = files.find((file) => file.startsWith('background.ts-') && file.endsWith('.js'))

if (!backgroundFile) {
  console.error('Background script not found!')
  process.exit(1)
}

// Copy the background script to a consistent name
const sourcePath = path.join(distAssetsDir, backgroundFile)
const targetPath = path.join(distAssetsDir, 'background.js')
fs.copyFileSync(sourcePath, targetPath)

// Create the service worker file
const swContent = `import './assets/background.js';`
const swPath = path.join(process.cwd(), 'dist', 'background-sw.js')
fs.writeFileSync(swPath, swContent)

console.log('Extension built successfully!')
console.log(`Background script: ${backgroundFile} -> background.js`)
console.log('Service worker: background-sw.js')
