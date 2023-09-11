import { wrapError } from '../../utils/wrapError'
import type {
  Module,
  DidApi,
  StorageApi,
  StorageApiProvider,
  NessieRequest,
  NessieResponse,
  DidDocument as IDidDocument,
  CoreApi,
  ConsentCacheApiProvider,
  ConsentCacheApi
} from '../../interfaces'

const enc = new TextEncoder()
const dec = new TextDecoder()

type RuntimeRequirements = CoreApi & StorageApiProvider & ConsentCacheApiProvider

class DidModule<R extends RuntimeRequirements> implements DidApi, Module {
  private readonly storage: StorageApi
  private readonly consentCache: ConsentCacheApi
  private readonly coreApi: CoreApi

  constructor (runtime: R) {
    this.storage = runtime.getStorage()
    this.consentCache = runtime.getConsentCacheApi()
    this.coreApi = runtime
  }

  async processRPCRequest (req: NessieRequest): Promise<NessieResponse> {
    switch (req.method) {
      case 'import': {
        const didDoc = req.args as IDidDocument
        if (!await this.checkConsent(req, 'Import DID')) {
          return { error: 'User denied consent' }
        }
        return { result: await this.import(didDoc) }
      }
      case 'update': {
        const didDoc = req.args as IDidDocument
        if (!await this.checkConsent(req, 'Update DID')) {
          return { error: 'User denied consent' }
        }
        return { result: await this.update(didDoc) }
      }
      case 'get': {
        const { did } = req.args as { did: string }
        if (!await this.checkConsent(req, `Get DID ${did}`)) {
          return { error: 'User denied consent' }
        }
        return { result: await this.get(did) }
      }
      case 'remove': {
        const { did } = req.args as { did: string }
        if (!await this.checkConsent(req, `Remove DID ${did}`)) {
          return { error: 'User denied consent' }
        }
        await this.remove(did)
        return { result: true }
      }
      case 'list': {
        const list = await this.list()
        if (!await this.consentCache.check('dids', 'list', req.origin)) {
          const resp = await this.coreApi.openPopup('dids-list-consent', {
            origin: req.origin,
            args: {
              dids: list
            }
          })
          if (resp.meta !== undefined && resp.meta?.cacheSeconds > 0) {
            await this.consentCache.cache('dids', 'list', req.origin, resp.meta.cacheSeconds, resp.result)
          }
          return { result: resp.result }
        } else {
          const list = await this.consentCache.getContext('dids', 'list', req.origin)
          if (list === undefined) {
            throw new Error('consent cache is empty')
          }
          return { result: list }
        }
      }
    }
    throw new Error('Method not implemented.')
  }

  async import (doc: IDidDocument): Promise<IDidDocument> {
    const bs = enc.encode(JSON.stringify(doc))
    await this.storage.set(this.storageKey(doc.id), bs)
    return doc
  }

  async update (doc: IDidDocument): Promise<IDidDocument> {
    try {
      await this.get(doc.id)
      const bs = enc.encode(JSON.stringify(doc))
      await this.storage.set(this.storageKey(doc.id), bs)
      return doc
    } catch (err) {
      throw wrapError('Error updating DID info', err)
    }
  }

  async get (did: string): Promise<IDidDocument> {
    try {
      const bs = await this.storage.get(this.storageKey(did))
      const info: IDidDocument = JSON.parse(dec.decode(bs))
      return info
    } catch (err) {
      throw wrapError('Error getting DID info', err)
    }
  }

  async remove (did: string): Promise<void> {
    try {
      await this.get(did)
      await this.storage.remove(this.storageKey(did))
    } catch (err) {
      throw wrapError('Error removing DID info', err)
    }
  }

  async list (): Promise<IDidDocument[]> {
    try {
      const dids: IDidDocument[] = []
      const values = await this.storage.all(this.storageKey(''))
      console.log('retrieved did values:', values.map(v => dec.decode(v[1])))
      for (const [, value] of values) {
        const info: IDidDocument = JSON.parse(dec.decode(value))
        dids.push(info)
      }
      return dids
    } catch (err) {
      throw wrapError('Error listing DIDs', err)
    }
  }

  private storageKey (did: string): string {
    return `did-module:${did}`
  }

  private async checkConsent (req: NessieRequest, msg: string): Promise<boolean> {
    try {
      const ok = await this.consentCache.check(req.module, req.method, req.origin)
      if (!ok) {
        const resp = await this.coreApi.openPopup('generic-consent', {
          origin: req.origin,
          args: { msg }
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

export {
  DidModule
}
