import {
  call,
  put,
  takeEvery,
} from 'redux-saga/effects'
import * as api from '../services/api'

export function* requestCoinListWorker() {
  // const response = yield call(api.api_here, param_here)

  yield put({
    type: 'withdraw/request_coin_list_succeed',
    payload: ['TK', 'BTC', 'CNYT', 'ETH', 'ETC', 'LTC'],
  })
}

export function* requestBalanceWorker(action) {
  const response = yield call(api.getAssets, action.payload)

  if (response.success) {
    const respData = response.result
    let one
    if (Object.keys(respData).length === 0) {
      one = 0
    } else {
      one = respData[(action.payload.token_ids)[0]].amount
    }
    yield put({
      type: 'withdraw/request_balance_succeed',
      payload: one,
    })
  } else {
    yield put({
      type: 'withdraw/request_balance_failed',
      payload: response.error,
    })
  }
}

export function* requestValuationWorker() {
  const response = yield call(api.getValuation)

  if (response.success) {
    yield put({
      type: 'withdraw/requset_valuation_succeed',
      payload: response.result,
    })
  } else {
    yield put({
      type: 'withdraw/requset_valuation_failed',
      payload: response.error,
    })
  }
}

export function* requestWithdrawWorker(action) {
  const response = yield call(api.withdraw, action.payload)

  if (response.success) {
    yield put({
      type: 'withdraw/request_withdraw_succeed',
      payload: response.result,
    })
  } else {
    yield put({
      type: 'withdraw/request_withdraw_failed',
      payload: response.error,
    })
  }
}

export function* requestWithdrawAddressWorker(action) {
  const { payload } = action
  const response = yield call(api.graphql, payload)
  if (response.success) {
    yield put({
      type: 'withdraw/request_withdraw_address_succeed',
      payload: response.result.data.find_address,
    })
  } else {
    yield put({
      type: 'withdraw/request_withdraw_address_failed',
      payload: response.error,
    })
  }
}

export function* requsetCheck2GoogleAuthWorker(action) {
  const { payload } = action
  const response = yield call(api.check2GoogleAuth, payload)
  if (response.success) {
    yield put({
      type: 'withdraw/check2_google_auth_succeed',
      payload: response.result,
    })
  } else {
    yield put({
      type: 'withdraw/check2_google_auth_failed',
      payload: response.error,
    })
  }
}

export function* requestCoinList() {
  yield takeEvery('withdraw/request_coin_list', requestCoinListWorker)
}

export function* requestBalance() {
  yield takeEvery('withdraw/request_balance', requestBalanceWorker)
}

export function* requestValuation() {
  yield takeEvery('withdraw/requset_valuation', requestValuationWorker)
}

export function* requestWithdraw() {
  yield takeEvery('withdraw/request_withdraw', requestWithdrawWorker)
}

export function* requestWithdrawAddress() {
  yield takeEvery('withdraw/request_withdraw_address', requestWithdrawAddressWorker)
}

export function* requsetCheck2GoogleAuth() {
  yield takeEvery('withdraw/check2_google_auth', requsetCheck2GoogleAuthWorker)
}
