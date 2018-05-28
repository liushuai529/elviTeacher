import { combineReducers } from 'redux'
import address from './address'
import announcement from './announcement'
import asset from './asset'
import banners from './banners'
import deal from './deal'
import dealstat from './dealstat'
import delegate from './delegate'
import invitation from './invitation'
import legalDeal from './legalDeal'
import payment from './payment'
import rebates from './rebates'
import user from './user'
import ui from './ui'
import detailDeal from './detailDeal'

const rootReducer = combineReducers({
  address,
  announcement,
  asset,
  banners,
  deal,
  dealstat,
  delegate,
  invitation,
  legalDeal,
  payment,
  rebates,
  user,
  ui,
  detailDeal,
})

export default rootReducer
