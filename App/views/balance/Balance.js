import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  ListView,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { BigNumber } from 'bignumber.js'
import { common } from '../../constants/common'
import TKButton from '../../components/TKButton'
import BalanceCell from './BalanceCell'
import findAssetList from '../../schemas/asset'
import {
  requestBalanceList,
  requestBalanceValuation,
} from '../../actions/balance'
import {
  requestPairs,
} from '../../actions/home'
import { updateCurrentToken } from '../../actions/balanceDetail'
import cache from '../../utils/cache'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import transfer from '../../localization/utils'
import { getDefaultLanguage } from '../../utils/languageHelper'
import { imgHashApi } from '../../services/api'
import actions from '../../actions/index'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: common.bgColor,
  },
  balance: {
    marginTop: common.margin20,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    color: common.textColor,
    fontSize: common.font30,
    textAlign: 'center',
  },
  balanceRMB: {
    marginTop: common.margin5,
    fontSize: common.font12,
    color: common.placeholderColor,
    textAlign: 'center',
  },
  balanceTip: {
    marginTop: common.margin10,
    fontSize: common.font14,
    color: common.placeholderColor,
    textAlign: 'center',
  },
  btnContainer: {
    marginTop: common.margin20,
    marginLeft: common.sw / 4,
    marginRight: common.sw / 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

class Balance extends Component {
  static navigationOptions(props) {
    const { navigation } = props
    const params = navigation.state.params || {}
    const headerTitle = transfer(getDefaultLanguage(), 'balances_pageTitle')
    const headerRightTitle = transfer(getDefaultLanguage(), 'recharge_historyList')
    return {
      headerTitle,
      headerRight: (
        <NextTouchableOpacity
          activeOpacity={common.activeOpacity}
          onPress={params.historyPress}
        >
          <Text
            style={{
              marginRight: common.margin10,
              fontSize: common.font16,
              color: 'white',
            }}
          >{headerRightTitle}</Text>
        </NextTouchableOpacity>
      ),
      tabBarOnPress: ({ scene, jumpToIndex }) => {
        if (cache.getObject('isLoginIn')) {
          jumpToIndex(scene.index)
        } else if (!cache.getObject('isFirstBalance')) {
          cache.setObject('isFirstBalance', 'true')
          setTimeout(() => {
            cache.removeObject('isFirstBalance')
          }, 800)
          navigation.navigate('LoginStack')
        }
      },
    }
  }

  constructor(props) {
    super(props)

    this.dataSource = data => new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    }).cloneWithRows(data)

    props.navigation.addListener('didFocus', () => {
      cache.setObject('currentComponentVisible', 'Balance')
      this.hasLoaded = false
      const { loggedInResult, dispatch, loggedIn } = this.props
      dispatch(requestBalanceList(findAssetList(loggedInResult.id)))
      dispatch(requestBalanceValuation())
      dispatch(requestPairs())
      if(loggedIn) dispatch(actions.sync())
    })
  }

  componentWillMount() {
    const { navigation, language } = this.props
    navigation.setParams({
      // title: transfer(language, 'balances_pageTitle'),
      historyPress: this._historyPress,
      language,
      // right: transfer(language, 'recharge_historyList'),
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.loggedIn && nextProps.loggedIn) {
      const { loggedInResult, dispatch } = nextProps
      dispatch(requestBalanceList(findAssetList(loggedInResult.id)))
      dispatch(requestBalanceValuation())
    }
    if (this.props.loading && !nextProps.loading) {
      this.hasLoaded = true
    }
  }

  _historyPress = () => {
    const { loggedIn, navigation } = this.props
    if (loggedIn) navigation.navigate('History')
    else navigation.navigate('LoginStack')
  }

  filterDataSource() {
    const { balanceList = [] } = this.props
    const coinIdDic = common.getDefaultPair().coinIdDic
    const keys = Object.keys(coinIdDic).sort()
    const indexs = {}
    const initBalance = keys.map((e, idx) => {
      indexs[coinIdDic[e].name] = idx
      return {
        token: {
          id: coinIdDic[e].id,
          name: coinIdDic[e].name,
        },
        amount: '0.00000000',
        availableCash: '0.00000000',
        freezed: '0.00000000',
        rmbValue: '0.00',
        platformFreeze: '0.00000000',
        btcValue: '0.00000000',
      }
    })
    balanceList.forEach((e) => {
      initBalance[indexs[e.token.name]] = e
    })
    if (getDefaultLanguage() !== 'zh_hans') {
      const CNYTBal = initBalance[indexs.CNYT]
      const amount =
        new BigNumber(CNYTBal.amount)
          .plus(CNYTBal.freezed)
          .plus(CNYTBal.platformFreeze)

      if (amount.isZero()) {
        const newInitBalance = [...initBalance]
        newInitBalance.splice(indexs.CNYT, 1)
        return newInitBalance
      }
    }
    return initBalance
  }

  marketIcons = {
    TK: require('../../assets/market_TK.png'),
    CNYT: require('../../assets/market_TK.png'),
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

  jumpToBalanceDetail = (rd) => {
    this.props.dispatch(updateCurrentToken({ ...rd.token }))
    if (this.props.loggedIn){
        this.props.navigation.navigate('BalanceDetail', {
        language: this.props.language,
        headerTitle: transfer(this.props.language, 'balance_detail'),
      })
    }
    else {
      navigation.navigate('LoginStack')
    }

  }

  renderRow(rd) {
    const amount = new BigNumber(rd.amount).plus(rd.freezed).plus(rd.platformFreeze).toFixed(8, 1)
    let source
    if(this.props.requestPair.coinIdDic && 
      this.props.requestPair.coinIdDic[rd.token.name] && 
      this.props.requestPair.coinIdDic[rd.token.name].appIcon && 
      this.props.requestPair.coinIdDic[rd.token.name].appIcon[0]){
      source = {uri: (imgHashApi + this.props.requestPair.coinIdDic[rd.token.name].appIcon[0] + '.png')}
    } else{
      source = (this.marketIcons[rd.token.name] || this.marketIcons.ETH)
    }

    return (
      <BalanceCell
        leftImageSource={source}
        title={rd.token.name}
        detail={amount}
        onPress={() => { this.jumpToBalanceDetail(rd) }}
      />
    )
  }

  renderRefreshControl = () => {
    const { loading } = this.props
    return (
      <RefreshControl
        onRefresh={() => {
          const { dispatch, loggedInResult, loggedIn } = this.props
          if (!loggedIn) return

          dispatch(requestBalanceList(findAssetList(loggedInResult.id)))
          dispatch(requestBalanceValuation())
        }}
        refreshing={(loading && this.hasLoaded) || false}
      />
    )
  }

  render() {
    const { loggedIn, navigation, valuation, language } = this.props
    const balanceList = this.filterDataSource()
    let amountBTC = new BigNumber(0)
    let amountRMB = new BigNumber(0)
    if (valuation && valuation.rates) {
      for (let i = 0; i < balanceList.length; i++) {
        const element = balanceList[i]
        const amount =
          new BigNumber(element.amount)
            .plus(new BigNumber(element.freezed))
            .plus(new BigNumber(element.platformFreeze))
      if(valuation.rates[element.token.name] !== undefined && 
        valuation.rates[element.token.name][common.token.BTC] !== undefined &&
        valuation.rates[element.token.name][common.token.CNYT] !== undefined)
        {
          const scaleBTC = valuation.rates[element.token.name][common.token.BTC]
          const scaleCNYT = valuation.rates[element.token.name][common.token.CNYT]
          amountBTC = amount.multipliedBy(scaleBTC).plus(amountBTC)
          amountRMB = amount.multipliedBy(scaleCNYT).plus(amountRMB)
        }
      }
    }
    amountBTC = amountBTC.toFixed(8, 1)
    amountRMB = amountRMB.toFixed(2, 1)
    let amountRMBHint = ''
    if (getDefaultLanguage() === 'zh_hans') {
      amountRMBHint = `(¥${amountRMB})`
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={this.renderRefreshControl()}
      >
        <Text style={styles.balance}>{amountBTC}</Text>
        <Text style={styles.balanceRMB}>{amountRMBHint}</Text>
        <Text style={styles.balanceTip}>
          {`${transfer(language, 'balances_total_value')} (BTC)`}
        </Text>

        <View style={styles.btnContainer}>
          <TKButton
            theme={'balance'}
            caption={transfer(language, 'balances_deposit')}
            target="global"
            icon={require('../../assets/recharge.png')}
            onPress={() => {
              if (loggedIn) navigation.navigate('Recharge')
              else navigation.navigate('LoginStack')
            }}
          />
          <TKButton
            theme={'balance'}
            caption={transfer(language, 'balances_withdraw')}
            target="global"
            icon={require('../../assets/recharge2.png')}
            onPress={() => {
              if (loggedIn) navigation.navigate('Withdraw')
              else navigation.navigate('LoginStack')
            }}
          />
        </View>

        {
          loggedIn
            ? <ListView
              style={{
                marginTop: common.margin10,
                marginBottom: common.margin10,
              }}
              dataSource={this.dataSource(balanceList)}
              renderRow={rd => this.renderRow(rd)}
              enableEmptySections
              removeClippedSubviews={false}
            />
            : <BalanceCell
              leftImageSource={require('../../assets/111.png')}
              title={common.token.BTC}
              detail={0}
            />
        }
      </ScrollView>
    )
  }
}

function mapStateToProps(state) {
  return {
    requestPair: state.home.requestPair,
    loggedIn: state.authorize.loggedIn,
    loggedInResult: state.authorize.loggedInResult,

    balanceList: state.balance.balanceList,
    valuation: state.balance.valuation,
    loading: state.balance.loading,
    language: state.system.language,
  }
}

export default connect(
  mapStateToProps,
)(Balance)
