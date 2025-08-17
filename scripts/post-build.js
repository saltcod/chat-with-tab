import fs from 'fs'
import path from 'path'

console.log('Running post-build script...')

const distAssetsDir = path.join(process.cwd(), 'dist', 'assets')
const files = fs.readdirSync(distAssetsDir)

// Find background script
const backgroundFile = files.find((file) => file.startsWith('background.ts-') && file.endsWith('.js'))
if (backgroundFile) {
  const sourcePath = path.join(distAssetsDir, backgroundFile)
  const targetPath = path.join(distAssetsDir, 'background.js')
  fs.copyFileSync(sourcePath, targetPath)
  console.log(`Renamed ${backgroundFile} -> background.js`)
}

// Find content script
const contentFile = files.find((file) => file.startsWith('index.tsx-') && file.endsWith('.js'))
if (contentFile) {
  const sourcePath = path.join(distAssetsDir, contentFile)
  const targetPath = path.join(distAssetsDir, 'content.js')
  fs.copyFileSync(sourcePath, targetPath)
  console.log(`Renamed ${contentFile} -> content.js`)
}

// Update service worker loader to use consistent filename
const swLoaderPath = path.join(process.cwd(), 'dist', 'service-worker-loader.js')
if (fs.existsSync(swLoaderPath)) {
  let content = fs.readFileSync(swLoaderPath, 'utf8')
  console.log('Original service worker content:', content)
  
  // Replace the dynamic import with our consistent filename
  content = content.replace(/import '\.\/assets\/background\.ts-[^']+\.js';/, "import './assets/background.js';")
  
  // Also try a more general replacement in case the pattern is different
  content = content.replace(/import '\.\/assets\/background[^']*\.js';/, "import './assets/background.js';")
  
  fs.writeFileSync(swLoaderPath, content)
  console.log('Updated service worker content:', content)
  console.log('Updated service-worker-loader.js to use background.js')
}

// Update manifest to use consistent content script filename
const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json')
if (fs.existsSync(manifestPath)) {
  let content = fs.readFileSync(manifestPath, 'utf8')
  // Replace the dynamic content script filename with our consistent one
  content = content.replace(/assets\/index\.tsx-[^"]+\.js/g, 'assets/content.js')
  fs.writeFileSync(manifestPath, content)
  console.log('Updated manifest.json to use content.js')
}

console.log('Post-build script completed!')
