import { KeyringPair } from '@kiltprotocol/sdk-js'
import { KeyringPair$Json, KeyringPair$Meta } from '@polkadot/keyring/types'
import { Base } from '@polkadot/ui-keyring/Base'
import { AddressSubject, SingleAddress } from '@polkadot/ui-keyring/observable/types'

import {
  KeyringOptions,
  KeyringJson$Meta,
  KeyringJson,
  KeyringItemType,
  KeyringAddress,
  KeyringStruct,
  CreateResult,
  KeyringAddressType,
} from '@polkadot/ui-keyring/types'
import { isString, hexToU8a, isHex, u8aToHex } from '@polkadot/util'
import { KeypairType } from '@polkadot/util-crypto/types'
import { decodeAddress } from '@polkadot/keyring'
import { KeyringOption } from '@polkadot/ui-keyring/options'

const ACCOUNT_PREFIX = 'account:'
const ADDRESS_PREFIX = 'address:'
const CONTRACT_PREFIX = 'contract:'

function toHex(address: string): string {
  return u8aToHex(
    // When saving pre-checksum changes, ensure that we can decode
    decodeAddress(address, true)
  )
}

export function accountKey(address: string): string {
  return `${ACCOUNT_PREFIX}${toHex(address)}`
}

export function addressKey(address: string): string {
  return `${ADDRESS_PREFIX}${toHex(address)}`
}

export function contractKey(address: string): string {
  return `${CONTRACT_PREFIX}${toHex(address)}`
}

export const accountRegex = new RegExp(`^${ACCOUNT_PREFIX}0x[0-9a-f]*`, '')

export const addressRegex = new RegExp(`^${ADDRESS_PREFIX}0x[0-9a-f]*`, '')

export const contractRegex = new RegExp(`^${CONTRACT_PREFIX}0x[0-9a-f]*`, '')

const RECENT_EXPIRY = 24 * 60 * 60

const keyringOption = new KeyringOption()

export class Keyring extends Base implements KeyringStruct {
  private stores = {
    address: (): AddressSubject => this.addresses,
    contract: (): AddressSubject => this.contracts,
    account: (): AddressSubject => this.accounts,
  }

  public addPair(pair: KeyringPair, password: string): CreateResult {
    this.keyring.addPair(pair)

    return {
      json: this.saveAccount(pair, password),
      pair,
    }
  }

  public addUri(
    suri: string,
    password?: string,
    meta: KeyringPair$Meta = {},
    type?: KeypairType
  ): CreateResult {
    const pair = this.keyring.addFromUri(suri, meta, type)

    return {
      json: this.saveAccount(pair, password),
      pair,
    }
  }

  public backupAccount(pair: KeyringPair, password: string): KeyringPair$Json {
    if (!pair.isLocked) {
      pair.lock()
    }

    pair.decodePkcs8(password)

    return pair.toJson(password)
  }

  public createFromUri(suri: string, meta: KeyringPair$Meta = {}, type?: KeypairType): KeyringPair {
    return this.keyring.createFromUri(suri, meta, type)
  }

  public encryptAccount(pair: KeyringPair, password: string): void {
    const json = pair.toJson(password)

    json.meta.whenEdited = Date.now()

    this.keyring.addFromJson(json)
    this.accounts.add(this._store, pair.address, json)
  }

  public forgetAccount(address: string): void {
    this.keyring.removePair(address)
    this.accounts.remove(this._store, address)
  }

  public forgetAddress(address: string): void {
    this.addresses.remove(this._store, address)
  }

  public forgetContract(address: string): void {
    this.contracts.remove(this._store, address)
  }

  public getAccount(address: string | Uint8Array): KeyringAddress | undefined {
    return this.getAddress(address, 'account')
  }

  public getAddress(
    _address: string | Uint8Array,
    type: KeyringItemType | null = null
  ): KeyringAddress | undefined {
    const address = isString(_address) ? _address : this.encodeAddress(_address)
    const publicKey = this.decodeAddress(address)
    const stores = type ? [this.stores[type]] : Object.values(this.stores)

    const info = stores.reduce<SingleAddress | undefined>(
      (lastInfo, store): SingleAddress | undefined =>
        store().subject.getValue()[address] || lastInfo,
      undefined
    )

    return (
      info && {
        address,
        publicKey,
        meta: info.json.meta,
      }
    )
  }

  public getAddresses(): KeyringAddress[] {
    const available = this.addresses.subject.getValue()

    return Object.keys(available).map(
      (address): KeyringAddress => this.getAddress(address) as KeyringAddress
    )
  }

  public getContract(address: string | Uint8Array): KeyringAddress | undefined {
    return this.getAddress(address, 'contract')
  }

  public getContracts(): KeyringAddress[] {
    const available = this.contracts.subject.getValue()

    return Object.entries(available)
      .filter(
        ([
          ,
          {
            json: {
              meta: { contract },
            },
          },
        ]): boolean => !!contract && contract.genesisHash === this.genesisHash
      )
      .map(([address]): KeyringAddress => this.getContract(address) as KeyringAddress)
  }

  private rewriteKey(
    json: KeyringJson,
    key: string,
    hexAddr: string,
    creator: (addr: string) => string
  ): void {
    if (hexAddr.substr(0, 2) === '0x') {
      return
    }

    this._store.remove(key)
    this._store.set(creator(hexAddr), json)
  }

  private loadAccount(json: KeyringJson, key: string): void {
    if (!json.meta.isTesting && (json as KeyringPair$Json).encoded) {
      // FIXME Just for the transition period (ignoreChecksum)
      const pair = this.keyring.addFromJson(json as KeyringPair$Json, true)

      this.accounts.add(this._store, pair.address, json)
    }

    const [, hexAddr] = key.split(':')

    this.rewriteKey(json, key, hexAddr.trim(), accountKey)
  }

  private loadAddress(json: KeyringJson, key: string): void {
    const { isRecent, whenCreated = 0 } = json.meta

    if (isRecent && Date.now() - whenCreated > RECENT_EXPIRY) {
      this._store.remove(key)
      return
    }

    const address = this.encodeAddress(
      isHex(json.address)
        ? hexToU8a(json.address)
        : // FIXME Just for the transition period (ignoreChecksum)
          this.decodeAddress(json.address, true)
    )
    const [, hexAddr] = key.split(':')

    this.addresses.add(this._store, address, json)
    this.rewriteKey(json, key, hexAddr, addressKey)
  }

  private loadContract(json: KeyringJson, key: string): void {
    const address = this.encodeAddress(this.decodeAddress(json.address))
    const [, hexAddr] = key.split(':')

    // move genesisHash to top-level (TODO Remove from contracts section?)
    json.meta.genesisHash =
      json.meta.genesisHash || (json.meta.contract && json.meta.contract.genesisHash)

    this.contracts.add(this._store, address, json)
    this.rewriteKey(json, key, hexAddr, contractKey)
  }

  private loadInjected(address: string, meta: KeyringJson$Meta): void {
    const json = {
      address,
      meta: {
        ...meta,
        isInjected: true,
      },
    }
    const pair = this.keyring.addFromAddress(address, json.meta)

    this.accounts.add(this._store, pair.address, json)
  }

  private allowGenesis(json?: KeyringJson | { meta: KeyringJson$Meta } | null): boolean {
    if (json && json.meta && this.genesisHash) {
      if (json.meta.genesisHash) {
        return this.genesisHash === json.meta.genesisHash
      } else if (json.meta.contract) {
        return this.genesisHash === json.meta.contract.genesisHash
      }
    }

    return true
  }

  public loadAll(
    options: KeyringOptions,
    injected: { address: string; meta: KeyringJson$Meta }[] = []
  ): void {
    super.initKeyring(options)

    this._store.all((key: string, json: KeyringJson): void => {
      if (options.filter ? options.filter(json) : true) {
        if (this.allowGenesis(json)) {
          if (accountRegex.test(key)) {
            this.loadAccount(json, key)
          } else if (addressRegex.test(key)) {
            this.loadAddress(json, key)
          } else if (contractRegex.test(key)) {
            this.loadContract(json, key)
          }
        }
      }
    })

    injected.forEach((account): void => {
      if (this.allowGenesis(account)) {
        this.loadInjected(account.address, account.meta)
      }
    })

    keyringOption.init(this)
  }

  public saveAccount(pair: KeyringPair, password?: string): KeyringPair$Json {
    this.addTimestamp(pair)

    const json = pair.toJson(password)

    this.keyring.addFromJson(json)
    this.accounts.add(this._store, pair.address, json)

    return json
  }

  public saveAccountMeta(pair: KeyringPair, meta: KeyringPair$Meta): void {
    const address = pair.address

    this._store.get(accountKey(address), (json: KeyringJson): void => {
      pair.setMeta(meta)
      json.meta = pair.meta

      this.accounts.add(this._store, address, json)
    })
  }

  public saveAddress(
    address: string,
    meta: KeyringPair$Meta,
    type: KeyringAddressType = 'address'
  ): KeyringPair$Json {
    const available = this.addresses.subject.getValue()

    const json = (available[address] && available[address].json) || {
      address,
      meta: {
        isRecent: undefined,
        whenCreated: Date.now(),
      },
    }

    Object.keys(meta).forEach((key): void => {
      json.meta[key] = meta[key]
    })

    delete json.meta.isRecent

    this.stores[type]().add(this._store, address, json)

    return json as KeyringPair$Json
  }

  public saveContract(address: string, meta: KeyringPair$Meta): KeyringPair$Json {
    return this.saveAddress(address, meta, 'contract')
  }

  public saveRecent(address: string): SingleAddress {
    const available = this.addresses.subject.getValue()

    if (!available[address]) {
      this.addresses.add(this._store, address, {
        address,
        meta: {
          genesisHash: this.genesisHash,
          isRecent: true,
          whenCreated: Date.now(),
        },
      })
    }

    return this.addresses.subject.getValue()[address]
  }
}

const keyringInstance = new Keyring()

export default keyringInstance
