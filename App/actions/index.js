import {
  add,
  addUpdate,
  findAddress,
  selectTokenUpdate,
} from './address'
import {
  createAddress,
  getAssets,
  getValuation,
  findAssetList,
  findAssetListUpdate,
} from './asset'
import {
  findListSelf,
  latestDeals,
  wsDealsUpdate,
  buyOrSellUpdate,
  homeRoseSelectedUpdate,
} from './deal'
import {
  marketListUpdate,
} from './dealstat'
import {
  legalDealCancel,
  confirmPay,
  legalDealCreate,
  findLegalDeal,
  havedPay,
  legalDealUpdate,
  skipLegalDealUpdate,
} from './legalDeal'
import {
  checkVerificateCode,
  getGoogleAuth,
  getVerificateCode,
  getVerificateSmtpCode,
  findUser,
  findUserUpdate,
  idCardAuth,
  imgHash,
  imgHashFailed,
  idCardAuthUpdate,
  isExist,
  mobileIsExist,
  clearMobileIsExist,
  logout,
  clearAllReducer,
  register,
  registerUpdate,
  resetPassword,
  sync,
  updatePassword,
  updatePasswordUpdate,
  updateEmail,
  updateEmailUpdate,
  findAuditmanage,
  registerResetNexus,
} from './user'
import {
  selectionBarUpdate,
  kLineOrDepthUpdate,
  averagePriceOrPriceUpdate,
  dealledOrQuantityUpdate,
  cashAccountUpdate,
  codeAuthUpdate,
  bankTextInputUpdate,
} from './ui'
import {
  detailupdateKV,
} from './detailDeal'
import {
  login,
  loginUpdate,
  clearError,
  toggleAutoLogin,
} from './authorize'
import * as home from './home'

const actions = {
  requestBanners: home.requestBanners,
  requestAnnouncements: home.requestAnnouncements,
  requestMarket: home.requestMarket,

  add,
  addUpdate,
  findAddress,
  selectTokenUpdate,

  createAddress,
  getAssets,
  getValuation,
  findAssetList,
  findAssetListUpdate,

  findListSelf,
  latestDeals,
  wsDealsUpdate,
  buyOrSellUpdate,
  homeRoseSelectedUpdate,

  marketListUpdate,

  legalDealCancel,
  confirmPay,
  legalDealCreate,
  findLegalDeal,
  havedPay,
  legalDealUpdate,
  skipLegalDealUpdate,

  checkVerificateCode,
  getGoogleAuth,
  getVerificateCode,
  getVerificateSmtpCode,
  findUser,
  findUserUpdate,
  idCardAuth,
  imgHash,
  imgHashFailed,
  idCardAuthUpdate,
  isExist,
  mobileIsExist,
  clearMobileIsExist,
  logout,
  register,
  registerUpdate,
  resetPassword,
  sync,
  updatePassword,
  updatePasswordUpdate,
  updateEmail,
  updateEmailUpdate,
  findAuditmanage,
  registerResetNexus,

  selectionBarUpdate,
  kLineOrDepthUpdate,
  averagePriceOrPriceUpdate,
  dealledOrQuantityUpdate,
  cashAccountUpdate,
  codeAuthUpdate,
  bankTextInputUpdate,

  detailupdateKV,

  login,
  loginUpdate,
  clearError,
  toggleAutoLogin,

  clearAllReducer,
}
export default actions
