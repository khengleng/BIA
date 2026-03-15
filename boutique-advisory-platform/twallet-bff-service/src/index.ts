import dotenv from 'dotenv'
dotenv.config()

import { createServer, Server } from 'http'
import { config } from './config'
import { createApp } from './app'

const app = createApp(config)
let server: Server | null = null
let shuttingDown = false

async function start(): Promise<void> {
  server = createServer(app)
  server.listen(config.port, '0.0.0.0', () => {
    console.log(`${config.serviceName} listening on ${config.port}`)
  })
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`Received ${signal}. Shutting down ${config.serviceName}...`)

  await new Promise<void>((resolve) => {
    if (!server) {
      resolve()
      return
    }

    server.close(() => resolve())
  })

  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

start().catch((error) => {
  console.error(`Failed to start ${config.serviceName}:`, error)
  process.exit(1)
})
