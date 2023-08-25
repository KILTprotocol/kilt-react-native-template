import {
  type StorageApiProvider,
  type StorageApi,
  type ConsentCacheApi,
  type Module,
  type NessieRequest,
  type NessieResponse
} from '../../interfaces'

export class ConsentCache<R extends StorageApiProvider> implements ConsentCacheApi, Module {
  private readonly storage: StorageApi

  constructor (runtime: R) {
    this.storage = runtime.getStorage()
  }

  async processRPCRequest (req: NessieRequest): Promise<NessieResponse> {
    if (req.module !== 'consentcache') {
      throw new Error(`Module ${req.module} not found.`)
    }
    throw new Error('No direct RPC to the consent cache!')
    // if (req.method === 'cache') {
    //   const { module, method, origin, durationSeconds } = req.args as any
    //   await this.cache(module, method, origin, durationSeconds)
    //   return {}
    // } else if (req.method === 'check') {
    //   const { module, method, origin } = req.args as any
    //   const result = await this.check(module, method, origin)
    //   return { result }
    // } else {
    //   throw new Error(`Method ${req.method} not found.`)
    // }
  }

  async cache (module: string, method: string, origin: string, durationSeconds: number, context?: any): Promise<void> {
    console.log('consentcache::cache:', module, method, origin, durationSeconds)
    const key = `consentcache:${module}:${method}:${origin}`
    const value = Buffer.alloc(8)
    value.writeBigInt64LE(BigInt(Date.now() + durationSeconds * 1000))
    await this.storage.set(key, value)
    if (context !== undefined) {
      const buf = Buffer.from(JSON.stringify(context))
      await this.storage.set(`${key}:context`, buf)
    }
  }

  async check (module: string, method: string, origin: string): Promise<boolean> {
    console.log('consentcache::check:', module, method, origin)
    const key = `consentcache:${module}:${method}:${origin}`
    try {
      const value = await this.storage.get(key)
      if (value === null) {
        return false
      }
      console.log('got value from consent cache:', value, 'for key:', key)
      const expires = Buffer.from(value).readBigInt64LE()
      console.log('expires   :', expires)
      console.log('Date.now():', Date.now())
      if (expires < Date.now()) {
        await this.storage.remove(key)
        return false
      }
      return true
    } catch (err) {
      console.error('consentcache::check: error:', err)
      return false
    }
  }

  async getContext (module: string, method: string, origin: string): Promise<any> {
    const key = `consentcache:${module}:${method}:${origin}:context`
    try {
      const value = await this.storage.get(key)
      if (value === null) {
        return undefined
      }
      return JSON.parse(Buffer.from(value).toString())
    } catch (err) {
      return undefined
    }
  }
}
