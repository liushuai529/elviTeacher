import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native'
import Toast from 'teaset/components/Toast/Toast'
import Spinner from 'react-native-spinkit'
import { common } from '../../constants/common'
import TextInputLogin from './TextInputLogin'
import TextInputCode from './TextInputCode'
import BtnLogin from './BtnLogin'
import actions from '../../actions/index'

class ForgotPwd extends Component {
  constructor() {
    super()
    this.showGetVerificateCodeResponse = false
    this.showCheckVerificateCodeResponse = false
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch(actions.registerUpdate({
      mobile: '',
      code: '',
      password: '',
      passwordAgain: '',
    }))
  }

  onChange(event, tag) {
    const { text } = event.nativeEvent
    const { dispatch, mobile, code } = this.props

    switch (tag) {
      case 'mobile':
        dispatch(actions.registerUpdate({ mobile: text, code, password: '', passwordAgain: '' }))
        break
      case 'code':
        dispatch(actions.registerUpdate({ mobile, code: text, password: '', passwordAgain: '' }))
        break
      default:
        break
    }
  }

  codePress(count) {
    const { dispatch, mobile } = this.props
    if (!common.regMobile.test(mobile)) {
      Toast.message('请输入正确的手机号')
      return
    }
    this.count = count
    dispatch(actions.getVerificateCode({
      mobile,
      service: 'reset',
    }))
  }

  nextPress() {
    const { dispatch, mobile, code } = this.props
    if (!mobile.length) {
      Toast.message('请输入手机号')
      return
    }
    if (!code.length) {
      Toast.message('请输入验证码')
      return
    }
    if (!common.regMobile.test(mobile)) {
      Toast.message('请输入正确的手机号')
      return
    }
    dispatch(actions.checkVerificateCode({
      mobile,
      service: 'reset',
      code,
    }))
  }

  /* 获取验证码请求结果处理 */
  handleGetVerificateCodeRequest() {
    const { getVerificateCodeVisible, getVerificateCodeResponse } = this.props
    if (!getVerificateCodeVisible && !this.showGetVerificateCodeResponse) return

    if (getVerificateCodeVisible) {
      this.showGetVerificateCodeResponse = true
    } else {
      this.showGetVerificateCodeResponse = false
      if (getVerificateCodeResponse.success) {
        Toast.success(getVerificateCodeResponse.result.message)
        this.count()
      } else if (getVerificateCodeResponse.error.code === 4000101) {
        Toast.fail('手机号码或服务类型错误')
      } else if (getVerificateCodeResponse.error.code === 4000102) {
        Toast.fail('一分钟内不能重复发送验证码')
      } else if (getVerificateCodeResponse.error.code === 4000104) {
        Toast.fail('手机号码未注册')
      } else if (getVerificateCodeResponse.error.message === common.badNet) {
        Toast.fail('网络连接失败，请稍后重试')
      } else {
        Toast.fail('获取验证码失败，请重试')
      }
    }
  }

  /* 检测验证码请求结果处理 */
  handleCheckVerificateCodeRequest() {
    const { checkVerificateCodeVisible, checkVerificateCodeResponse, navigation } = this.props
    if (!checkVerificateCodeVisible && !this.showCheckVerificateCodeResponse) return

    if (checkVerificateCodeVisible) {
      this.showCheckVerificateCodeResponse = true
    } else {
      this.showCheckVerificateCodeResponse = false
      if (checkVerificateCodeResponse.success) {
        navigation.navigate('ConfirmPwd')
      } else if (checkVerificateCodeResponse.error.code === 4000101) {
        Toast.fail('手机号码或服务类型错误')
      } else if (checkVerificateCodeResponse.error.code === 4000102) {
        Toast.fail('验证码错误')
      } else if (checkVerificateCodeResponse.error.message === common.badNet) {
        Toast.fail('网络连接失败，请稍后重试')
      } else {
        Toast.fail('验证失败，请重试')
      }
    }
  }

  render() {
    this.handleGetVerificateCodeRequest()
    this.handleCheckVerificateCodeRequest()

    const { mobile, code, getVerificateCodeVisible, checkVerificateCodeVisible } = this.props
    return (
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: common.bgColor,
        }}
        behavior="padding"
      >
        <ScrollView>
          <StatusBar
            barStyle={'light-content'}
          />

          <TextInputLogin
            viewStyle={{
              marginTop: common.margin110,
            }}
            textStyle={{
              width: common.w100,
            }}
            title="账号"
            placeholder="请输入11位手机号"
            value={mobile}
            maxLength={11}
            onChange={e => this.onChange(e, 'mobile')}
          />

          <TextInputCode
            value={code}
            maxLength={6}
            onPress={count => this.codePress(count)}
            onChange={e => this.onChange(e, 'code')}
          />

          <BtnLogin
            viewStyle={{
              marginTop: common.margin210,
            }}
            title="下一步"
            disabled={getVerificateCodeVisible}
            onPress={() => this.nextPress()}
          />
        </ScrollView>

        <Spinner
          style={{
            position: 'absolute',
            alignSelf: 'center',
            marginTop: common.sh / 2 - common.h50 / 2,
          }}
          isVisible={checkVerificateCodeVisible}
          size={common.h50}
          type={'Wave'}
          color={common.btnTextColor}
        />
      </KeyboardAvoidingView>
    )
  }
}

function mapStateToProps(store) {
  return {
    mobile: store.user.mobileRegister,
    code: store.user.codeRegister,

    getVerificateCodeVisible: store.user.getVerificateCodeVisible,
    getVerificateCodeResponse: store.user.getVerificateCodeResponse,

    checkVerificateCodeVisible: store.user.checkVerificateCodeVisible,
    checkVerificateCodeResponse: store.user.checkVerificateCodeResponse,
  }
}

export default connect(
  mapStateToProps,
)(ForgotPwd)
