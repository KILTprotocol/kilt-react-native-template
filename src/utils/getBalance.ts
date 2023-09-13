import { connect, BalanceUtils, ConfigService } from '@kiltprotocol/sdk-js'

export default async function getBalance(address: string) {
  await connect('wss://peregrine.kilt.io/parachain-public-ws/')
  const api = ConfigService.get('api')
  const balances = await api.query.system.account(address)
  const freeBalance = BalanceUtils.fromFemtoKilt(balances.data.free)

  return freeBalance.toString()
}
