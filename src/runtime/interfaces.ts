import type { DidDidDetails } from '@kiltprotocol/augment-api'
import type { KeypairType } from '@polkadot/util-crypto/types'

export interface KeyInfo {
  kid: string
  name: string
  type: KeypairType | 'x25519'
}

interface NessieRequest {
  name: string
  module: string
  method: string
  params: unknown
}

interface NessieResponse {
  result?: unknown
  error?: unknown
  meta?: {
    cacheSeconds: number
  }
}

interface PopupArgs {
  name: string
  params: unknown
}

interface CoreApi {
  unlock: () => Promise<void>
  processRPCRequest: (req: NessieRequest) => Promise<NessieResponse>
  openPopup: (view: string, args: PopupArgs) => Promise<NessieResponse>
  handlePopupResponse: (resp: NessieResponse) => void
}

interface Module {
  processRPCRequest: (req: NessieRequest) => Promise<NessieResponse>
}

interface StorageApi {
  // get returns the value to a given key
  get: (key: string) => Promise<Uint8Array>
  // set sets the value to a given key and returns the previous value if any
  set: (key: string, value: Uint8Array) => Promise<Uint8Array | null>
  // remove removes the value to a given key
  remove: (key: string) => Promise<void>
  // all returns all key-value pairs in the storage
  all: (prefix?: string) => Promise<Array<[string, Uint8Array]>>
}

interface StorageApiProvider {
  getStorage: () => StorageApi
}

interface KeysApi {
  generateMnemonic: (words: 12 | 15 | 18 | 21 | 24) => Promise<string>
  import: (
    mnemonic: string,
    derivationPath: string,
    keyType: KeypairType | 'x25519',
    name: string
  ) => Promise<KeyInfo>
  remove: (kid: string) => Promise<void>
  list: () => Promise<KeyInfo[]>
  sign: (kid: string, msg: Uint8Array, withType?: boolean) => Promise<Uint8Array>
  encrypt: (kid: string, receiverPubkey: Uint8Array, msg: Uint8Array) => Promise<Uint8Array>
  decrypt: (kid: string, senderPubKey: Uint8Array, msg: Uint8Array) => Promise<Uint8Array>
}

interface KeysApiProvider {
  getKeysApi: () => KeysApi
}

interface Container {
  id: string
  component: React.FC
}

interface ConsentCacheApi {
  cache: (
    module: string,
    method: string,
    origin: string,
    durationSeconds: number,
    context?: any
  ) => Promise<void>
  check: (module: string, method: string, origin: string) => Promise<boolean>
  getContext: (module: string, method: string, origin: string) => Promise<any>
}

interface ConsentCacheApiProvider {
  getConsentCacheApi: () => ConsentCacheApi
}

interface MasterKeyProvider {
  getMasterKey: () => Promise<string>
}

interface DidVerificationMethod {
  id: string
  controller: string
  type: string
  publicKeyBase58: string
}

interface DidService {
  id: string
  type: string[]
  serviceEndpoint: string[]
}

interface DidDocument {
  '@context': string[]
  id: string
  verificationMethod: DidVerificationMethod[]
  authentication: string[]
  keyAgreement: string[]
  assertionMethod: string[]
  service: DidService[]
  alsoKnownAs: string[]
}

interface DidApi {
  import: (doc: DidDocument) => Promise<DidDocument>
  remove: (did: string) => Promise<void>
  list: () => Promise<DidDocument[]>
  get: (did: string) => Promise<DidDocument>
  update: (info: DidDocument) => Promise<DidDocument>
}

interface DidApiProvider {
  getDidApi: () => DidApi
}

interface DidNonceApi {
  getDidNonce: (did: string) => Promise<number>
}

interface DidNonceApiProvider {
  getDidNonceApi: () => DidNonceApi
}

interface KiltApi extends DidNonceApi {
  getDidDocument: (did: string) => Promise<DidDidDetails>
  signAndSubmitExtrinsic: (kid: string, extrinsic: string) => Promise<void>
  signExtrinsic: (kid: string, extrinsic: string) => Promise<string>
}

interface KiltApiProvider {
  getKiltApi: () => KiltApi
}

interface CType {
  $id: string
  $schema: string
  title: string
  properties: Record<string, object>
  type: 'object'
  additionalProperties?: false
}

interface KiltCredential {
  claim: {
    cTypeHash: string
    contents: object
    owner: string
  }
  attester: string
  claimNonceMap: Record<string, string>
  claimHashes: string[]
  legitimations: KiltCredential[]
  delegationId: string | null
  rootHash: string
  cType: CType
}

interface CredentialStoreApi {
  store: (credential: KiltCredential) => Promise<void>
  get: (rootHash: string) => Promise<KiltCredential>
  remove: (rootHash: string) => Promise<void>
  list: () => Promise<KiltCredential[]>
}

interface CredentialStoreApiProvider {
  getCredentialStoreApi: () => CredentialStoreApi
}

export type {
  NessieRequest,
  NessieResponse,
  CoreApi,
  Module,
  StorageApi,
  StorageApiProvider,
  KeysApi,
  KeysApiProvider,
  Container,
  PopupArgs,
  ConsentCacheApi,
  ConsentCacheApiProvider,
  MasterKeyProvider,
  DidApi,
  DidApiProvider,
  KiltApi,
  KiltApiProvider,
  DidNonceApi,
  DidNonceApiProvider,
  CType,
  KiltCredential,
  CredentialStoreApi,
  CredentialStoreApiProvider,
  DidDocument,
  DidService,
  DidVerificationMethod,
}
