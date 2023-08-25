import type {
  ConsentCacheApi,
  ConsentCacheApiProvider,
  CoreApi,
  DidApi,
  DidApiProvider,
  KeysApi,
  KeysApiProvider,
  KiltApi,
  Module,
  NessieRequest,
  NessieResponse,
  StorageApi,
  StorageApiProvider,
} from '../../interfaces'

import { WsProvider } from '@polkadot/rpc-provider'
import { ApiPromise } from '@polkadot/api'
import '@kiltprotocol/augment-api'

import { wrapError } from '../../utils/wrapError'
import { DidDidDetails, DidDidDetailsDidCreationDetails } from '@kiltprotocol/augment-api'
import { Signer, SignerResult } from '@polkadot/api/types'
import { SignerPayloadJSON } from '@polkadot/types/types'

import { DidDocument } from '../dids/DidDocument'
import { u8aToHex } from '@polkadot/util'

const DEFAULT_RPC_PROVIDER = 'wss://spiritnet.kilt.io'

let sigId = 0

type RuntimeRequirements = KeysApiProvider &
  DidApiProvider &
  StorageApiProvider &
  CoreApi &
  ConsentCacheApiProvider

class KiltModule<R extends RuntimeRequirements> implements KiltApi, Module {
  private readonly keysApi: KeysApi
  private readonly didApi: DidApi
  private readonly storage: StorageApi
  private readonly consentCache: ConsentCacheApi
  private readonly coreApi: CoreApi

  private rpcProvider: string | null = null
  private provider: WsProvider | null = null
  private apiPromise: ApiPromise | null = null

  public constructor(runtime: R) {
    this.keysApi = runtime.getKeysApi()
    this.didApi = runtime.getDidApi()
    this.storage = runtime.getStorage()
    this.consentCache = runtime.getConsentCacheApi()
    this.coreApi = runtime
  }

  public async getDidNonce(did: string): Promise<number> {
    try {
      const doc = await this.getDidDocument(did)
      return doc.lastTxCounter.toNumber()
    } catch (error) {
      throw wrapError('Failed to retrieve nonce', error)
    }
  }

  public async getDidDocument(did: string): Promise<DidDidDetails> {
    try {
      const api = await this.getKiltApi()
      console.log('got api')
      if (did.startsWith('did:kilt:')) {
        did = did.substring('did:kilt:'.length)
      }
      if (did.indexOf('#') !== undefined) {
        did = did.split('#')[0]
      }
      const resp = await api.query.did.did(did)
      if (resp.isNone) {
        throw new Error('DID does not exist')
      }
      const doc = resp.unwrap()
      return doc
    } catch (error) {
      throw wrapError('Failed to retrieve DID document', error)
    }
  }

  public async getBlockNumber(): Promise<number> {
    try {
      const api = await this.getKiltApi()
      const blockNumber = await api.query.system.number()
      return blockNumber.toNumber()
    } catch (error) {
      throw wrapError('Failed to retrieve block number', error)
    }
  }

  public async signAndSubmitExtrinsic(kid: string, extrinsic: string): Promise<void> {
    try {
      const api = await this.getKiltApi()
      const ext = api.tx(extrinsic)
      const account = api.createType('AccountId', kid)
      await ext.signAndSend(account, { signer: await this.getSigner(kid) }, (result) => {
        console.log(`Current status is ${result.status}`)
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`)
        }
      })
    } catch (error) {
      throw wrapError('Failed to sign and submit extrinsic', error)
    }
  }

  public async signExtrinsic(kid: string, extrinsic: string): Promise<string> {
    try {
      const api = await this.getKiltApi()
      const ext = api.tx(extrinsic)
      const account = api.createType('AccountId', kid)
      const signed = await ext.signAsync(account, { signer: await this.getSigner(kid) })
      return signed.toHex()
    } catch (error) {
      throw wrapError('Failed to sign extrinsic', error)
    }
  }

  public async signExtrinsicPayload(
    kid: string,
    payload: SignerPayloadJSON
  ): Promise<SignerResult> {
    try {
      const signer = await this.getSigner(kid)
      if (signer.signPayload === undefined) {
        throw new Error('Signer does not support signPayload')
      }
      const signed = await signer.signPayload(payload)
      return signed
    } catch (error) {
      throw wrapError('Failed to sign extrinsic', error)
    }
  }

  public async authorizeDidOperation(
    did: string,
    kid: string,
    submitter: string,
    extrinsic: string
  ): Promise<string> {
    try {
      const api = await this.getKiltApi()
      const call = api.tx(extrinsic)
      const didAccountId = api.createType('AccountId32', did.substring('did:kilt:'.length))
      const submitterAccountId = api.createType('AccountId32', submitter)
      const txCounter = api.createType('u64', (await this.getDidNonce(did)) + 1)
      const blockNumber = api.createType('u64', await this.getBlockNumber())
      const didAuthorized = api.createType('DidDidDetailsDidAuthorizedCallOperation', {
        did: didAccountId,
        submitter: submitterAccountId,
        call,
        txCounter,
        blockNumber,
      })
      const scaleBytes = didAuthorized.toU8a()
      const sig = api.createType(
        'DidDidDetailsDidSignature',
        await this.keysApi.sign(kid, scaleBytes, true)
      )
      const ext = api.tx.did.submitDidCall(didAuthorized, sig)
      return ext.toHex()
    } catch (error) {
      throw wrapError('Failed to authorize DID operation', error)
    }
  }

  public async createDidExtrinsic(did: string, submitter: string): Promise<string> {
    try {
      const api = await this.getKiltApi()
      const didDoc = new DidDocument(await this.didApi.get(did))
      const creationDetails: DidDidDetailsDidCreationDetails = api.createType(
        'DidDidDetailsDidCreationDetails',
        {
          did: api.createType('AccountId32', did.substring('did:kilt:'.length)),
          submitter: api.createType('AccountId32', submitter),
        }
      )
      const scaleBytes = creationDetails.toU8a()
      const signingKey = didDoc.getAuthenticationKey()
      const sig = api.createType(
        'DidDidDetailsDidSignature',
        await this.keysApi.sign(u8aToHex(signingKey), scaleBytes, true)
      )
      const ext = api.tx.did.create(creationDetails, sig)
      return ext.toHex()
    } catch (error) {
      throw wrapError('Failed to create the create-did extrinsic', error)
    }
  }

  public async setRpcProvider(provider: string): Promise<void> {
    this.rpcProvider = provider
    await this.storage.set('kilt::rpcProvider', new TextEncoder().encode(this.rpcProvider))
  }

  public async processRPCRequest(req: NessieRequest): Promise<NessieResponse> {
    console.log('KiltModule.processRPCRequest:', req)
    switch (req.method) {
      case 'getDidNonce': {
        console.log('KiltModule.processRPCRequest: getDidNonce:', req.args)
        const { did } = req.args as { did: string }
        const nonce = await this.getDidNonce(did)
        return { result: nonce }
      }
      case 'getDidDocument': {
        console.log('KiltModule.processRPCRequest: getDidDocument:', req.args)
        const { did } = req.args as { did: string }
        const doc = await this.getDidDocument(did)
        return { result: doc }
      }
      case 'signAndSubmitExtrinsic': {
        console.log('KiltModule.processRPCRequest: signAndSubmitExtrinsic:', req.args)
        const { kid, extrinsic } = req.args as { kid: string; extrinsic: string }
        const api = await this.getKiltApi()
        const parsedTx = api.tx(extrinsic)
        const msg = `Do you want to sign and submit the following extrinsic with your key ${kid}?\n${JSON.stringify(
          parsedTx.toHuman(),
          null,
          2
        )}`
        if (!(await this.checkConsent(req, msg))) {
          return { error: 'User did not consent' }
        }
        await this.signAndSubmitExtrinsic(kid, extrinsic)
        return { result: null }
      }
      case 'signExtrinsic': {
        console.log('KiltModule.processRPCRequest: signExtrinsic:', req.args)
        const { kid, extrinsic } = req.args as { kid: string; extrinsic: string }
        const api = await this.getKiltApi()
        const parsedTx = api.tx(extrinsic)
        const msg = `Do you want to sign the following extrinsic?\n${JSON.stringify(
          parsedTx.toHuman(),
          null,
          2
        )}`
        if (!(await this.checkConsent(req, msg))) {
          return { error: 'User did not consent' }
        }
        const signed = await this.signExtrinsic(kid, extrinsic)
        return { result: signed }
      }
      case 'signExtrinsicPayload': {
        console.log('KiltModule.processRPCRequest: signExtrinsic:', req.args)
        const { kid, payload } = req.args as { kid: string; payload: SignerPayloadJSON }
        const msg = `Do you want to sign the following extrinsic payload?\n${JSON.stringify(
          JSON.stringify(payload),
          null,
          2
        )}`
        if (!(await this.checkConsent(req, msg))) {
          return { error: 'User did not consent' }
        }
        const signed = await this.signExtrinsicPayload(kid, payload)
        return { result: signed }
      }
      case 'authorizeDidOperation': {
        console.log('KiltModule.processRPCRequest: authorizeDidOperation:', req.args)
        const { did, kid, submitter, callData } = req.args as {
          did: string
          kid: string
          submitter: string
          callData: string
        }
        const api = await this.getKiltApi()
        const parsedCall = api.tx(callData)
        const msg = `Do you want to authorize the following operation by your DID ${did} using key ${kid}?\n${JSON.stringify(
          parsedCall.toHuman(),
          null,
          2
        )}`
        if (!(await this.checkConsent(req, msg))) {
          return { error: 'User did not consent' }
        }
        const signed = await this.authorizeDidOperation(did, kid, submitter, callData)
        return { result: signed }
      }
      case 'createDidExtrinsic': {
        console.log('KiltModule.processRPCRequest: createDidExtrinsic:', req.args)
        const { did, submitter } = req.args as { did: string; submitter: string }
        const msg = `Do you want to create a CreateDidExtrinsic for the DID ${did} using the account ${submitter} as submitter?`
        if (!(await this.checkConsent(req, msg))) {
          return { error: 'User did not consent' }
        }
        const signed = await this.createDidExtrinsic(did, submitter)
        return { result: signed }
      }
      case 'setRpcProvider': {
        console.log('KiltModule.processRPCRequest: setRpcProvider:', req.args)
        const { endpoint } = req.args as { endpoint: string }
        if (
          !(await this.checkConsent(req, `Do you want to set the RPC provider to ${endpoint}?`))
        ) {
          return { error: 'User did not consent' }
        }
        await this.setRpcProvider(endpoint)
        return { result: null }
      }
      case 'getRpcProvider': {
        console.log('KiltModule.processRPCRequest: getRpcProvider:', req.args)
        const endpoint = await this.getRpcProvider()
        return { result: endpoint }
      }
      default:
        throw new Error('Method not implemented.')
    }
  }

  private async getSigner(kid: string): Promise<Signer> {
    const api = await this.getKiltApi()
    return {
      signPayload: (payload: SignerPayloadJSON): Promise<SignerResult> => {
        return new Promise((resolve, reject) => {
          const ext = api.createType('ExtrinsicPayload', payload, { version: payload.version })
          this.keysApi
            .sign(kid, ext.toU8a({ method: true }), true)
            .then((sig) => {
              sigId++
              resolve({
                id: sigId,
                signature: `0x${Buffer.from(sig).toString('hex')}`,
                ...payload,
              })
            })
            .catch((err) => {
              reject(err)
            })
        })
      },
    }
  }

  private async getRpcProvider(): Promise<string> {
    if (this.rpcProvider === null) {
      try {
        const rpc = await this.storage.get('kilt::rpcProvider')
        this.rpcProvider = new TextDecoder().decode(rpc)
      } catch (e) {
        if (e instanceof Error) {
          console.warn('Failed to get rpcProvider from storage:', e.message)
        }
        await this.setRpcProvider(DEFAULT_RPC_PROVIDER)
      }
    }
    return this.rpcProvider ?? DEFAULT_RPC_PROVIDER
  }

  private async getKiltApi(): Promise<ApiPromise> {
    if (this.apiPromise !== null) {
      return this.apiPromise
    }
    const rpcProvider = await this.getRpcProvider()
    const provider = new WsProvider(rpcProvider ?? DEFAULT_RPC_PROVIDER)
    const api = await ApiPromise.create({ provider, throwOnConnect: true })
    this.apiPromise = api
    return api
  }

  private async checkConsent(req: NessieRequest, msg: string): Promise<boolean> {
    try {
      const ok = await this.consentCache.check(req.module, req.method, req.origin)
      if (!ok) {
        const resp = await this.coreApi.openPopup('generic-consent', {
          origin: req.origin,
          args: { msg },
        })
        if (resp.meta !== undefined && resp.meta?.cacheSeconds > 0) {
          await this.consentCache.cache(req.module, req.method, req.origin, resp.meta.cacheSeconds)
        }
      }
      return true
    } catch (err) {
      return false
    }
  }
}

export { KiltModule }
