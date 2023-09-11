import type { CType } from '../../interfaces'

interface PubSubSessionV3 {
  /** Configure the callback the extension must use to send messages to the dApp. Overrides previous values. */
  listen: (callback: EncryptedMessageCallbackV3) => Promise<void>

  /** send the encrypted message to the extension */
  send: EncryptedMessageCallbackV3

  /** close the session and stop receiving further messages */
  close: () => Promise<void>

  /** URI of the key agreement key of the temporary DID the extension will use to encrypt the session messages */
  encryptionKeyUri: string

  /** bytes as hexadecimal */
  encryptedChallenge: string

  /** 24 bytes nonce as hexadecimal */
  nonce: string
}

interface PubSubSessionV1 {
  /** Configure the callback the extension must use to send messages to the dApp. Overrides previous values. */
  listen: (callback: EncryptedMessageCallbackV1) => Promise<void>

  /** send the encrypted message to the extension */
  send: EncryptedMessageCallbackV1

  /** close the session and stop receiving further messages */
  close: () => Promise<void>

  /** URI of the key agreement key of the temporary DID the extension will use to encrypt the session messages */
  encryptionKeyId: string

  /** bytes as hexadecimal */
  encryptedChallenge: string

  /** 24 bytes nonce as hexadecimal */
  nonce: string
}

type EncryptedMessageCallbackV1 = (message: EncryptedMessageV1) => Promise<void>
type EncryptedMessageCallbackV3 = (message: EncryptedMessageV3) => Promise<void>

interface EncryptedMessageV3 {
  /** URI of the key agreement key of the receiver DID used to encrypt the message */
  receiverKeyUri: string

  /** URI of the key agreement key of the sender DID used to encrypt the message */
  senderKeyUri: string

  /** ciphertext as hexadecimal */
  ciphertext: string

  /** 24 bytes nonce as hexadecimal */
  nonce: string
}

interface EncryptedMessageV1 {
  /** URI of the key agreement key of the receiver DID used to encrypt the message */
  receiverKeyId: string

  /** URI of the key agreement key of the sender DID used to encrypt the message */
  senderKeyId: string

  /** ciphertext as hexadecimal */
  ciphertext: string

  /** 24 bytes nonce as hexadecimal */
  nonce: string
}

interface Message {
  body: {
    /** type of the message, referred as `message_type` below */
    type: string

    /** message data */
    content: object | object[]
  }

  /** timestamp of the message construction, number of milliseconds elapsed since the UNIX epoch */
  createdAt: number

  /** DID URI of the sender */
  sender: string

  /** DID URI of the receiver */
  receiver: string

  /** message ID, a random string  */
  messageId: string

  /** ID of the message this message responds to */
  inReplyTo?: string

  /** when this message B is a response to the message A,
     *  B.references = [...A.references, A.inReplyTo] */
  references?: string[]
}

interface StartSessionResultV1 {
  /** URI of the key agreement key of the temporary DID the extension will use to encrypt the session messages */
  encryptionKeyId: string

  /** bytes as hexadecimal */
  encryptedChallenge: string

  /** 24 bytes nonce as hexadecimal */
  nonce: string
}

interface StartSessionResultV3 {
  /** URI of the key agreement key of the temporary DID the extension will use to encrypt the session messages */
  encryptionKeyUri: string

  /** bytes as hexadecimal */
  encryptedChallenge: string

  /** 24 bytes nonce as hexadecimal */
  nonce: string
}

interface SubmitTermsMessageV1 {
  /** CTypes for the proposed credential.
   * In most cases this will be just one, but in the case of nested ctypes, this can be multiple.
   *  @link https://kiltprotocol.github.io/sdk-js/interfaces/_kiltprotocol_typesICType.html */
  cTypes: CType[]

  claim: {
    /** ID of the CType */
    cTypeId: string // @TODO this is wrong! It needs to be cTypeId, but its wrong in all attesters out there -.-

    /** contents of the proposed credential */
    contents: object

    /** optional DID URI the credential will be issued for */
    owner?: string
  }

  // /** optional attester-signed binding
  //  *  @link https://kiltprotocol.github.io/sdk-js/interfaces/_kiltprotocol_types.IQuoteAttesterSigned.html */
  // quote?: IQuoteAttesterSigned

  // /** optional ID of the DelegationNode of the attester */
  // delegationId?: string

  // /** optional array of credentials of the attester
  //  *  @link https://kiltprotocol.github.io/sdk-js/interfaces/_kiltprotocol_types.ICredential.html */
  // legitimations?: ICredential[]
}

interface SubmitTermsMessageV3 {
  /** CTypes for the proposed credential.
   * In most cases this will be just one, but in the case of nested ctypes, this can be multiple.
   *  @link https://kiltprotocol.github.io/sdk-js/interfaces/_kiltprotocol_typesICType.html */
  cTypes: CType[]

  claim: {
    /** ID of the CType */
    cTypeHash: string // @TODO this is wrong! It needs to be cTypeId, but its wrong in all attesters out there -.-

    /** contents of the proposed credential */
    contents: object

    /** optional DID URI the credential will be issued for */
    owner?: string
  }

  // /** optional attester-signed binding
  //  *  @link https://kiltprotocol.github.io/sdk-js/interfaces/_kiltprotocol_types.IQuoteAttesterSigned.html */
  // quote?: IQuoteAttesterSigned

  // /** optional ID of the DelegationNode of the attester */
  // delegationId?: string

  // /** optional array of credentials of the attester
  //  *  @link https://kiltprotocol.github.io/sdk-js/interfaces/_kiltprotocol_types.ICredential.html */
  // legitimations?: ICredential[]
}

interface RequestCredentialMessage {
  cTypes: [
    {
      /** The hash of the CType */
      cTypeHash: string

      /** optional list of DIDs of attesters trusted by this verifier */
      trustedAttesters?: string[]

      /** list of credential attributes which MUST be included when submitting the credential */
      requiredProperties: string[]
    }
  ]

  /** 24 random bytes as hexadecimal */
  challenge: string
}

export type {
  PubSubSessionV1,
  PubSubSessionV3,
  EncryptedMessageCallbackV1,
  EncryptedMessageCallbackV3,
  EncryptedMessageV1,
  EncryptedMessageV3,
  Message,
  StartSessionResultV1,
  StartSessionResultV3,
  SubmitTermsMessageV1,
  SubmitTermsMessageV3,
  RequestCredentialMessage
}
