import { PrismaClient } from '@prisma/client'

type PrismaClientLike = PrismaClient

type LazyPrismaClient = {
  client: PrismaClientLike
  hasInstance: () => boolean
}

function createPrismaClient(url?: string, log: ('query' | 'error' | 'warn')[] = ['error']): PrismaClientLike {
  return new PrismaClient({
    log,
    datasources: {
      db: {
        url
      }
    }
  })
}

function createLazyPrismaClient(factory: () => PrismaClientLike): LazyPrismaClient {
  let instance: PrismaClientLike | null = null
  let initError: unknown = null

  const getInstance = (): PrismaClientLike => {
    if (instance) return instance
    if (initError) throw initError

    try {
      instance = factory()
      return instance
    } catch (error) {
      initError = error
      throw error
    }
  }

  const clientProxy = new Proxy({}, {
    get(_target, prop) {
      const client = getInstance() as any
      const value = client[prop]
      return typeof value === 'function' ? value.bind(client) : value
    }
  }) as PrismaClientLike

  return {
    client: clientProxy,
    hasInstance: () => instance !== null
  }
}

const primaryClient = createLazyPrismaClient(() =>
  createPrismaClient(
    process.env.DATABASE_URL,
    process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  )
)

const replicaClient = createLazyPrismaClient(() =>
  createPrismaClient(process.env.DATABASE_URL_REPLICA || process.env.DATABASE_URL, ['error'])
)

// Primary Client (Read/Write)
export const prisma = primaryClient.client

// Replica Client (Read Only)
// Falls back to primary if replica URL is not configured
export const prismaReplica = replicaClient.client

export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Primary Database connected successfully')

    if (process.env.DATABASE_URL_REPLICA) {
      await prismaReplica.$connect()
      console.log('✅ Replica Database connected successfully')
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

export async function disconnectDatabase() {
  try {
    if (primaryClient.hasInstance()) {
      await prisma.$disconnect()
    }
    if (process.env.DATABASE_URL_REPLICA && replicaClient.hasInstance()) {
      await prismaReplica.$disconnect()
    }
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

const isTestRuntime = process.env.NODE_ENV === 'test' || process.argv.includes('--test')

if (!isTestRuntime) {
  process.on('beforeExit', async () => {
    await disconnectDatabase()
  })

  process.on('SIGINT', async () => {
    await disconnectDatabase()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}
