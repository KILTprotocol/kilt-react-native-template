import { hexToU8a, u8aConcat } from '@polkadot/util'
import { blake2AsHex } from '@polkadot/util-crypto'
import * as uuid from 'uuid'
import type { CType, KiltCredential } from '../../interfaces'

class CredentialBuilder {
  private contents?: object
  private subject?: string
  private cTypeHash?: string
  private attester?: string
  private cType?: CType

  public withClaimContents(contents: object): CredentialBuilder {
    this.contents = contents
    return this
  }

  public withSubject(subject: string): CredentialBuilder {
    this.subject = subject
    return this
  }

  public withCTypeHash(cTypeHash: string): CredentialBuilder {
    this.cTypeHash = cTypeHash
    return this
  }

  public withCType(cType: CType): CredentialBuilder {
    this.cType = cType
    return this
  }

  public withAttester(attester: string): CredentialBuilder {
    this.attester = attester
    return this
  }

  public toKiltCredential(): KiltCredential {
    if (this.contents === undefined) {
      throw new Error('No contents provided')
    }
    if (this.subject === undefined) {
      throw new Error('No subject provided')
    }
    if (this.cTypeHash === undefined) {
      throw new Error('No cTypeHash provided')
    }
    if (this.attester === undefined) {
      throw new Error('No attester provided')
    }
    if (this.cType === undefined) {
      throw new Error('No cType provided')
    }

    const normalizedClaims = this.normalizeClaimContents(
      this.subject,
      this.cTypeHash,
      this.contents
    )
    const unsaltedHashes = normalizedClaims.map((e) => blake2AsHex(e))
    const claimNonceMap: Record<string, string> = {}
    const claimHashes: string[] = []

    for (const hash of unsaltedHashes) {
      claimNonceMap[hash] = uuid.v4()
      const claimHash = blake2AsHex(claimNonceMap[hash] + hash)
      claimHashes.push(claimHash)
    }

    const claimHashBytes = claimHashes.map((hash) => hexToU8a(hash))
    const claimHashBytesConcatenated = u8aConcat(...claimHashBytes)
    const rootHash = blake2AsHex(claimHashBytesConcatenated)

    return {
      claim: {
        cTypeHash: this.cTypeHash,
        contents: this.contents,
        owner: this.subject,
      },
      attester: this.attester,
      claimNonceMap,
      claimHashes,
      legitimations: [],
      delegationId: null,
      rootHash,
      cType: this.cType,
    }
  }

  private normalizeClaimContents(subject: string, cType: string, claims: object): string[] {
    const normalizedClaims: object[] = [{ '@id': subject }]
    for (const [key, value] of Object.entries(claims)) {
      normalizedClaims.push({ [`kilt:ctype:${cType}#${key}`]: value })
    }
    return normalizedClaims.map((e) => JSON.stringify(e))
  }
}

export { CredentialBuilder, type KiltCredential }
