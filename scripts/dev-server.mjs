import net from 'node:net'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const envPath = path.join(projectRoot, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const match = envContent.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m)
    if (match) return match[1]
  }
  return null
}

function isPortOpen(port = 5432, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(800)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => {
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function waitForPort(port = 5432, host = '127.0.0.1', timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port, host)) {
      return true
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

async function main() {
  const port = 5432
  let dbProcess = null

  const dbUrl = getDatabaseUrl()
  const isLocalDb = dbUrl && (dbUrl.includes('127.0.0.1') || dbUrl.includes('localhost'))

  if (!isLocalDb && dbUrl) {
    console.log(`[database] Using remote database from DATABASE_URL. Local database server skipped (no local storage).`)
  } else {
    const alreadyRunning = await isPortOpen(port)
    if (alreadyRunning) {
      console.log(`[database] PostgreSQL/PGlite server is already running on port ${port}.`)
    } else {
      console.log(`[database] Starting local PGlite database server on port ${port}...`)
      const pgliteCli = path.join(
        projectRoot,
        'node_modules',
        '@electric-sql',
        'pglite-socket',
        'dist',
        'scripts',
        'server.js'
      )
      const pgDataDir = path.join(projectRoot, 'prisma', 'pgdata')

      dbProcess = spawn(process.execPath, [pgliteCli, '-d', pgDataDir, '-p', String(port), '-m', '50'], {
        cwd: projectRoot,
        stdio: 'inherit',
      })

      dbProcess.on('error', (err) => {
        console.error('[database] Failed to spawn PGlite server:', err)
      })

      const isReady = await waitForPort(port)
      if (!isReady) {
        console.error(`[database] Warning: Database server did not respond on port ${port} within timeout.`)
      } else {
        console.log(`[database] Local database server is ready on port ${port}.`)
      }
    }
  }

  console.log('[app] Starting Next.js development server...')
  const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
  const nextProcess = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  function cleanup() {
    if (nextProcess && !nextProcess.killed) {
      nextProcess.kill()
    }
    if (dbProcess && !dbProcess.killed) {
      console.log('\n[database] Stopping local PGlite database server...')
      dbProcess.kill()
    }
  }

  process.on('SIGINT', () => {
    cleanup()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    cleanup()
    process.exit(0)
  })

  process.on('exit', cleanup)

  nextProcess.on('exit', (code) => {
    cleanup()
    process.exit(code ?? 0)
  })
}

main().catch((err) => {
  console.error('[dev-server] Fatal error:', err)
  process.exit(1)
})
