import * as constants from '../constants/index'
import {
  common,
} from '../constants/common'

const initialState = {
  selectionBarSelected: common.selectionBar.left,
  kLineOrDepth: common.ui.kLine,
  averagePriceOrPrice: common.ui.averagePrice,
  dealledOrQuantity: common.ui.dealled,
  cashAccount: 0,
  currentAddress: '',
}

export default function ui(state = initialState, action) {
  let nextState = state

  switch (action.type) {
    case constants.SELECTION_BAR_UPDATE:
      nextState = {
        ...state,
        selectionBarSelected: action.data,
      }
      break
    case constants.KLINE_DEPTH_UPDATE:
      nextState = {
        ...state,
        kLineOrDepth: action.data,
      }
      break
    case constants.AVERAGE_PRICE_PRICE_UPDATE:
      nextState = {
        ...state,
        averagePriceOrPrice: action.data,
      }
      break
    case constants.DEALLED_QUANTITY_UPDATE:
      nextState = {
        ...state,
        dealledOrQuantity: action.data,
      }
      break
    case constants.CASH_ACCOUNT_UPDATE:
      nextState = {
        ...state,
        cashAccount: action.data.cashAccount,
        currentAddress: action.data.currentAddress,
      }
      break
    default:
      break
  }
  return nextState
}
