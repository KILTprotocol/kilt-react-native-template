import type {
  Module,
  CoreApi,
  NessieRequest,
  NessieResponse,
  StorageApiProvider,
  StorageApi,
  KeysApiProvider,
  KeysApi,
  PopupArgs,
  ConsentCacheApiProvider,
  ConsentCacheApi,
  MasterKeyProvider,
  DidApi,
  DidApiProvider,
  DidNonceApi,
  DidNonceApiProvider,
  KiltApi,
  KiltApiProvider,
  CredentialStoreApi,
  CredentialStoreApiProvider,
} from './interfaces'

import { Storage } from './modules/storage/storage'
// import { KeysModule } from './modules/keys'
// import { ConsentCache } from './modules/consentcache/ConsentCache'
// import { DidModule } from './modules/dids'
// import { KiltModule } from './modules/kilt'
// import { CredentialApiModule } from './modules/credentialapi'
// import { CredentialStore } from './modules/credentialstore'

class NessieRuntime implements CoreApi, StorageApiProvider {
  // KeysApiProvider,
  // ConsentCacheApiProvider,
  // MasterKeyProvider,
  // DidApiProvider,
  // DidNonceApiProvider,
  // KiltApiProvider,
  // CredentialStoreApiProvider
  private readonly modules: Map<string, Module> = new Map<string, Module>()
  private readonly requests = new Map<
    string,
    { resolve: (resp: NessieResponse) => void; reject: (err: any) => void }
  >()
  private readonly storage: Storage<typeof this>
  // private readonly keys: KeysModule<typeof this>
  // private readonly consentCache: ConsentCache<typeof this>
  // private readonly dids: DidModule<typeof this>
  // private readonly kilt: KiltModule<typeof this>
  // private readonly credentialApi: CredentialApiModule<typeof this>
  // private readonly credentialStore: CredentialStore<typeof this>

  constructor(password?: string) {
    this.storage = new Storage(this, password)
    // this.consentCache = new ConsentCache(this)
    // this.keys = new KeysModule(this)
    // this.dids = new DidModule(this)
    // this.kilt = new KiltModule(this)
    // this.credentialStore = new CredentialStore(this)
    // this.credentialApi = new CredentialApiModule(this)

    this.modules.set('storage', this.storage)
    // this.modules.set('keys', this.keys)
    // this.modules.set('consentcache', this.consentCache)
    // this.modules.set('dids', this.dids)
    // this.modules.set('kilt', this.kilt)
    // this.modules.set('credentialstore', this.credentialStore)
    // this.modules.set('credentialapi', this.credentialApi)
  }

  async getMasterKey(): Promise<string> {
    return await this.storage.getPassword()
  }

  async openPopup(navigation, args: PopupArgs): Promise<NessieResponse> {
    return navigation.navigate(args)
  }

  handlePopupResponse(resp: NessieResponse): void {
    const requestId: string = (resp as any).__id
    const req = this.requests.get(requestId)
    if (req === undefined) {
      return
    }
    const { resolve, reject } = req
    if (resolve === undefined || reject === undefined) {
      throw new Error(`Request ${requestId} not found.`)
    }
    this.requests.delete(requestId)
    console.log('handlePopupResponse:', resp)
    if (resp.error !== undefined) {
      reject(resp.error)
    } else {
      if (resp.meta !== undefined) {
        console.log('handlePopupResponse: meta:', resp.meta)
      }
      resolve(resp)
    }
  }

  async processRPCRequest(req: NessieRequest): Promise<NessieResponse> {
    const m = this.modules.get(req.module)
    if (m === undefined) {
      throw new Error(`Module '${req.module}' not found.`)
    }
    return await m.processRPCRequest(req)
  }

  async unlock(): Promise<void> {
    await this.storage.getPassword()
    // await this.keys.list()
  }

  getStorage(): StorageApi {
    return this.storage
  }

  // getKeysApi(): KeysApi {
  //   return this.keys
  // }

  // getConsentCacheApi(): ConsentCacheApi {
  //   return this.consentCache
  // }

  // getDidApi(): DidApi {
  //   return this.dids
  // }

  // getDidNonceApi: () => DidNonceApi = () => {
  //   return this.kilt
  // }

  // getKiltApi: () => KiltApi = () => {
  //   return this.kilt
  // }

  // getCredentialStoreApi: () => CredentialStoreApi = () => {
  //   return this.credentialStore
  // }
}

export { NessieRuntime }
