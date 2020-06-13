import React from 'react'
import {
  iconStyle,
  labelStyle,
  networkStyle,
  statusStyle,
  txMetaRowRightStyle,
  txMetaRowStyle
} from '../utils/Styles'
import { useDispatch, useSelector } from 'react-redux'
import { editNetwork, saveNetwork, setError, connectToNetwork } from '../actions'
import { InputTooltip } from './InputTooltip'

export function Network () {
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const {
    editing,
    status,
    endpoint,
  } = state.network

  const [endpointInput, setEndpointInput] = React.useState(endpoint)

  React.useEffect(() => {
    // in case network changes after render
    setEndpointInput(endpoint)
  }, [endpoint])

  const onEdit = () => {
    dispatch(editNetwork(true))
  }
  const onSave = async () => {
    dispatch(saveNetwork(endpointInput))
  }
  const onCancel = () => {
    // reset to state values
    setEndpointInput(endpoint)
    dispatch(editNetwork(false))
    dispatch(setError())
  }

  const onRefresh = () => {
    dispatch(connectToNetwork(endpoint))
  }

  return <form style={networkStyle}
    onSubmit={async (e) => {
      e.preventDefault()
      await onSave()
    }}>
    <div style={txMetaRowStyle}>
      <label style={labelStyle}>
        Conflux Environment
      </label>
        <div className="form-control" style={reactSelectStyle}>
          <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" class="form-control custom-select">
            <option id="injected-mode"
              title="Execution environment has been provided by Conflux Portal."
              value="injected" name="executionContext"> Conflux Portal
            </option>
          </select>
          <a href="https://developer.conflux-chain.org/docs/conflux-portal/docs/en/portal/introduction" target="_blank"><i class="ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
        </div>
    </div>
    {editing ?
      <div style={txMetaRowRightStyle}>
        <i style={iconStyle} className="fa fa-close"
           onClick={() => onCancel()}/>
        <i style={iconStyle} className="fa fa-check" onClick={() => onSave()}/>
      </div>
      :
      <div style={txMetaRowRightStyle}>
        <div style={statusStyle(status)}>{status}</div>
        <i style={iconStyle} className="fa fa-refresh"
           onClick={() => onRefresh()}/>
        <i style={iconStyle} className="fa fa-pencil" onClick={() => onEdit()}/>
      </div>
    }
    <button type="submit" style={{display: 'none'}} />
  </form>
}
