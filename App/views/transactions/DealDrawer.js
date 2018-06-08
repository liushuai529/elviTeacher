import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
} from 'react-native'
import { BigNumber } from 'bignumber.js'
import TransactionsSlider from './TransactionsSlider'
import TextInputTransactions from './TextInputTransactions'
import { common } from '../../constants/common'
import TKButton from '../../components/TKButton'

const styles = StyleSheet.create({
  cover: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: common.navBgColor,
    width: common.sw,
  },
  bottomBtn: {
    marginTop: common.margin10,
    marginLeft: common.margin15,
    marginRight: common.margin15,
    marginBottom: common.margin10,
    height: common.h36,
  },
  inputView: {
    marginTop: common.margin5,
    marginLeft: common.margin15,
    marginRight: common.margin15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    height: common.h30,
    width: (common.sw - common.margin30 - 2 * common.margin22) / 2,
    borderWidth: 1,
    borderColor: common.borderColor,
    backgroundColor: common.blackColor,
    flexDirection: 'row',
  },
  plusBtn: {
    width: common.h30,
    justifyContent: 'center',
  },
  plusBtnImage: {
    height: common.h15,
    width: common.h15,
    alignSelf: 'center',
  },
  slider: {
    marginTop: common.margin10,
    marginLeft: common.margin15,
    marginRight: common.margin15,
  },
  amount: {
    marginTop: common.margin10,
    marginLeft: common.margin15,
    marginRight: common.margin15,
    height: common.h30,
    borderWidth: 1,
    borderColor: common.borderColor,
    backgroundColor: common.blackColor,
  },
  amountVisible: {
    color: common.textColor,
    fontSize: common.font10,
    width: '85%',
    textAlign: 'right',
    alignSelf: 'center',
  },
  amountVisibleTitle: {
    color: common.textColor,
    fontSize: common.font10,
    width: '15%',
    alignSelf: 'center',
  },
})

class DealDrawer extends Component {
  constructor() {
    super()
    this.state = {
      visible: false,
      index: 0,
    }
  }

  caculateNecessaryData() {
    const { formData, selectedPair, amountVisible } = this.props
    const { price, quantity, amount } = formData
    const { index } = this.state
    let goodsName = ''
    let currencyName = ''
    let newamountVisible = ''
    let maximumValueSlider = 0
    let currentVisible = new BigNumber(0)
    let percentSlider = 0
    if (selectedPair) {
      goodsName = selectedPair.goods.name
      currencyName = selectedPair.currency.name
      if (amountVisible) {
        if (!index) {
          currentVisible = new BigNumber(amountVisible[currencyName]
            ? amountVisible[currencyName] : 0)
          maximumValueSlider = !price.length || Number(price) === 0 ? 0 : 1
          newamountVisible = `${new BigNumber(currentVisible).toFixed(8, 1)} ${currencyName}`
        } else {
          currentVisible = new BigNumber(amountVisible[goodsName] ? amountVisible[goodsName] : 0)
          maximumValueSlider = !price.length || currentVisible.eq(0) ? 0 : 1
          newamountVisible = `${new BigNumber(currentVisible).toFixed(8, 1)} ${goodsName}`
        }
      }
    }

    if (currentVisible.eq(0)) {
      percentSlider = 0
    } else if (!index) {
      let temp = amount / currentVisible.toNumber()
      if (BigNumber(temp).lt(0.01) && BigNumber(temp).gt(0)) {
        temp = 0.01
      }
      if (BigNumber(temp).lt(1) && BigNumber(temp).gt(0.99)) {
        temp = 0.99
      }
      percentSlider = temp
    } else {
      let temp = quantity / currentVisible.toNumber()
      if (BigNumber(temp).lt(0.01) && BigNumber(temp).gt(0)) {
        temp = 0.01
      }
      if (BigNumber(temp).lt(1) && BigNumber(temp).gt(0.99)) {
        temp = 0.99
      }
      percentSlider = temp
    }
    return {
      goodsName,
      currencyName,
      newamountVisible,
      maximumValueSlider,
      currentVisible,
      percentSlider,
    }
  }

  hide() {
    this.setState({
      visible: false,
      index: 0,
    }, () => {
      const { unmountAction } = this.props
      if (unmountAction) {
        unmountAction()
      }
    })
  }

  showAtIndex(index) {
    this.setState({
      visible: true,
      index,
    })
  }

  render() {
    const caculatedData = this.caculateNecessaryData()
    const { formData, changeAction, slideAction, buttonAction } = this.props
    const { price, quantity, amount } = formData
    const { index } = this.state
    if (this.state.visible === false) {
      return null
    }
    return (
      <Modal
        animationType="fade"
        transparent
        visible
        onRequestClose={() => { }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.cover}
          onPress={() => this.hide()}
        />
        <KeyboardAvoidingView
          contentContainerStyle={{ justifyContent: 'center', backgroundColor: common.navBgColor }}
          behavior="position"
        >
          <View style={[styles.inputView, { marginTop: common.margin10 }]}>
            <Text style={styles.amountVisibleTitle}>可用</Text>
            <Text style={styles.amountVisible}>
              {caculatedData.newamountVisible}
            </Text>
          </View>

          <View style={styles.inputView}>
            <View style={styles.price}>
              <TouchableOpacity
                style={styles.plusBtn}
                activeOpacity={common.activeOpacity}
                onPress={() => {
                  if (changeAction) {
                    changeAction({
                      cmd: 'release',
                      type: 'price',
                    })
                  }
                }}
              >
                <Image
                  style={styles.plusBtnImage}
                  source={require('../../assets/release.png')}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
              <TextInputTransactions
                placeholder={`价格（${caculatedData.currencyName}）`}
                value={price}
                onChange={(e) => {
                  if (changeAction) {
                    changeAction({
                      cmd: 'input',
                      type: 'price',
                      val: e,
                    })
                  }
                }}
              />
              <TouchableOpacity
                style={styles.plusBtn}
                activeOpacity={common.activeOpacity}
                onPress={() => {
                  if (changeAction) {
                    changeAction({
                      cmd: 'plus',
                      type: 'price',
                    })
                  }
                }}
              >
                <Image
                  style={styles.plusBtnImage}
                  source={require('../../assets/plus.png')}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.price}>
              <TouchableOpacity
                style={styles.plusBtn}
                activeOpacity={common.activeOpacity}
                onPress={() => {
                  if (changeAction) {
                    changeAction({
                      cmd: 'release',
                      type: 'quantity',
                    })
                  }
                }}
              >
                <Image
                  style={styles.plusBtnImage}
                  source={require('../../assets/release.png')}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
              <TextInputTransactions
                placeholder={`数量（${caculatedData.goodsName}）`}
                value={quantity}
                onChange={(e) => {
                  if (changeAction) {
                    changeAction({
                      cmd: 'input',
                      type: 'quantity',
                      val: e,
                    })
                  }
                }}
              />
              <TouchableOpacity
                style={styles.plusBtn}
                activeOpacity={common.activeOpacity}
                onPress={() => {
                  if (changeAction) {
                    changeAction({
                      cmd: 'plus',
                      type: 'quantity',
                    })
                  }
                }}
              >
                <Image
                  style={styles.plusBtnImage}
                  source={require('../../assets/plus.png')}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.amount}>
            <TextInputTransactions
              textInputStyle={{ width: '100%' }}
              placeholder={`成交金额（${caculatedData.currencyName}）`}
              value={amount}
              editable={false}
            />
          </View>

          <TransactionsSlider
            viewStyle={styles.slider}
            minimumValue={0}
            maximumValue={caculatedData.maximumValueSlider}
            percentSlider={caculatedData.percentSlider}
            onValueChange={(percent) => {
              if (slideAction) {
                slideAction({
                  percent,
                  currentVisible: caculatedData.currentVisible,
                  index,
                })
              }
            }}
          />

          <TKButton
            style={[styles.bottomBtn, {
              backgroundColor: !index ? common.redColor : common.greenColor,
            }]}
            titleStyle={{
              fontSize: common.font16,
              color: 'white',
            }}
            theme={'gray'}
            caption={!index ? '买入' : '卖出'}
            onPress={() => {
              if (buttonAction) {
                buttonAction(index)
              }
            }}
            disabled={caculatedData.delegateCreateVisible}
          />
        </KeyboardAvoidingView>
      </Modal>

    )
  }
}

export default DealDrawer
