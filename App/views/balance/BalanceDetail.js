import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import actions from '../../actions/index'
import { BigNumber } from 'bignumber.js'
import { common, storeRead } from '../../constants/common'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import BalanceDetailTradeCell from './components/BalanceDetailTradeCell'
import transfer from '../../localization/utils'
import * as exchange from '../../actions/exchange'

import * as withdraw from '../../actions/withdraw'
import * as recharge from '../../actions/recharge'
import { requestDailyChange } from '../../actions/balanceDetail'
import { getDefaultLanguage } from '../../utils/languageHelper'
import cache from '../../utils/cache'
import { imgHashApi } from '../../services/api'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: common.bgColor,
  },
  contentContainer: {
    marginHorizontal: 10,
  },
  tokenNameContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenName: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 20,
    color: '#dfe4ff',
  },
  infoCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  title: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 14,
    color: '#616989',
  },
  value: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 14,
    color: '#dfe4ff',
  },
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
  line: {
    marginTop: 10,
    backgroundColor: '#616989',
    height: 0.3,
  },
  bottomToolbarContainer: {
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
  },
  bottomToolBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#343c5c',
    height: 36,
  },
  bottomToolbarItemText: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 14,
    color: '#dfe4ff',
  },
  tradeCell: {
    height: 44,
    marginTop: 10,
  },
})

class BalanceDetail extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.state.params.headerTitle,
    headerLeft: (
      <NextTouchableOpacity
        style={styles.headerLeft}
        activeOpacity={common.activeOpacity}
        onPress={() => navigation.goBack()}
      >
        <Image
          style={styles.headerLeftImage}
          source={require('../../assets/arrow_left_left.png')}
        />
      </NextTouchableOpacity>
    ),
  })

  constructor(props) {
    super(props)
    this.pairData = undefined
    this.state={ showPairs: false }
    props.navigation.addListener('didFocus', () => {
      cache.setObject('currentComponentVisible', 'BalanceDetail')
      props.dispatch(actions.requestPairs())
      if(props.loggedIn) props.dispatch(actions.sync())
    })
  }

  componentDidMount = () => {
    this.requsetDailyChange()
  }

  requsetDailyChange = () => {
    this.props.dispatch(requestDailyChange())
    if(this.props.loggedIn) this.props.dispatch(actions.sync())
  }

  jumpToDeal = (data) => {
    const { dispatch, navigation } = this.props
    dispatch(exchange.updatePair(data))
    navigation.navigate('Deal')
  }

  jumpToRecharge = () => {
    const { dispatch, navigation, currentToken, loggedIn } = this.props
    dispatch(recharge.coinSelected(currentToken))
    dispatch(recharge.requestRechargeAddress({
      token_ids: [currentToken.id],
    }))
    if (loggedIn){
      navigation.navigate('Recharge', {
        hideShowForm: true,
      })
    } else {
      navigation.navigate('LoginStack')
    }
  }
  jumpToWithdraw = () => {
    const { dispatch, navigation, currentToken, loggedIn } = this.props
    dispatch(withdraw.toggleForm())
    dispatch(withdraw.coinSelected(currentToken.name))
    dispatch(withdraw.requestBalance({
      token_ids: [currentToken.id],
    }))
    if (loggedIn){
      navigation.navigate('Withdraw', {
        hideShowForm: true,
      })
    }
    else {
      navigation.navigate('LoginStack')
    }
  }

  configureDataSource = (dataSource) => {
    if (!dataSource) return []
    let newDataSource = [...dataSource]
    if (getDefaultLanguage() !== 'zh_hans') {
      newDataSource = newDataSource.filter(e => e.currency.name !== 'CNYT')
    }
    return newDataSource
  }

  keyExtractor = (item, index) => index

  marketIcons = {
    TK: require('../../assets/market_TK.png'),
    BTC: require('../../assets/market_BTC.png'),
    ETH: require('../../assets/market_ETH.png'),
    ETC: require('../../assets/market_ETC.png'),
    LTC: require('../../assets/market_LTC.png'),
    EIEC: require('../../assets/market_EIEC.png'),
    MDT: require('../../assets/market_MDT.png'),
    FO: require('../../assets/market_FO.png'),
    ACAR: require('../../assets/market_ACAR.png'),
    ONT: require('../../assets/market_ONT.png'),
  }

  renderBalanceInfoCell = (title, value) => (
    <View style={styles.infoCell}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )

  renderBalanceTradeCell = ({ item }) => {
    let icon
    if(this.props.pairData.coinIdDic &&
      this.props.pairData.coinIdDic[item.goods.name] && 
      this.props.pairData.coinIdDic[item.goods.name].appIcon && 
      this.props.pairData.coinIdDic[item.goods.name].appIcon[0]){
      icon = {uri: (imgHashApi + this.props.pairData.coinIdDic[item.goods.name].appIcon[0] + '.png')}
    } else{
      icon = (this.marketIcons[item.goods.name] || this.marketIcons.ETH)
    }


    let cPirce = 0
    common.precision(item.goods.name, item.currency.name, (p) => {
      cPirce = new BigNumber(item.cprice).toFixed(p, 1)
    })
    const bgRose = new BigNumber(item.rose).multipliedBy(100)
    let rose
    let extraStyle = {}

    if (bgRose.gt(0)) {
      extraStyle = { color: 'rgb(213,69,80)' }
      rose = `+${bgRose.toFixed(2, 1)}%`
    } else if (bgRose.lt(0)) {
      extraStyle = { color: '#24c78c' }
      rose = `${bgRose.toFixed(2, 1)}%`
    } else {
      extraStyle = { color: 'rgb(223,228,255)' }
      rose = `${bgRose.toFixed(2, 1)}%`
    }

    return (
      <BalanceDetailTradeCell
        style={styles.tradeCell}
        icon={icon}
        title={item.goods.name}
        subtitle={item.currency.name}
        detail={cPirce}
        extra={rose}
        extraStyle={extraStyle}
        onPress={() => { this.jumpToDeal(item) }}
      />
    )
  }

  renderBalanceTrade = () => {
    let dataTemp = []
    if( this.props.pairData !== undefined &&  this.props.pairData.accuracy !== undefined){
      this.props.tradeTokenDatas.map(ele => {
        let pairName = ele.goods.name + '_' + ele.currency.name
        if( this.props.pairData['accuracy'][pairName] !== undefined &&  this.props.pairData['accuracy'][pairName].istransaction === true){
          dataTemp.push(ele)
        }
      })
    }
    return (
    <FlatList
      data={this.configureDataSource(dataTemp)}
      renderItem={this.renderBalanceTradeCell}
      keyExtractor={this.keyExtractor}
    />
  )}


  renderBottomToolbar = (leftTitle, rightTitle, bShowWithdraw, bShowRecharge) => (
    <View style={styles.bottomToolbarContainer}>
      {
        !bShowRecharge ? null : 
        <NextTouchableOpacity
          style={styles.bottomToolBarItem}
          onPress={this.jumpToRecharge}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomToolbarItemText}>{leftTitle}</Text>
        </NextTouchableOpacity>
      }
      {
        !(bShowWithdraw && bShowRecharge) ? null :
        <View style={{ backgroundColor: common.bgColor, width: 1 }} />
      }
      {
        !bShowWithdraw ? null :
        <NextTouchableOpacity
          style={styles.bottomToolBarItem}
          onPress={this.jumpToWithdraw}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomToolbarItemText}>{rightTitle}</Text>
        </NextTouchableOpacity>
      }
    </View>
  )


  render() {
    const { navigation, currentToken, isLoading } = this.props
    const { language } = navigation.state.params

    const tokenName = currentToken.name

    /** */
    const totalTitle = transfer(language, 'balance_detail_total')
    const availableTitle = transfer(language, 'balance_detail_available')
    const freezedTitle = transfer(language, 'balance_detail_freezed')
    const btcValueTitle = `${transfer(language, 'balance_detail_value')} (BTC)`
    const isChinese = getDefaultLanguage() === 'CNYT'
    const rmbValueTitle = `${transfer(language, 'balance_detail_value')} (¥)`
    const isNotCNYT = getDefaultLanguage() === 'zh_hans' || currentToken.name !== 'CNYT'
    const goToTrade = transfer(language, 'balance_detail_goToTrade')


    const { currentTokenBalance } = this.props
    const total =
      new BigNumber(currentTokenBalance.amount)
        .plus(currentTokenBalance.freezed)
        .plus(currentTokenBalance.platformFreeze)
    const totalStr = `${total.toFixed(8, 1)} ${currentToken.name}`

    const available =
      new BigNumber(currentTokenBalance.amount)
    const availableStr = `${available.toFixed(8, 1)} ${currentToken.name}`

    const freezed =
      new BigNumber(currentTokenBalance.freezed).toFixed(8, 1)
    const freezedStr = `${freezed} ${currentToken.name}`

    let btcValue = '0.00000000 BTC'
    let rmbValue = '0.00'

    const { currentTokenRates } = this.props
    if (currentTokenRates) {
      btcValue = `${total.multipliedBy(currentTokenRates.BTC).toFixed(8, 1)} BTC`
      rmbValue = total.multipliedBy(currentTokenRates.CNYT).toFixed(2, 1)
    }

    /** bottom toolbar */
    const rechargeTitle = transfer(language, 'balance_detail_recharge')
    const withdrawTitle = transfer(language, 'balance_detail_withdraw')

    let bShowWithdraw = false
    let bShowRecharge = false
    if(this.props.pairData && this.props.pairData.canWithdrawCoins && this.props.pairData.canWithdrawCoins.includes(currentToken.name)){
      bShowWithdraw = true
    }
    if(this.props.pairData && this.props.pairData.canRechargeAddress && this.props.pairData.canRechargeAddress.includes(currentToken.name)){
      bShowRecharge = true
    }

    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.tokenNameContainer}>
            <Text style={styles.tokenName}>{tokenName}</Text>
          </View>

          {this.renderBalanceInfoCell(totalTitle, totalStr)}
          {this.renderBalanceInfoCell(availableTitle, availableStr)}
          {this.renderBalanceInfoCell(freezedTitle, freezedStr)}

          <View style={styles.line} />

          {this.renderBalanceInfoCell(btcValueTitle, btcValue)}
          {isChinese && this.renderBalanceInfoCell(rmbValueTitle, rmbValue)}

          <View style={styles.line} />
          {isNotCNYT && this.renderBalanceInfoCell(goToTrade)}

          {isNotCNYT &&
          (isLoading
            ? <ActivityIndicator
              color="white"
            />
            : this.renderBalanceTrade())}
        </ScrollView>
        {this.renderBottomToolbar(rechargeTitle, withdrawTitle, bShowWithdraw, bShowRecharge)}
      </View >
    )
  }
}

const mapStateToProps = (state) => {
  const { balanceDetail, balance } = state
  const { balanceList, valuation } = balance
  const { currentToken } = balanceDetail
  let currentTokenBalance
  for (let i = 0; i < balanceList.length; i++) {
    const element = balanceList[i]
    if (element.token.name === currentToken.name) {
      currentTokenBalance = element
      break
    }
  }
  if (!currentTokenBalance) {
    currentTokenBalance = {
      amount: '0.00000000',
      availableCash: '0.00000000',
      freezed: '0.00000000',
      rmbValue: '0.00',
      platformFreeze: '0.00000000',
      btcValue: '0.00000000',
      token: currentToken,
    }
  }
  let currentTokenRates
  if (valuation && valuation.rates) {
    for (const key in valuation.rates) {
      if (key === currentToken.name) {
        currentTokenRates = valuation.rates[key]
      }
    }
  }
  return {
    ...state.balanceDetail,
    currentTokenBalance,
    currentTokenRates,
    language: state.system.language,
    pairData: state.home.requestPair,
    getVerificateSmtpCodeLoading: state.user.getVerificateSmtpCodeVisible,
    getVerificateSmtpCodeResponse: state.user.getVerificateSmtpCodeResponse,
    loggedIn: state.authorize.loggedIn,
  }
}

export default connect(mapStateToProps)(BalanceDetail)
