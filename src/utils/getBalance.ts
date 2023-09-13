import { connect, BalanceUtils } from '@kiltprotocol/sdk-js'

export default async function getBalance(address: string) {
  const api = await connect('wss://peregrine.kilt.io/parachain-public-ws/')

  const balances = await api.query.system.account(address)
  const freeBalance = BalanceUtils.fromFemtoKilt(balances.data.free)
  await api.disconnect()
  return freeBalance.toString()
}
