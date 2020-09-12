import React, { useEffect } from 'react'
import {
  formContainerStyle,
  iconStyle,
  inlineInputStyle,
  labelStyle,
  txMetaRowStyle,
} from '../utils/Styles'
import copy from 'copy-to-clipboard'
import { useDispatch, useSelector } from 'react-redux'
import {
  changeGasLimit,
  changeGasPrice,
  changeValue,
  changeValueDenomination,
  selectAccount
} from '../actions'

export function TxMetadata () {
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const {
    network: { accounts = [] },
    txMetadata: {
      account,
      gasLimit,
      gasPrice,
      value,
      valueDenomination,
    }
  } = state

  const copyAddress = async () => {
    try {
      await copy(account)
    } catch (e) {
      console.error('Could not copy to clipboard: ', account, e)
    }
  }

  const newAccount = async () => {
    // add new account from conflux portal
    try {
      if (typeof window.conflux !== 'undefined') { 
        account = await window.conflux.enable()
       }
    } catch (e) {
      console.error('Could  not create new account: ', account, e)
    }
  }

  useEffect(() => {
    // maybe a better way to do this, but select the first account if unset or
    // if selected account is no longer in the list of accounts
    if (accounts.length > 0 && !accounts.includes(account)) {
      dispatch(selectAccount(accounts[0]))
    }
  }, [accounts, account, dispatch])

  return <div style={formContainerStyle}>
    <div style={txMetaRowStyle}>
      <div style={labelStyle}>Account
      </div>
      <i style={iconStyle} className="fas fa-plus-circle" onClick={(e) => newAccount()}/>
      <select className="form-control" defaultValue={account}
              onChange={(e) => dispatch(selectAccount(e.target.value))} id="txorigin">
        {accounts.map(
          (account) => <option key={account.address}
                               value={account.address}>{account.address}</option>)}
      </select>
      <i style={iconStyle}
         className="fa fa-clipboard"
         onClick={(e) => copyAddress()}/>
    </div>
    <div style={txMetaRowStyle}>
      <div style={labelStyle}>Gas price</div>
      <input style={inlineInputStyle} className="form-control" type="text" value={gasPrice}
                           onChange={(e) => dispatch(changeGasPrice(e.target.value))}/>
    </div>
    <div style={txMetaRowStyle}>
      <div style={labelStyle}>Gas limit</div>
      <input style={inlineInputStyle} className="form-control" type="text" value={gasLimit}
             onChange={(e) => dispatch(changeGasLimit(e.target.value))}/>
    </div>
    <div style={txMetaRowStyle}>
      <div style={labelStyle}>Value</div>
      <input style={inlineInputStyle} className="form-control" type="text" value={value}
             onChange={(e) => dispatch(
               changeValue(e.target.value))}/>
      <select style={inlineInputStyle} className="form-control" defaultValue={valueDenomination}
              onChange={(e) => dispatch(changeValueDenomination(e.target.value))}>
        <option value="drip">drip</option>
        <option value="gdrip">gdrip</option>
        <option value="cfx">cfx</option>
      </select>
    </div>
  </div>
}
