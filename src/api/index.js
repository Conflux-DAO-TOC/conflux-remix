import {Conflux, Account, util as CfxUtil} from 'js-conflux-sdk'
import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/json'

let cfx

export async function updateCfxUrl (endpoint) {
  cfx = createConflux(endpoint)
  await testUrls(endpoint)
}

export async function testUrls (rpcEndpoint) {
  if (!rpcEndpoint) {
    throw new Error('RPC url must not be blank.')
  }
  try {
    if (rpcEndpoint.startsWith('http')) {
      const parsed = new URL(rpcEndpoint)
      const config = {}
      // test with axios because we get more detailed errors back
      await axios.post(parsed.toString(),
        { 'jsonrpc': '2.0', 'method': 'cfx_epochNumber', 'params': [] , 'id': 1},
        config)
    }

    // test with Conflux because there are slight differences in how it connects
    const testConflux = createConflux(rpcEndpoint)
    await testConflux.getEpochNumber()

  } catch (e) {
    if (e.response) {
      throw new Error(
        `Error response from ${rpcEndpoint}: ${e.response.status} ${e.response.statusText} ${e.response.data}`)
    } else {
      throw new Error(
        `Could not connect to ${rpcEndpoint}: ${e.message}. This could be: a. conflux is not running at this address, b. the port is not accessible, or c. CORS settings on geth do not allow this url (check the developer console for CORS errors)`)
    }
  }
}

function createConflux (endpoint) {
  let provider = endpoint
  return new Conflux({
    url: provider.toString(),
    defaultGasPrice: 100,
    defaultGas: 1000000,
    logger: console,
  })
}

export async function getAccounts () {
  const account = Account.random()
  return [account]
}

export async function deploy (contract, params, txMetadata) {
  const bytecode = '0x' + contract.evm.bytecode.object

  const nonce = await cfx.cfx_getNextNonce(txMetadata.account);
  const tx = txMetadata.account.signTransaction({
    nonce,
    to: txMetadata.account.address,
    gasPrice: txMetadata.gasPrice,
    gas: txMetadata.gasLimit,
    data: bytecode,
  })

  const response = await cfx.sendRawTransaction(tx.serialize())

  return response
}

export async function contractMethod (txMetadata, params, method, privateFor,
  selectedPrivateFor, contract) {
  const { account, gasLimit, gasPrice, value, valueDenomination } = txMetadata
  var _params = Object.values(params)
  var _sig_params = _params.map((value) => JSON.stringify(value)).join(', ')
  var methodSig = method.name + '(' + _sig_params + ')'
  var methodArgs = {
    from: account,
    gas: gasLimit,
    gasPrice,
    value: CfxUtil.unit(valueDenomination,'drip')(value),
    args: _params,
    privateFor: privateFor && selectedPrivateFor.filter(
      ({ enabled }) => enabled).map(({ key }) => key)
  }

  await verifyContract(contract.address)

  let web3Contract = new cfx.Contract(contract.abi, contract.address)
  let web3Method = web3Contract.methods[method.name](..._params)
  let callOrSend = method.constant ? 'call' : 'send'
  const res = await web3Method[callOrSend](methodArgs)
  return { methodSig, methodArgs, res }
}

export async function verifyContract(address) {
  const contractBinary = await cfx.getCode(address)
  if (contractBinary === '0x') {
    throw new Error(`Contract does not exist at ${address}`)
  }
}
