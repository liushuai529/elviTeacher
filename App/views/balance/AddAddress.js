import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native'
import {
  Toast,
  Overlay,
} from 'teaset'
import WAValidator from 'wallet-address-validator'
import { common } from '../../constants/common'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import {
  updateForm,
  requestAddressAdd,
  requestAddressClearError,
  updateAuthCodeType,
  check2GoogleAuth,
  check2GoogleAuthSetResponse,
} from '../../actions/addressAdd'
import { requestWithdrawAddress } from '../../actions/withdraw'
import { getVerificateCode } from '../../actions/user'
import TKViewCheckAuthorize from '../../components/TKViewCheckAuthorize'
import TKButton from '../../components/TKButton'
import TKInputItem from '../../components/TKInputItem'
import findAddress from '../../schemas/address'
import WithdrawAuthorizeCode from './components/WithdrawAuthorizeCode'

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
  container: {
    flex: 1,
    backgroundColor: common.bgColor,
  },
  titleContainer: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
    height: common.h40,
    borderWidth: 1,
    borderRadius: 1,
    borderColor: common.borderColor,
    backgroundColor: common.navBgColor,
    justifyContent: 'center',
  },
  title: {
    marginLeft: common.margin10,
    fontSize: common.font14,
    color: common.textColor,
  },
  addressContainer: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
  },
  remarkContainer: {
    marginTop: common.margin10,
    marginLeft: common.margin10,
    marginRight: common.margin10,
  },
  addContainer: {
    marginTop: common.margin40,
  },
  overlay: {
    justifyContent: 'center',
  },
})

class AddAddress extends Component {
  static navigationOptions(props) {
    return {
      headerTitle: '添加地址',
      headerStyle: {
        backgroundColor: common.navBgColor,
        borderBottomWidth: 0,
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontSize: common.font16,
      },
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

  componentWillReceiveProps(nextProps) {
    this.handleRequestCheck2GoogleCode(nextProps)
    if (nextProps.error) {
      Overlay.hide(this.overlayViewKey)
      const errCode = nextProps.error.code
      const errMsg = this.errMsgs[errCode]
      if (errMsg) {
        Toast.fail(errMsg)
      } else {
        Toast.fail('添加地址错误')
      }
      this.props.dispatch(requestAddressClearError())
    }

    if (this.props.loading && !nextProps.loading) {
      Toast.success('添加地址成功')
      Overlay.hide(this.overlayViewKey)
      const { navigation, dispatch, user } = this.props
      dispatch(requestWithdrawAddress(findAddress(user.id)))
      navigation.goBack()
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch(updateForm({
      address: '',
      remark: '',
      authCode: '',
      googleCode: '',
    }))
  }

  errMsgs = {
    4000413: '提币地址长度有误！',
    4000414: '提币地址已存在！',
    4000416: '提币地址格式错误',
    4000156: '授权验证失败',
  }

  handleRequestCheck2GoogleCode(nextProps) {
    if (!nextProps.googleCodeLoading && this.props.googleCodeLoading) {
      const { googleCodeResponse, dispatch, formState } = nextProps
      if (googleCodeResponse.success) {
        const { navigation } = this.props
        dispatch(requestAddressAdd({
          token_id: navigation.state.params.tokenId,
          withdrawaddr: formState.address,
          remark: formState.remark,
          googleCode: formState.googleCode,
        }))
      } else {
        const errCode = googleCodeResponse.error.code
        if (errCode === 4000171) {
          Toast.fail('请先绑定谷歌验证码!')
        } else {
          Toast.fail('谷歌验证码错误!')
        }
      }
      dispatch(check2GoogleAuthSetResponse(null))
    }
  }

  handleChangeAddress = (address = '') => {
    const { dispatch, formState } = this.props
    const newAddress = address.trim()
    dispatch(updateForm({
      ...formState,
      address: newAddress,
    }))
  }

  handleRemarkAddress = (remark) => {
    const { dispatch, formState } = this.props
    dispatch(updateForm({
      ...formState,
      remark,
    }))
  }

  handleAuthCode = (authCode) => {
    const { dispatch, formState } = this.props
    dispatch(updateForm({
      ...formState,
      authCode: authCode.trim(),
    }))
  }

  checkWithdrawAddressIsIneligible = (address, coin) => {
    const isIneligible =
    !WAValidator.validate(address, coin) &&
    !WAValidator.validate(address, coin, 'testnet')

    return isIneligible
  }

  confirmPress() {
    const { formState } = this.props
    if (!formState.address.length) {
      Toast.fail('请填写提币地址')
      return
    }

    const { address } = formState
    const { navigation } = this.props
    const { title } = navigation.state.params

    if (this.checkWithdrawAddressIsIneligible(address, title)) {
      Alert.alert(
        '提示',
        `请填写正确的${title}提币地址！`,
        [
          {
            text: '确定',
            onPress: () => {},
          },
        ],
      )
      return
    }

    if (!formState.remark.length) {
      Toast.fail('请填写备注')
      return
    }
    // this.showOverlay()
    this.showAuthCode()
  }

  addPress() {
    Keyboard.dismiss()
    Overlay.hide(this.overlayViewKeyID)

    const { authCodeType, formState, dispatch } = this.props
    if (authCodeType === '短信验证码') {
      if (!formState.authCode.length) {
        Toast.fail('请输入验证码')
        return
      }
      const { navigation } = this.props
      dispatch(requestAddressAdd({
        token_id: navigation.state.params.tokenId,
        withdrawaddr: formState.address,
        remark: formState.remark,
        code: formState.authCode,
      }))
    } else {
      if (!formState.googleCode.length) {
        Toast.fail('请输入谷歌验证码')
        return
      }
      dispatch(check2GoogleAuth({ googleCode: formState.googleCode }))
    }
  }

  authCodeChanged = (e, code) => {
    const { dispatch, formState, authCodeType } = this.props
    if (authCodeType === '短信验证码') {
      dispatch(updateForm({
        ...formState,
        authCode: code,
      }))
    } else {
      dispatch(updateForm({
        ...formState,
        googleCode: code,
      }))
    }
  }

  segmentValueChanged = (e) => {
    const { dispatch, formState } = this.props
    dispatch(updateAuthCodeType(e.title))

    if (e.title === '谷歌验证码') {
      dispatch(updateForm({
        ...formState,
        authCode: '',
      }))
    } else {
      dispatch(updateForm({
        ...formState,
        googleCode: '',
      }))
    }
  }

  SMSCodePress = (count) => {
    this.count = count
    const { user, dispatch } = this.props
    dispatch(getVerificateCode({ mobile: user.mobile, service: 'auth' }))
  }

  showAuthCode = () => {
    const { dispatch, user, formState } = this.props
    dispatch(updateAuthCodeType('短信验证码'))
    dispatch(updateForm({
      ...formState,
      authCode: '',
      googleCode: '',
    }))
    const overlayView = (
      <Overlay.View
        style={{ top: '35%' }}
        modal={false}
        overlayOpacity={0}
      >
        <WithdrawAuthorizeCode
          titles={['短信验证码', '谷歌验证码']}
          mobile={user.mobile}
          onChangeText={this.authCodeChanged}
          segmentValueChanged={this.segmentValueChanged}
          smsCodePress={this.SMSCodePress}
          confirmPress={() => this.addPress()}
          cancelPress={() => Overlay.hide(this.overlayViewKeyID)}
        />
      </Overlay.View>
    )
    this.overlayViewKeyID = Overlay.show(overlayView)
  }

  showOverlay() {
    const { dispatch, user } = this.props
    const overlayView = (
      <Overlay.View
        style={styles.overlay}
        modal={false}
        overlayOpacity={0}
      >
        <TKViewCheckAuthorize
          mobile={user.mobile}
          onChangeText={this.handleAuthCode}
          codePress={(count) => {
            this.authCount = count
            dispatch(getVerificateCode({ mobile: user.mobile, service: 'auth' }))
          }}
          confirmPress={() => this.addPress()}
          cancelPress={() => Overlay.hide(this.overlayViewKey)}
        />
      </Overlay.View>
    )
    this.overlayViewKey = Overlay.show(overlayView)
  }

  render() {
    const { navigation, formState } = this.props

    return (
      <View
        style={styles.container}
      >
        <ScrollView>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {navigation.state.params.title}
            </Text>
          </View>

          <TKInputItem
            viewStyle={styles.addressContainer}
            inputStyle={{
              fontSize: common.font14,
            }}
            placeholder="地址"
            value={formState.address}
            onChangeText={this.handleChangeAddress}
          />

          <TKInputItem
            viewStyle={styles.remarkContainer}
            inputStyle={{ fontSize: common.font14 }}
            placeholder="备注"
            value={formState.remark}
            onChangeText={this.handleRemarkAddress}
          />

          <TKButton
            style={styles.addContainer}
            onPress={() => this.confirmPress()}
            caption={'添加'}
            theme={'gray'}
          />
        </ScrollView>
      </View>
    )
  }
}

function mapStateToProps(store) {
  return {
    ...store.addressAdd,
    user: store.user.user,
  }
}

export default connect(
  mapStateToProps,
)(AddAddress)
