import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native'
import {
  Toast,
  Overlay,
  ActionSheet,
} from 'teaset'
import { BigNumber } from 'bignumber.js'
import WAValidator from 'wallet-address-validator'
import { common } from '../../constants/common'
import {
  coinSelected,
  toggleForm,
  requestCoinList,
  updateForm,
  requestBalance,
  requestWithdraw,
  requestValuation,
  withdrawClear,
  requestWithdrawClearError,
  requestWithdrawAddress,
  updateAuthCodeType,
  check2GoogleAuthSetError,
  check2GoogleAuth,
} from '../../actions/withdraw'
import {
  getVerificateCode,
} from '../../actions/user'
import WithdrawAuthorizeCode from './components/WithdrawAuthorizeCode'
import TKButton from '../../components/TKButton'
import TKInputItem from '../../components/TKInputItem'
import findAddress from '../../schemas/address'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import transfer from '../../localization/utils'

const styles = StyleSheet.create({
  headerLeft: {
    height: common.w40,
    width: common.w40,
    justifyContent: 'center',
  },
  headerLeftImage: {
    marginLeft: common.margin10,
    width: common.w10,
    height: common.h20,
  },
  contaier: {
    flex: 1,
    backgroundColor: common.blackColor,
  },
  coinSelector: {
    marginTop: common.margin10,
    height: common.h40,
    backgroundColor: common.navBgColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currCoin: {
    marginLeft: common.margin10,
    fontSize: common.font14,
    color: common.textColor,
    alignSelf: 'center',
  },
  coinView: {
    marginTop: common.margin5,
    height: common.h40,
    backgroundColor: common.navBgColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coinText: {
    marginLeft: common.margin10,
    fontSize: common.font14,
    color: common.textColor,
    alignSelf: 'center',
  },
  showAddressImage: {
    position: 'absolute',
    left: common.getH(10),
  },
  balanceTip: {
    marginTop: common.margin22,
    fontSize: common.font16,
    color: common.placeholderColor,
    alignSelf: 'center',
  },
  balance: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    fontSize: common.font30,
    alignSelf: 'center',
    textAlign: 'center',
    color: 'white',
  },
  amountView: {
    marginTop: common.margin35,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    justifyContent: 'center',
    height: common.h35,
  },
  amountInput: {
    textAlign: 'center',
  },
  addressInput: {
    marginLeft: common.getH(40),
    textAlign: 'center',
  },
  withdrawAddress: {

  },
  withdrawBtn: {
    marginTop: common.margin40,
  },
  extraBtnCover: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlay: {
    justifyContent: 'center',
  },
  googleAuthView: {
    marginTop: -common.margin127 * 2,
    borderRadius: common.radius6,
    height: common.h60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '50%',
  },
  googleAuthTip: {
    fontSize: common.font16,
    color: common.blackColor,
    alignSelf: 'center',
  },
  codeImage: {
    width: common.w20,
    height: common.w20,
  },
})

class WithDraw extends Component {
  static navigationOptions(props) {
    return {
      headerTitle: '提现',
      headerLeft: (
        <NextTouchableOpacity
          style={styles.headerLeft}
          activeOpacity={common.activeOpacity}
          onPress={() => props.navigation.goBack()}
        >
          <Image
            style={styles.headerLeftImage}
            source={require('../../assets/arrow_left_left.png')}
          />
        </NextTouchableOpacity>
      ),
    }
  }

  constructor(props) {
    super(props)
    this.withdrawErrorDic = {
      4000414: '地址已存在',
      4000415: '仅支持BTC、ETH添加地址',
      4000416: '提现地址有误',
      4000156: '授权验证失败',
      4000606: '提现地址有误',
      4000608: '修改密码后，24小时内禁止提币操作',
    }
    this.verificationCodeErrorDic = {
      4000101: '手机号码或服务类型错误',
      4000102: '一分钟内不能重复发送验证码',
      4000104: '手机号码已注册',
    }

    this.codeTitles = ['短信验证码', '谷歌验证码']
    this.canWithdrawCoins = ['BTC', 'ETC', 'ETH', 'LTC']
  }

  componentDidMount() {
    const { dispatch, user } = this.props
    dispatch(requestValuation())
    dispatch(requestWithdrawAddress(findAddress(user.id)))
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, withdrawLoading } = this.props
    if (withdrawLoading && !nextProps.withdrawLoading && nextProps.withdrawSuccess) {
      Toast.success('提现成功')
    }

    if (nextProps.withdrawError) {
      const errMsg = this.withdrawErrorDic[nextProps.withdrawError.code]
      if (errMsg) {
        Toast.fail(errMsg)
      } else {
        Toast.fail('添加失败')
      }
      dispatch(requestWithdrawClearError())
    }

    if (!nextProps.googleCodeCheckLoading && this.props.googleCodeCheckLoading) {
      const { currCoin, formState } = this.props
      const tokenId = this.coinsIdDic[currCoin].id
      Overlay.hide(this.overlayViewKeyID)
      dispatch(requestWithdraw({
        token_id: tokenId,
        amount: formState.withdrawAmount,
        toaddr: formState.withdrawAddress,
        googleCode: formState.googleCode,
      }))
    }

    if (nextProps.googleCodeCheckError) {
      Overlay.hide(this.overlayViewKeyID)
      const errorCode = nextProps.googleCodeCheckError.code
      if (errorCode === 4000171) {
        Toast.fail('请先绑定谷歌验证码!')
      } else {
        Toast.fail('谷歌验证码错误!')
      }
      dispatch(check2GoogleAuthSetError(null))
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch(withdrawClear())
  }

  onChangeAuthCode = (e, code) => {
    const { dispatch, formState, authCodeType } = this.props
    if (authCodeType === '短信验证码') {
      dispatch(updateForm({
        ...formState,
        verificationCode: code,
      }))
    } else {
      dispatch(updateForm({
        ...formState,
        googleCode: code,
      }))
    }
  }

  onChangeWithdrawAmount = (withdrawAmount) => {
    const { dispatch, formState, balance } = this.props
    if (!withdrawAmount) {
      dispatch(updateForm({
        ...formState,
        withdrawAmount,
      }))
      return
    }
    const bWithdrawAmount = new BigNumber(withdrawAmount)

    if (bWithdrawAmount.isNaN()) {
      return
    }
    const bMaxBalace = new BigNumber(balance).dp(8, 1)
    if (bWithdrawAmount.gt(bMaxBalace)) {
      dispatch(updateForm({
        ...formState,
        withdrawAmount: bMaxBalace.toFixed(),
      }))
      return
    }
    const splitArr = withdrawAmount.split('.')
    if (splitArr[0].length > common.maxLenDelegate) { // 整数长度限制
      return
    }

    if (splitArr.length > 1 && splitArr[1].length > 8) { // 小数长度限制
      return
    }

    dispatch(updateForm({
      ...formState,
      withdrawAmount,
    }))
  }

  onChangeWithdrawAddress = (withdrawAddress) => {
    const { dispatch, formState } = this.props

    dispatch(updateForm({
      ...formState,
      withdrawAddress,
    }))
  }

  showForm() {
    const { dispatch, user } = this.props

    dispatch(toggleForm())
    dispatch(requestCoinList(user.id))
  }

  tapCoinListCell = (ele) => {
    const {
      dispatch,
      formState,
    } = this.props


    dispatch(updateForm({
      ...formState,
      withdrawAmount: '',
      withdrawAddress: '',
      verificationCode: '',
      googleCode: '',
    }))
    dispatch(coinSelected(ele))
    dispatch(requestBalance({
      token_ids: [this.coinsIdDic[ele].id],
    }))
  }

  coinsIdDic = {
    TK: {
      id: 1,
    },
    BTC: {
      id: 2,
      fee: 0.001,
      minAmount: 0.01,
    },
    CNYT: {
      id: 3,
    },
    ETH: {
      id: 5,
      fee: 0.01,
      minAmount: 0.015,
    },
    ETC: {
      id: 6,
      fee: 0.01,
      minAmount: 0.5,
    },
    LTC: {
      id: 7,
      fee: 0.01,
      minAmount: 0.1,
    },
  }

  checkValuationIsEmpty = () => {
    const { valuation } = this.props

    if (!valuation) {
      return true
    }

    const { count, rates } = valuation
    if (!count || Object.keys(count).length === 0) {
      return true
    }

    if (!rates || Object.keys(rates).length === 0) {
      return true
    }

    return false
  }

  checkWithdrawAddressIsIneligible = (address, coin) => {
    const isIneligible =
      !WAValidator.validate(address, coin) &&
      !WAValidator.validate(address, coin, 'testnet')

    return isIneligible
  }

  withdrawPress() {
    Keyboard.dismiss()

    if (this.checkValuationIsEmpty()) {
      const { dispatch } = this.props
      dispatch(requestValuation())
      return
    }

    const { formState } = this.props

    if (!formState.withdrawAmount) {
      Toast.fail('请输入提现金额')
      return
    }

    const bAmount = new BigNumber(formState.withdrawAmount)
    if (bAmount.eq(0)) {
      Toast.fail('请输入提现金额')
      return
    }

    const { currCoin } = this.props
    const { valuation } = this.props
    const { count, rates } = valuation
    const { quotaCount, withdrawedCount } = count
    const bQuotaCount = new BigNumber(quotaCount)
    const bWithdrawedCount = new BigNumber(withdrawedCount)
    const bToBTC = new BigNumber(rates[currCoin].BTC)

    const limitNumber = bQuotaCount.minus(bWithdrawedCount)

    const minAmount = this.coinsIdDic[currCoin].minAmount
    const minAmountMsg = `最小提币金额为${minAmount}`

    if (bAmount.multipliedBy(bToBTC).gt(limitNumber)) {
      Toast.fail('提现金额已超过当日限额！')
      return
    }
    if (bAmount.lt(minAmount)) {
      Toast.fail(minAmountMsg)
      return
    }

    if (!formState.withdrawAddress) {
      Toast.fail('请输入提现地址')
      return
    }

    if (this.checkWithdrawAddressIsIneligible(formState.withdrawAddress, currCoin)) {
      Alert.alert(
        '提示',
        `请填写正确的${currCoin}提币地址！`,
        [
          {
            text: '确定',
            onPress: () => { },
          },
        ],
      )
      return
    }

    this.showVerificationCode()
  }

  confirmPress = () => {
    Keyboard.dismiss()

    const { dispatch, currCoin, formState, authCodeType } = this.props

    if (authCodeType === '谷歌验证码') {
      const { googleCode } = formState
      if (!googleCode || googleCode.length === 0) {
        Toast.fail('请输入谷歌验证码')
        return
      }
      dispatch(check2GoogleAuth({
        googleCode: formState.googleCode,
      }))
      return
    }
    const tokenId = this.coinsIdDic[currCoin].id
    if (!formState.verificationCode.length) {
      Toast.fail('请输入验证码')
      return
    }
    let code = new BigNumber(formState.verificationCode)
    code = code.isNaN() ? 0 : code.toNumber()
    Overlay.hide(this.overlayViewKeyID)
    dispatch(requestWithdraw({
      token_id: tokenId,
      amount: formState.withdrawAmount,
      toaddr: formState.withdrawAddress,
      code,
    }))
  }

  alertBindingGoogleCode = () => {
    const googleCodeAlert = (
      <Overlay.View
        style={styles.overlay}
        modal={false}
        overlayOpacity={0}
      >
        <View style={styles.googleAuthView} >
          <Text
            style={styles.googleAuthTip}
          >{'请前去官网完成绑定'}</Text>
        </View>
      </Overlay.View>
    )
    this.googleCodeAlertId = Overlay.show(googleCodeAlert)
    setTimeout(() => {
      Overlay.hide(this.googleCodeAlertId)
    }, 2000)
  }

  segmentValueChanged = (e) => {
    const { dispatch, formState } = this.props
    dispatch(updateAuthCodeType(e.title))

    if (e.title === '谷歌验证码') {
      dispatch(updateForm({
        ...formState,
        verificationCode: '',
      }))
    } else {
      dispatch(updateForm({
        ...formState,
        googleCode: '',
      }))
    }
  }

  showVerificationCode = () => {
    const { dispatch, user, formState } = this.props
    dispatch(updateAuthCodeType('短信验证码'))
    dispatch(updateForm({
      ...formState,
      verificationCode: '',
      googleCode: '',
    }))
    const overlayView = (
      <Overlay.View
        style={styles.overlay}
        modal={false}
        overlayOpacity={0}
      >
        <WithdrawAuthorizeCode
          titles={this.codeTitles}
          mobile={user.mobile}
          onChangeText={this.onChangeAuthCode}
          segmentValueChanged={this.segmentValueChanged}
          smsCodePress={(count) => {
            this.count = count
            dispatch(getVerificateCode({ mobile: user.mobile, service: 'auth' }))
          }}
          confirmPress={() => this.confirmPress()}
          cancelPress={() => Overlay.hide(this.overlayViewKeyID)}
        />
      </Overlay.View>
    )
    this.overlayViewKeyID = Overlay.show(overlayView)
  }

  selectAddress = (withdrawAddress) => {
    const { dispatch, formState } = this.props
    dispatch(updateForm({
      ...formState,
      withdrawAddress,
    }))
  }

  addAddressPress = () => {
    const { currCoin } = this.props
    const tokenId = this.coinsIdDic[currCoin].id
    this.props.navigation.navigate('AddAddress', {
      title: currCoin,
      tokenId,
    })
  }

  jumpToScanPage() {
    const { navigation, currCoin, dispatch, formState } = this.props
    navigation.navigate('ScanBarCode', {
      coin: currCoin,
      didScan: (val) => {
        dispatch(updateForm({
          ...formState,
          withdrawAddress: val,
        }))
      },
    })
  }

  tapAddAddress = () => {
    Keyboard.dismiss()

    const { address = [], currCoin } = this.props
    const items = []
    for (let i = 0; i < address.length; i++) {
      const element = address[i]
      if (element.token.name === currCoin) {
        items.push({
          title: element.withdrawaddr,
          onPress: () => this.selectAddress(element.withdrawaddr),
        })
      }
    }
    items.push({
      title: '+添加新地址',
      onPress: () => this.addAddressPress(),
    })
    const cancelItem = { title: '取消' }
    ActionSheet.show(items, cancelItem)
  }

  renderCoinSelector() {
    const { currCoin, listToggled, language } = this.props

    return (
      <NextTouchableOpacity
        activeOpacity={common.activeOpacity}
        onPress={() => this.showForm()}
        delay={100}
      >
        <View
          style={styles.coinSelector}
        >
          <Text
            style={styles.currCoin}
          >{currCoin === '选择币种' ? transfer(language, 'deposit_select_coin') : currCoin}</Text>
          <View style={{ alignSelf: 'center' }}>
            <Image
              style={listToggled ? {
                marginRight: common.margin10,
                width: common.h20,
                height: common.w10,
              } : {
                marginRight: common.margin10,
                height: common.h20,
                width: common.w10,
              }}
              source={(listToggled ?
                require('../../assets/arrow_down.png') :
                require('../../assets/arrow_right.png'))}
            />
          </View>
        </View>
      </NextTouchableOpacity>
    )
  }

  renderCoinList() {
    const { listToggled, coinList } = this.props

    return !listToggled ? null : coinList.map(ele => (
      <NextTouchableOpacity
        style={styles.coinView}
        key={ele}
        activeOpacity={common.activeOpacity}
        onPress={() => {
          this.tapCoinListCell(ele)
        }}
        delay={100}
      >
        <Text
          style={styles.coinText}
        >{ele}</Text>
      </NextTouchableOpacity>
    ))
  }

  renderFormWithdrawAmount = () => {
    const { formState, language } = this.props
    return (
      <TKInputItem
        viewStyle={styles.amountView}
        inputStyle={styles.amountInput}
        placeholder={transfer(language, 'withdrawal_amount')}
        value={formState.withdrawAmount}
        onChangeText={this.onChangeWithdrawAmount}
      />
    )
  }

  renderFormFeeOrBalanceReceived = () => {
    const { currCoin, formState, language } = this.props
    const fee = this.coinsIdDic[currCoin].fee
    let bAalanceReceived = '0'
    if (formState.withdrawAmount) {
      const tFee = this.coinsIdDic[currCoin].fee
      const bAmount = new BigNumber(formState.withdrawAmount)
      bAalanceReceived = bAmount.minus(tFee).toFixed(8, 1)
      if (BigNumber(bAalanceReceived).lt(0)) {
        bAalanceReceived = '0'
      }
    }
    return (
      <View
        style={{
          marginTop: common.margin5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            marginLeft: common.margin10,
            color: common.textColor,
            fontSize: common.font12,
            alignSelf: 'center',
          }}
        >{`${transfer(language, 'withdrawal_fee')}: ${fee}${currCoin}`}</Text>
        <Text
          style={{
            marginRight: common.margin10,
            marginLeft: common.margin10,
            color: common.textColor,
            fontSize: common.font12,
            alignSelf: 'center',
          }}
        >{`${transfer(language, 'withdrawal_you_will_get')}: ${bAalanceReceived}`}</Text>
      </View>
    )
  }

  renderFormWithdrawAddress = () => {
    const { dispatch, formState, language } = this.props

    return (
      <View style={styles.amountView}>
        <TKInputItem
          inputStyle={styles.addressInput}
          placeholder={transfer(language, 'withdrawal_address')}
          value={formState.withdrawAddress}
          onChangeText={(withdrawAddress = '') => dispatch(updateForm({
            ...formState,
            withdrawAddress: withdrawAddress.trim(),
          }))}
          onFocus={() => {
            if (!common.IsIOS) {
              this.setState({
                topOffset: -100,
              })
            }
          }}
          textInputProps={{
            onEndEditing: () => {
              if (!common.IsIOS) {
                this.setState({
                  topOffset: 0,
                })
              }
            },
          }}
          extra={() => (
            <NextTouchableOpacity
              style={styles.extraBtnCover}
              activeOpacity={common.activeOpacity}
              onPress={() => {
                Keyboard.dismiss()
                this.jumpToScanPage()
              }}
            >
              <Image
                style={styles.codeImage}
                source={require('../../assets/qrcode_white.png')}
              />
            </NextTouchableOpacity>
          )}
        />
        <NextTouchableOpacity
          style={styles.showAddressImage}
          activeOpacity={common.activeOpacity}
          onPress={() => this.tapAddAddress()}
        >
          <Image
            style={styles.codeImage}
            resizeMode="contain"
            source={require('../../assets/arrow_down.png')}
          />
        </NextTouchableOpacity>
      </View>
    )
  }

  renderFormWithdrawBtn = () => {
    const { formState, language } = this.props
    const { withdrawAmount } = formState
    let disabled = false
    let captionColor = common.btnTextColor
    if (!withdrawAmount || BigNumber(withdrawAmount).eq(0)) {
      disabled = true
      captionColor = common.placeholderColor
    }
    return (
      <TKButton
        style={styles.withdrawBtn}
        titleStyle={{ color: captionColor }}
        onPress={() => this.withdrawPress()}
        theme={'gray'}
        caption={transfer(language, 'withdrawal')}
        disabled={disabled}
      />
    )
  }

  renderFormTip = () => {
    const { currCoin, language } = this.props
    const minAmount = this.coinsIdDic[currCoin].minAmount
    return (
      <View>
        <Text
          style={{
            marginTop: common.margin10,
            marginLeft: common.margin10,
            marginRight: common.margin10,
            color: common.textColor,
            fontSize: common.font12,
            lineHeight: common.h15,
          }}
        >{transfer(language, 'deposit_please_note')}</Text>
        <Text
          style={{
            marginTop: common.margin10,
            marginLeft: common.margin10,
            marginRight: common.margin10,
            color: common.textColor,
            fontSize: common.font10,
            lineHeight: common.h15,
          }}
        >{`${transfer(language, 'withdrawal_note_1')}${minAmount} ${currCoin}
${transfer(language, 'withdrawal_note_2')}`}
        </Text>
      </View>
    )
  }

  renderForm() {
    const {
      balance,
      currCoin,
      listToggled,
      language,
    } = this.props

    const bBalance = new BigNumber(balance)
    let balanceString = ''
    if (bBalance.isNaN()) {
      balanceString = '0'
    } else {
      balanceString = bBalance.toFixed(8, 1)
    }

    return (currCoin !== '选择币种' && !listToggled) ? (
      (
        <View>
          <Text style={styles.balanceTip}>{transfer(language, 'withdrawal_available')}</Text>
          <Text style={styles.balance}>{balanceString}</Text>
          {
            (this.canWithdrawCoins.includes(currCoin)) &&
            <View>
              {this.renderFormWithdrawAmount()}
              {this.renderFormFeeOrBalanceReceived()}
              {this.renderFormWithdrawAddress()}
              {this.renderFormWithdrawBtn()}
              {this.renderFormTip()}
            </View>
          }
        </View>
      )
    ) : null
  }

  render() {
    const coinSelector = this.renderCoinSelector()
    const coinList = this.renderCoinList()
    const form = this.renderForm()
    return (
      <ScrollView
        style={styles.contaier}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior="padding"
        >
          {coinSelector}
          {coinList}
          {form}
        </KeyboardAvoidingView>
      </ScrollView>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.withdraw,
    user: state.user.user,
    language: state.system.language,
  }
}

export default connect(
  mapStateToProps,
)(WithDraw)
