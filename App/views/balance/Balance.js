import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  ListView,
  ScrollView,
  TouchableOpacity,
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
    return {
      headerTitle: '资产',
      headerStyle: {
        backgroundColor: common.navBgColor,
        borderBottomWidth: 0,
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontSize: common.font16,
      },
      headerRight: (
        <TouchableOpacity
          activeOpacity={common.activeOpacity}
          onPress={params.historyPress}
        >
          <Text
            style={{
              marginRight: common.margin10,
              fontSize: common.font16,
              color: 'white',
            }}
          >历史记录</Text>
        </TouchableOpacity>
      ),
    }
  }

  constructor() {
    super()

    this.dataSource = data => new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    }).cloneWithRows(data)
  }

  componentWillMount() {
    this.props.navigation.setParams({ historyPress: this._historyPress })
  }

  componentDidMount() {
    const { navigation, loggedIn } = this.props
    if (!loggedIn) {
      navigation.navigate('LoginStack')
      return
    }
    const { loggedInResult, dispatch } = this.props
    dispatch(requestBalanceList(findAssetList(loggedInResult.id)))
    dispatch(requestBalanceValuation())
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.loggedIn && nextProps.loggedIn) {
      const { loggedInResult, dispatch } = nextProps
      dispatch(requestBalanceList(findAssetList(loggedInResult.id)))
      dispatch(requestBalanceValuation())
    }
  }

  _historyPress = () => {
    const { loggedIn, navigation } = this.props
    if (loggedIn) navigation.navigate('History')
    else navigation.navigate('LoginStack')
  }

  renderRow(rd) {
    const amount = new BigNumber(rd.amount).plus(rd.freezed).toFixed(8, 1)
    return (
      <BalanceCell
        leftImageSource={require('../../assets/111.png')}
        title={rd.token.name}
        detail={amount}
      />
    )
  }

  render() {
    const { balanceList, loggedIn, navigation, valuation } = this.props

    let amountBTC = new BigNumber(0)
    let amountRMB = new BigNumber(0)
    if (valuation && valuation.rates) {
      for (let i = 0; i < balanceList.length; i++) {
        const element = balanceList[i]
        const amount = new BigNumber(element.amount).plus(element.freezed)
        const scaleBTC = valuation.rates[element.token.name][common.token.BTC]
        const scaleCNYT = valuation.rates[element.token.name][common.token.CNYT]
        amountBTC = amount.multipliedBy(scaleBTC).plus(amountBTC)
        amountRMB = amount.multipliedBy(scaleCNYT).plus(amountRMB)
      }
    }
    amountBTC = amountBTC.toFixed(8, 1)
    amountRMB = amountRMB.toFixed(2, 1)

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.balance}>{amountBTC}</Text>
        <Text style={styles.balanceRMB}>{`(¥${amountRMB})`}</Text>
        <Text style={styles.balanceTip}>总资产(BTC)</Text>

        <View style={styles.btnContainer}>
          <TKButton
            theme={'balance'}
            caption={'充值'}
            icon={require('../../assets/充值.png')}
            onPress={() => {
              if (loggedIn) navigation.navigate('Recharge')
              else navigation.navigate('LoginStack')
            }}
          />
          <TKButton
            theme={'balance'}
            caption={'提现'}
            icon={require('../../assets/充值copy.png')}
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
    loggedIn: state.authorize.loggedIn,
    loggedInResult: state.authorize.loggedInResult,

    balanceList: state.balance.balanceList,
    valuation: state.balance.valuation,
  }
}

export default connect(
  mapStateToProps,
)(Balance)
