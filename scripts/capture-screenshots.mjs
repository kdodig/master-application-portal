import { mkdirSync, existsSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const outDir = 'slides/screenshots'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const shots = [
  { path: '/admin/login', file: '01-login.png' },
  { path: '/admin/user/change-password', file: '02-change-password.png' },
  { path: '/admin/stats', file: '03-stats.png' },
  { path: '/admin/demo/applicants', file: '04-applicants.png' },
  // Open actions menu and show Documents Review modal
  { path: '/admin/demo/applicants', file: '05-documents-review.png', action: async (page) => {
    // open first row actions menu
    await page.click('button:has([data-icon="lucide:ellipsis-vertical"])')
    await page.click('text=1. Documents Review')
    await page.waitForTimeout(500)
  } },
  // Courses Review modal
  { path: '/admin/demo/applicants', file: '06-courses-review.png', action: async (page) => {
    await page.click('button:has([data-icon="lucide:ellipsis-vertical"])')
    await page.click('text=2. Courses Review')
    await page.waitForTimeout(500)
  } },
  // Personal Skills modal
  { path: '/admin/demo/applicants', file: '07-personal-skills.png', action: async (page) => {
    await page.click('button:has([data-icon="lucide:ellipsis-vertical"])')
    await page.click('text=3. Personal Skills Review')
    await page.waitForTimeout(500)
  } },
  { path: '/admin/demo/settings/accounts', file: '08-accounts.png' },
]

async function run() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  for (const shot of shots) {
    const url = `${BASE}${shot.path}`
    console.log('Visiting', url)
    await page.goto(url, { waitUntil: 'networkidle' })
    if (shot.action) {
      await shot.action(page)
    }
    await page.screenshot({ path: `${outDir}/${shot.file}`, fullPage: true })
  }

  await browser.close()
}

run().catch((e) => { console.error(e); process.exit(1) })

