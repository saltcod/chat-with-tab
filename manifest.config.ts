import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Page Chat (Bottom Panel)',
  version: '0.0.2',
  description: 'Injects a bottom drawer (Alt+J).',
  action: { default_title: 'Page Chat' },
  background: { service_worker: 'src/background.ts', type: 'module' },
  content_scripts: [{ matches: ['<all_urls>'], js: ['src/content/index.tsx'], run_at: 'document_idle' }],

  permissions: ['scripting', 'activeTab'],
})
