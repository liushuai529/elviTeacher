import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Image,
  Text,
  Alert,
  StyleSheet,
} from 'react-native'
import Toast from 'teaset/components/Toast/Toast'
import { BigNumber } from 'bignumber.js'
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view'
import { common } from '../../constants/common'
import TKSelectionBar from '../../components/TKSelectionBar'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
// import TKSpinner from '../../components/TKSpinner'
import {
  openOrderRequest,
  openOrderSetError,
  orderHistoryRequest,
  orderHistrorySetError,
  updateSelectedTitle,
  toggleIsShowTotalPrice,
  requestCancelOrder,
  requestCancelOrderSetError,
  updateOpenOrderPage,
  updateOrderHistoryPage,
  resetNexus,
  // requestCancelAllOrder,
} from '../../actions/orders'
import {
  findDelegateSelfCurrent,
  findDelegateSelfHistory,
} from '../../schemas/delegate'

// openOrderCellStyles
const OOCStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    marginTop: common.margin10,
    marginRight: common.margin10,
    fontSize: common.font12,
    color: common.btnTextColor,
    textAlign: 'right',
  },
  cellContainer: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    backgroundColor: common.navBgColor,
    borderColor: common.borderColor,
    borderWidth: 1,
  },
  cellContentContainer: {
    flex: 1,
    borderBottomColor: common.borderColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  goodsCurrency: {
    marginLeft: common.margin5,
    marginTop: common.margin5,
    marginBottom: common.margin5,
    color: common.textColor,
    fontSize: common.font12,
    width: '20%',
    alignSelf: 'center',
    textAlign: 'left',
  },
  buySell: {
    marginLeft: common.margin10,
    fontSize: common.font12,
    width: '10%',
    alignSelf: 'center',
    textAlign: 'left',
  },
  createTime: {
    marginLeft: common.margin10,
    color: common.textColor,
    fontSize: common.font12,
    width: '45%',
    alignSelf: 'center',
    textAlign: 'left',
  },
  cancelContainer: {
    position: 'absolute',
    right: common.margin5,
    alignSelf: 'center',
  },
  cancel: {
    fontSize: common.font12,
    textAlign: 'right',
  },
  price: {
    flex: 1,
    marginTop: common.margin5,
    marginLeft: common.margin5,
    marginBottom: common.margin5,
    color: common.textColor,
    fontSize: common.font10,
    alignSelf: 'center',
    textAlign: 'left',
  },
  quantity: {
    flex: 1,
    marginLeft: common.margin5,
    color: common.textColor,
    fontSize: common.font10,
    alignSelf: 'center',
    textAlign: 'center',
  },
  dealled: {
    flex: 1,
    marginLeft: common.margin5,
    marginRight: common.margin5,
    color: common.textColor,
    fontSize: common.font10,
    alignSelf: 'center',
    textAlign: 'right',
  },
})


// orderHistoryCellStyles
const OHCStyles = StyleSheet.create({
  headerContainer: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerMarket: {
    flex: 1,
    color: common.placeholderColor,
    fontSize: common.font12,
  },
  headerSConatiner: {
    flex: 1,
    flexDirection: 'row',
  },
  headerLeft: {
    fontSize: common.font12,
    textAlign: 'right',
  },
  Slash: {
    color: common.placeholderColor,
    fontSize: common.font12,
  },
  headerRight: {
    fontSize: common.font12,
  },
  cellContainer: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goodsCurrency: {
    flex: 1,
    fontSize: common.font10,
    color: common.textColor,
    alignSelf: 'center',
    textAlign: 'left',
  },
  averagePriceOrPrice: {
    flex: 1,
    fontSize: common.font10,
    color: common.textColor,
    alignSelf: 'center',
    textAlign: 'center',
  },
  dealledOrdealAmount: {
    flex: 1,
    fontSize: common.font10,
    color: common.textColor,
    alignSelf: 'center',
    textAlign: 'right',
  },
})

class Orders extends Component {
  static navigationOptions(props) {
    return {
      headerTitle: '我的委托',
      headerStyle: {
        backgroundColor: common.navBgColor,
        borderBottomWidth: 0,
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontSize: common.font16,
      },
      headerLeft:
        (
          <NextTouchableOpacity
            style={{
              height: common.w40,
              width: common.w40,
              justifyContent: 'center',
            }}
            activeOpacity={common.activeOpacity}
            onPress={() => props.navigation.goBack()}
          >
            <Image
              style={{
                marginLeft: common.margin10,
                width: common.w10,
                height: common.h20,
              }}
              source={require('../../assets/下拉copy.png')}
            />
          </NextTouchableOpacity>
        ),
    }
  }

  constructor(props) {
    super(props)
    this.orderHistoryPage = 0
    this.openOrderPage = 0

    this.openOrderFistLoad = props.navigation.state.params.title !== '当前委托' && true
    this.orderHistoryFistLoad = props.navigation.state.params.title !== '历史委托' && true

    this.limit = 10

    this.state = {
      openOrderReState: RefreshState.Idle,
      orderHistoryReState: RefreshState.Idle,
    }
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props
    const { title } = navigation.state.params
    dispatch(updateSelectedTitle(title))
    if (title === '当前委托') {
      this.requestOpenOrder()
    } else {
      this.requestOrderHistory()
    }
  }

  componentWillReceiveProps(nexProps) {
    if (this.props.openOrderLoading && !nexProps.openOrderLoading) {
      this.isRefresh = false
      const openOrderLength = (nexProps.openOrders.length / this.limit) > this.openOrderPage
      this.setState({
        openOrderReState: openOrderLength ? RefreshState.Idle : RefreshState.NoMoreData,
      })
    }

    if (nexProps.openOrderError) {
      this.setState({
        openOrderReState: RefreshState.Idle,
      })
      this.props.dispatch(openOrderSetError(null))
    }

    if (this.props.orderHistoryLoading && !nexProps.orderHistoryLoading) {
      this.isRefresh = false
      const orderHistoryLength = (nexProps.orderHistory.length / this.limit) > this.orderHistoryPage
      this.setState({
        orderHistoryReState: orderHistoryLength ? RefreshState.Idle : RefreshState.NoMoreData,
      })
    }

    if (nexProps.orderHistoryError) {
      this.setState({
        orderHistoryReState: RefreshState.Idle,
      })
      this.props.dispatch(orderHistrorySetError(null))
    }

    if (this.props.cancelOrderLoading && !nexProps.cancelOrderLoading) {
      Toast.success('撤单成功')
    }
    if (nexProps.cancelOrderError) {
      Toast.fail('撤单失败')
      this.props.dispatch(requestCancelOrderSetError(null))
    }
  }

  componentWillUnmount() {
    this.props.dispatch(resetNexus())
  }

  onHeaderRefresh = () => {
    if (this.isRefresh) {
      return
    }
    this.isRefresh = true

    const { titleSeleted } = this.props
    if (titleSeleted === '当前委托') {
      this.openOrderPage = 0
      this.props.dispatch(updateOpenOrderPage(this.openOrderPage))
      this.requestOpenOrder()
    } else {
      this.orderHistoryPage = 0
      this.props.dispatch(updateOrderHistoryPage(this.orderHistoryPage))
      this.requestOrderHistory()
    }
  }

  onFooterRefresh = () => {
    if (this.isRefresh) {
      return
    }
    this.isRefresh = true
    const { titleSeleted } = this.props

    if (titleSeleted === '当前委托') {
      this.openOrderPage++
      this.props.dispatch(updateOpenOrderPage(this.openOrderPage))
      this.requestOpenOrder()
    } else {
      this.orderHistoryPage++
      this.props.dispatch(updateOrderHistoryPage(this.orderHistoryPage))
      this.requestOrderHistory()
    }
  }

  getDataSource = () => {
    const { titleSeleted } = this.props

    if (titleSeleted === '当前委托') {
      return this.props.openOrders || []
    }
    return this.props.orderHistory || []
  }

  getRefreshState = () => {
    const { titleSeleted } = this.props

    if (titleSeleted === '当前委托') {
      return this.state.openOrderReState
    }
    return this.state.orderHistoryReState
  }

  requestOrderHistory = () => {
    const { dispatch, user } = this.props
    dispatch(orderHistoryRequest(findDelegateSelfHistory(
      user.id,
      this.limit * this.orderHistoryPage,
      this.limit,
    )))
  }

  requestOpenOrder = () => {
    const { dispatch, user } = this.props
    dispatch(openOrderRequest(findDelegateSelfCurrent(
      user.id,
      this.limit * this.openOrderPage,
      this.limit,
    )))
  }

  cancelOrder = (id) => {
    this.props.dispatch(requestCancelOrder({
      id,
    }))
  }

  cancelAllOrder = () => {
    const { openOrders } = this.props
    if (openOrders.length === 0) {
      return
    }
    Alert.alert('需求未明确')
    // dispatch(requestCancelAllOrder({
    //   goods_id: 1,
    //   currency_id: 2,
    // }))
  }

  topBarPress(e) {
    const { dispatch } = this.props
    if (e.index === 0) {
      this.isRefresh = false
      dispatch(updateSelectedTitle(e.title))
      if (this.openOrderFistLoad) {
        this.requestOpenOrder()
        this.openOrderFistLoad = false
      }
    } else if (e.index === 1) {
      this.isRefresh = false
      dispatch(updateSelectedTitle(e.title))
      if (this.orderHistoryFistLoad) {
        this.requestOrderHistory()
        this.orderHistoryFistLoad = false
      }
    }
  }

  keyExtractor = (item, index) => index


  handleClickShowTotalPrice = () => {
    const { dispatch } = this.props
    dispatch(toggleIsShowTotalPrice())
  }

  renderOpenOrderHeader = () => (
    <View style={OOCStyles.headerStyle}>
      <View />
      <NextTouchableOpacity
        activeOpacity={common.activeOpacity}
        onPress={this.cancelAllOrder}
      >
        <Text style={OOCStyles.header}>
          全部撤单
        </Text>
      </NextTouchableOpacity>
    </View>
  )


  renderOrderHistoryHeader = () => {
    const { isShowTotalPrice } = this.props

    const rightColor =
    isShowTotalPrice ? { color: common.btnTextColor } : { color: common.placeholderColor }
    const leftColor =
    !isShowTotalPrice ? { color: common.btnTextColor } : { color: common.placeholderColor }

    return (
      <View style={OHCStyles.headerContainer}>
        <Text style={OHCStyles.headerMarket}>市场</Text>
        <View style={OHCStyles.headerSConatiner}>
          <NextTouchableOpacity
            style={{ flex: 1 }}
            disabled={!isShowTotalPrice}
            activeOpacity={common.activeOpacity}
            onPress={this.handleClickShowTotalPrice}
          >
            <Text style={[OHCStyles.headerLeft, leftColor]}>均价</Text>
          </NextTouchableOpacity>
          <Text style={OHCStyles.Slash}> / </Text>
          <NextTouchableOpacity
            style={{ flex: 1 }}
            disabled={isShowTotalPrice}
            activeOpacity={common.activeOpacity}
            onPress={this.handleClickShowTotalPrice}
          >
            <Text style={[OHCStyles.headerRight, rightColor]}>价格</Text>
          </NextTouchableOpacity>
        </View>
        <View style={OHCStyles.headerSConatiner}>
          <NextTouchableOpacity
            style={{ flex: 1 }}
            disabled={!isShowTotalPrice}
            activeOpacity={common.activeOpacity}
            onPress={this.handleClickShowTotalPrice}
          >
            <Text style={[OHCStyles.headerLeft, leftColor]}>成交数量</Text>
          </NextTouchableOpacity>
          <Text style={OHCStyles.Slash}> / </Text>
          <NextTouchableOpacity
            disabled={isShowTotalPrice}
            activeOpacity={common.activeOpacity}
            onPress={this.handleClickShowTotalPrice}
          >
            <Text style={[OHCStyles.headerRight, rightColor]}>金额</Text>
          </NextTouchableOpacity>
        </View>
      </View>
    )
  }

  renderOpenOrderCell = (item) => {
    const createdAt = common.dfFullDate(item.createdAt)
    let cancelBtnTitle = ''
    let cancelDisabled = true
    if ((item.status === common.delegate.status.dealing)
        || (item.status === common.delegate.status.waiting)) {
      cancelBtnTitle = '撤单'
      cancelDisabled = false
    } else if (item.status === common.delegate.status.cancel) {
      cancelBtnTitle = '已取消'
      cancelDisabled = true
    }

    const goodsName = item.goods ? item.goods.name : ''
    const currencyName = item.currency ? item.currency.name : ''

    let price
    let quantity
    let dealled
    common.precision(goodsName, currencyName, (p, q) => {
      price = new BigNumber(item.price).toFixed(p, 1)
      quantity = new BigNumber(item.quantity).toFixed(q, 1)
      dealled = new BigNumber(item.dealled).toFixed(q, 1)
    })

    const goodsCurrency = `${goodsName}/${currencyName}`
    const buySell = item.direct === 'buy' ? '买入' : '卖出'
    const buySellColor =
      item.direct === 'sell' ? { color: common.greenColo } : { color: common.redColor }
    const cancelColor =
      cancelDisabled ? { color: common.placeholderColor } : { color: common.btnTextColor }

    return (
      <View style={OOCStyles.cellContainer}>
        <View style={OOCStyles.cellContentContainer}>
          <Text style={OOCStyles.goodsCurrency}>
            {goodsCurrency}
          </Text>
          <Text style={[OOCStyles.buySell, buySellColor]}>
            {buySell}
          </Text>
          <Text style={OOCStyles.createTime}>
            {createdAt}
          </Text>
          <NextTouchableOpacity
            style={OOCStyles.cancelContainer}
            activeOpacity={common.activeOpacity}
            onPress={() => { this.cancelOrder(item.id) }}
            disabled={cancelDisabled}
          >
            <Text style={[OOCStyles.cancel, cancelColor]}>
              {cancelBtnTitle}
            </Text>
          </NextTouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <Text style={OOCStyles.price}>{`价格: ${price}`}</Text>
          <Text style={OOCStyles.quantity}>{`数量: ${quantity}`}</Text>
          <Text style={OOCStyles.dealled}>{`已成交: ${dealled}`}</Text>
        </View>
      </View >
    )
  }

  renderOrderHistoryCell = (item) => {
    const goodsCurrency = `${item.goods.name}/${item.currency.name}`
    let averagePriceOrPrice
    let dealledOrdealAmount

    const { isShowTotalPrice } = this.props
    if (isShowTotalPrice) {
      let averagePrice = new BigNumber(item.dealamount).dividedBy(item.dealled)
      if (averagePrice.isNaN()) {
        averagePrice = 0
      }
      common.precision(item.goods.name, item.currency.name, (p, q) => {
        averagePriceOrPrice = averagePrice.toFixed(p, 1)
        dealledOrdealAmount = new BigNumber(item.dealled).toFixed(q, 1)
      })
    } else {
      common.precision(item.goods.name, item.currency.name, (p, q, a) => {
        averagePriceOrPrice = new BigNumber(item.price).toFixed(p, 1)
        dealledOrdealAmount = new BigNumber(item.dealamount).toFixed(a, 1)
      })
    }
    return (
      <View style={OHCStyles.cellContainer}>
        <Text style={OHCStyles.goodsCurrency}>
          {goodsCurrency}
        </Text>
        <Text style={OHCStyles.averagePriceOrPrice}>
          {averagePriceOrPrice}
        </Text>
        <Text style={OHCStyles.dealledOrdealAmount}>
          {dealledOrdealAmount}
        </Text>
      </View>
    )
  }

  renderHeader = () => {
    const { titleSeleted } = this.props

    if (titleSeleted === '当前委托') {
      return this.renderOpenOrderHeader()
    }
    return this.renderOrderHistoryHeader()
  }

  renderCell = ({ item, index }) => {
    const { titleSeleted } = this.props

    if (titleSeleted === '当前委托') {
      return this.renderOpenOrderCell(item, index)
    }
    return this.renderOrderHistoryCell(item, index)
  }

  renderContent = () => {
    const datas = this.getDataSource()
    const refreshState = this.getRefreshState()

    return (
      <RefreshListView
        data={datas}
        refreshState={refreshState}
        renderItem={this.renderCell}
        keyExtractor={this.keyExtractor}
        ListHeaderComponent={this.renderHeader}
        onHeaderRefresh={this.onHeaderRefresh}
        onFooterRefresh={this.onFooterRefresh}
        footerTextStyle={{
          fontSize: common.font14,
          color: common.textColor,
        }}
      />
    )
  }

  render() {
    const { navigation } = this.props
    const { title } = navigation.state.params

    const titles = ['当前委托', '历史委托']
    const indexSelected = titles.indexOf(title) === -1 ? 0 : titles.indexOf(title)

    return (
      <View style={{
        flex: 1,
        backgroundColor: common.bgColor,
      }}
      >
        <TKSelectionBar
          initialIndexSelected={indexSelected}
          titles={titles}
          onPress={(e) => { this.topBarPress(e) }}
        />
        {this.renderContent()}
      </View>
    )
  }
}

function mapStateToProps(store) {
  return {
    ...store.orders,
    user: store.user.user,
  }
}

export default connect(
  mapStateToProps,
)(Orders)
