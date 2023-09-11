import type {
  StorageApiProvider,
  StorageApi,
  CredentialStoreApi,
  Module,
  NessieRequest,
  NessieResponse,
  KiltCredential
} from '../../interfaces'

export class CredentialStore<R extends StorageApiProvider> implements CredentialStoreApi, Module {
  private readonly storage: StorageApi

  constructor (runtime: R) {
    this.storage = runtime.getStorage()
  }

  async processRPCRequest (req: NessieRequest): Promise<NessieResponse> {
    if (req.module !== 'credentialstore') {
      throw new Error(`Module ${req.module} not found.`)
    }
    switch (req.method) {
      case 'store':
        await this.store(req.args as KiltCredential)
        return {}
      case 'get':
        return { result: await this.get(req.args as string) }
      case 'remove':
        await this.remove(req.args as string)
        return {}
      case 'list':
        return { result: await this.list() }
      default:
        throw new Error(`Method ${req.method} not found.`)
    }
  }

  async store (cred: KiltCredential): Promise<void> {
    console.log('credentialstore::store:', cred)
    const key = `credentialstore:${cred.rootHash}`
    const value = Buffer.from(JSON.stringify(cred))
    await this.storage.set(key, value)
  }

  async get (rootHash: string): Promise<KiltCredential> {
    console.log('credentialstore::get:', rootHash)
    const key = `credentialstore:${rootHash}`
    const value = await this.storage.get(key)
    if (value === null) {
      throw new Error(`Credential not found for root hash ${rootHash}`)
    }
    return JSON.parse(Buffer.from(value).toString()) as KiltCredential
  }

  async remove (rootHash: string): Promise<void> {
    console.log('credentialstore::remove:', rootHash)
    const key = `credentialstore:${rootHash}`
    await this.storage.remove(key)
  }

  async list (): Promise<KiltCredential[]> {
    console.log('credentialstore::list')
    const keyPrefix = 'credentialstore:'
    const all = await this.storage.all(keyPrefix)
    return all.map(([, value]) => JSON.parse(Buffer.from(value).toString()) as KiltCredential)
  }
}
