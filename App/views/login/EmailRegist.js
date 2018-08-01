import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native'
import Toast from 'teaset/components/Toast/Toast'
import { common } from '../../constants/common'
import actions from '../../actions/index'
import TKInputItem from '../../components/TKInputItem'
import TKInputItemCheckCode from '../../components/TKInputItemCheckCode'
import TKButton from '../../components/TKButton'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import TKSpinner from '../../components/TKSpinner'
import transfer from '../../localization/utils'

const styles = StyleSheet.create({
  cover: {
    flex: 1,
    backgroundColor: common.blackColor,
    paddingTop: common.getH(90) - common.navHeight,
  },
  container: {
    marginTop: common.margin10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    alignSelf: 'center',
    color: common.textColor,
    fontSize: common.font12,
  },
  contentContainer: {
    marginHorizontal: common.margin38,
  },
  mobileTip: {
    position: 'absolute',
    top: common.margin5,
    left: common.w100,
    fontSize: common.font12,
    color: common.redColor,
    width: common.sw * 0.8 - common.getH(80),
  },
  leftIcon: {
    height: common.w40,
    width: common.w40,
    justifyContent: 'center',
  },
  rightMenu: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 10,
  },
})

class EmailRegist extends Component {
  static navigationOptions({ navigation }) {
    let rightText = ''
    let rightHandler
    if (navigation.state.params) {
      rightText = navigation.state.params.rightText
      rightHandler = navigation.state.params.rightHandler
    }
    return {
      headerStyle: {
        backgroundColor: common.bgColor,
        borderBottomWidth: 0,
      },
      headerTintColor: 'white',
      headerLeft: (
        <NextTouchableOpacity
          style={styles.leftIcon}
          activeOpacity={common.activeOpacity}
          onPress={() => navigation.goBack()}
        >
          <Image
            style={{
              marginLeft: common.margin10,
              width: common.w10,
              height: common.h20,
            }}
            source={require('../../assets/arrow_left_left.png')}
          />
        </NextTouchableOpacity>
      ),
      headerRight: (
        <NextTouchableOpacity
          activeOpacity={common.activeOpacity}
          onPress={() => {
            if (rightHandler) {
              rightHandler()
            }
          }}
        >
          <Text
            style={styles.rightMenu}
          >{rightText}</Text>
        </NextTouchableOpacity>
      ),
    }
  }

  constructor() {
    super()
    this.showRegisterResponse = false
    this.showGetVerificateCodeResponse = false

    if (common.IsIOS) {
      this.state = {
        showTip: false,
        offset: 0,
      }
    } else {
      this.state = {
        showTip: false,
      }
    }
  }

  componentWillMount() {
    const { navigation, language, dispatch } = this.props
    navigation.setParams({
      rightText: transfer(language, 'login_phone_regist'),
      rightHandler: () => {
        dispatch(actions.registerUpdate({
          mobile: '',
          code: '',
          password: '',
          passwordAgain: '',
          recommendNo: '',
        }))
        navigation.replace('Register')
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    this.handleGetVerificateCodeRequest(nextProps)
    this.handleRegisterRequest(nextProps)
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch(actions.registerResetNexus())
  }

  onChange(event, tag) {
    const { text } = event.nativeEvent
    const { dispatch, mobile, code, password, passwordAgain, recommendNo } = this.props
    const newText = text.trim()
    switch (tag) {
      case 'mobile':
        this.setState({ showTip: false })
        dispatch(actions.registerUpdate({
          mobile: newText,
          code,
          password,
          passwordAgain,
          recommendNo,
        }))
        break
      case 'code':
        dispatch(actions.registerUpdate({
          mobile,
          code: newText,
          password,
          passwordAgain,
          recommendNo,
        }))
        break
      case 'password':
        dispatch(actions.registerUpdate({
          mobile,
          code,
          password: newText,
          passwordAgain,
          recommendNo,
        }))
        break
      case 'passwordAgain':
        dispatch(actions.registerUpdate({
          mobile,
          code,
          password,
          passwordAgain: newText,
          recommendNo,
        }))
        break
      case 'recommendNo':
        dispatch(actions.registerUpdate({
          mobile,
          code,
          password,
          passwordAgain,
          recommendNo: newText,
        }))
        break
      default:
        break
    }
  }

  accountOffest = common.Is5Series ? -75 : -50
  authCodeOffset = common.Is5Series ? -75 : -50
  passwordOffset = common.Is5Series ? -12 : -8
  passwordConfirmOffset = common.Is5Series ? -12 : -8
  recommendNoOffset = 100

  codePress() {
    const { dispatch, mobile, mobileIsExist, language } = this.props
    if (mobileIsExist) {
      Toast.fail(transfer(language, 'login_emailRegisted'))
      return
    }
    if (!mobile) {
      Toast.fail(transfer(language, 'login_emailUnNull'))
      return
    }
    if (!common.regEmail.test(mobile)) {
      Toast.fail(transfer(language, 'login_inputCorrectEmail'))
      return
    }
    dispatch(actions.getVerificateSmtpCode({
      email: mobile, // 这里用mobile 记录的是 邮箱
      service: 'auth',
    }))
  }

  registerPress() {
    const { dispatch, mobile, code, password,
      passwordAgain, recommendNo, language } = this.props

    if (!mobile.length) {
      Toast.fail(transfer(language, 'login_inputEmail'))
      return
    }
    if (!code.length) {
      Toast.fail(transfer(language, 'login_inputCode'))
      return
    }
    if (!password.length || !common.filterPwd(password)) {
      Toast.show({
        style: {
          paddingLeft: common.margin20,
          paddingRight: common.margin20,
        },
        text: transfer(language, 'login_passFormatterError'),
      })
      return
    }
    if (!passwordAgain.length) {
      Toast.fail(transfer(language, 'login_resetPass'))
      return
    }
    if (password !== passwordAgain) {
      Toast.fail(transfer(language, 'login_samePass'))
      return
    }
    if (!common.regEmail.test(mobile)) {
      Toast.fail(transfer(language, 'login_inputCorrectEmail'))
      return
    }
    dispatch(actions.register({
      email: mobile, // 这里用mobile 记录的是 邮箱
      code,
      password,
      recommendNo,
    }))
  }

  handleGetVerificateCodeRequest(nextProps) {
    const { getVerificateSmtpCodeVisible, getVerificateCodeResponse, language } = nextProps
    if (!getVerificateSmtpCodeVisible && !this.showGetVerificateCodeResponse) return

    if (getVerificateSmtpCodeVisible) {
      this.showGetVerificateCodeResponse = true
    } else {
      this.showGetVerificateCodeResponse = false
      if (getVerificateCodeResponse.success) {
        Toast.success(transfer(language, 'get_code_succeed'))
      } else if (getVerificateCodeResponse.error.code === 4000101) {
        Toast.fail(transfer(language, 'login_email_numberOrTypeError'))
      } else if (getVerificateCodeResponse.error.code === 4000102) {
        Toast.fail(transfer(language, 'login_email_disbaleSendInOneMin'))
      } else if (getVerificateCodeResponse.error.code === 4000104) {
        Toast.fail(transfer(language, 'login_emailRegisted'))
      } else if (getVerificateCodeResponse.error.message === common.badNet) {
        Toast.fail(transfer(language, 'login_email_networdError'))
      } else {
        Toast.fail(transfer(language, 'login_email_getCodeFailed'))
      }
    }
  }

  handleRegisterRequest(nextProps) {
    const { registerVisible, registerResponse, navigation, language } = nextProps
    if (!registerVisible && !this.showRegisterResponse) return

    if (registerVisible) {
      this.showRegisterResponse = true
    } else {
      this.showRegisterResponse = false

      if (registerResponse.success) {
        Toast.success(transfer(language, 'login_registSuccess'))

        const { dispatch } = this.props
        dispatch(actions.loginUpdate({ mobile: '', password: '' }))
        navigation.goBack()
      } else if (registerResponse.error.code === 4000104) {
        Toast.fail(transfer(language, 'login_reGetCode'))
      } else if (registerResponse.error.code === 4000101) {
        Toast.fail(transfer(language, 'login_codeNotNull'))
      } else if (registerResponse.error.code === 4000102) {
        Toast.fail(transfer(language, 'login_codeError'))
      } else if (registerResponse.error.code === 4000103) {
        Toast.fail(transfer(language, 'login_codeOverDue'))
      } else if (registerResponse.error.code === 4000114) {
        Toast.fail(transfer(language, 'login_emailRegisted'))
      } else if (registerResponse.error.code === 4000115) {
        Toast.fail(transfer(language, 'login_inviteUserNotExist'))
      } else if (registerResponse.error.code === 4000113) {
        Toast.fail(transfer(language, 'login_inviteCodeError'))
      } else if (registerResponse.error.message === common.badNet) {
        Toast.fail(transfer(language, 'login_networdError'))
      } else {
        Toast.fail(transfer(language, 'login_registFailed'))
      }
    }
  }

  renderAccount = () => {
    const { mobile, language } = this.props
    return (
      <TKInputItem
        viewStyle={{ flex: undefined }}
        titleStyle={{
          width: common.h80,
        }}
        title={transfer(language, 'login_id')}
        placeholder={transfer(language, 'login_email_input')}
        textInputProps={{
          onBlur: () => {
            if (!common.regEmail.test(this.props.mobile)) {
              this.props.dispatch(actions.clearMobileIsExist())
              this.setState({ showTip: true })
            } else {
              // 需要修改
              // this.props.dispatch(actions.mobileIsExist({
              //   type: 'email',
              //   value: this.props.mobile,
              // }))
              // this.setState({ showTip: false })
            }
          },
        }}
        value={mobile}
        onChange={e => this.onChange(e, 'mobile')}
        onFocus={() => {
          if (common.IsIOS) {
            this.setState({
              offset: this.accountOffest,
            })
          }
        }}
      />
    )
  }

  renderAccountTip = () => {
    const { showTip } = this.state
    const { mobileIsExist, language } = this.props
    if (mobileIsExist) {
      return (
        <View style={{ height: 40 }}>
          <Text style={styles.mobileTip}>
            {transfer(language, 'login_emailRegisted')}
          </Text>
        </View>
      )
    }
    return (
      <View style={{ height: 40 }}>
        {showTip ?
          <Text style={styles.mobileTip}>
            {transfer(language, 'login_emailFormatError')}
          </Text> : null}
      </View>
    )
  }

  renderCheckCode = () => {
    const { code, mobile, mobileIsExist, language } = this.props
    return (
      <TKInputItemCheckCode
        viewStyle={{ flex: undefined }}
        titleStyle={{
          width: common.h80,
        }}
        title={transfer(language, 'login_code')}
        placeholder={transfer(language, 'login_email_inputCode')}
        language={language}
        value={code}
        maxLength={common.textInputMaxLenPwd}
        onChange={e => this.onChange(e, 'code')}
        onPressCheckCodeBtn={() => { this.codePress() }}
        extraDisable={!mobile || !common.regEmail.test(mobile) || mobileIsExist}
        textInputProps={{
          keyboardType: 'numeric',
        }}
        onFocus={() => {
          if (common.IsIOS) {
            this.setState({
              offset: this.authCodeOffset,
            })
          }
        }}
      />
    )
  }

  renderErrorTip = (tip) => {
    const hasTip = tip && !common.filterPwd(tip)
    const tipView = hasTip && (
      <Text
        style={{
          color: common.redColor,
          fontSize: common.font12,
          width: common.sw * 0.8 - common.getH(80),
        }}
      >
        {transfer(this.props.language, 'login_passFormatterError')}
      </Text>
    )
    return (
      <View style={{
        alignItems: 'flex-end',
        height: common.w40,
        width: common.sw * 0.8 - common.getH(80),
      }}
      >
        <View>
          <Text style={{ paddingTop: common.margin5 }}>
            {tipView}
          </Text>
        </View>
      </View>
    )
  }

  renderPwdErrorTip = () => {
    const { password } = this.props
    return this.renderErrorTip(password)
  }

  renderPassword = () => {
    const { password, language } = this.props
    return (
      <TKInputItem
        viewStyle={{ flex: undefined }}
        titleStyle={{
          width: common.h80,
        }}
        title={transfer(language, 'login_password')}
        placeholder={transfer(language, 'login_passwordPlaceholder')}
        value={password}
        maxLength={common.textInputMaxLenPwd}
        secureTextEntry
        onChange={e => this.onChange(e, 'password')}
        onFocus={() => {
          if (common.IsIOS) {
            this.setState({
              offset: this.passwordOffset,
            })
          }
        }}
      />
    )
  }

  renderConfirmPwd = () => {
    const { passwordAgain, language } = this.props
    return (
      <TKInputItem
        viewStyle={{ flex: undefined }}
        titleStyle={{
          width: common.h80,
        }}
        title={transfer(language, 'login_repeatPassword')}
        placeholder={transfer(language, 'login_repeatPasswordAgain')}
        value={passwordAgain}
        maxLength={common.textInputMaxLenPwd}
        secureTextEntry
        onChange={e => this.onChange(e, 'passwordAgain')}
        onFocus={() => {
          if (common.IsIOS) {
            this.setState({
              offset: this.passwordConfirmOffset,
            })
          }
        }}
      />
    )
  }

  renderRecommendNo = () => {
    const { recommendNo, language } = this.props
    return (
      <TKInputItem
        viewStyle={{ flex: undefined }}
        titleStyle={{
          width: common.h80,
        }}
        title={transfer(language, 'login_inviteCode')}
        placeholder={transfer(language, 'login_optional')}
        value={recommendNo}
        maxLength={common.textInputMaxLenPwd}
        onChange={e => this.onChange(e, 'recommendNo')}
        onFocus={() => {
          if (common.IsIOS) {
            this.setState({
              offset: this.recommendNoOffset,
            })
          }
        }}
      />
    )
  }

  renderExtraBtns = () => {
    const { navigation, language } = this.props
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }} >
          <Text
            style={styles.title}
          >{transfer(language, 'login_registAsAgree')}</Text>
          <TKButton
            theme={'small'}
            caption={`《${transfer(language, 'login_agreement')}》`}
            onPress={() => navigation.navigate('Agreement')}
          />
        </View>
        <TKButton
          theme={'small'}
          caption={transfer(language, 'login_hasAccount')}
          onPress={() => navigation.goBack()}
        />
      </View>
    )
  }

  render() {
    const {
      registerVisible,
      mobile,
      code,
      password,
      passwordAgain,
      language,
    } = this.props

    let behavior = null
    let offset = 0
    if (common.IsIOS) {
      behavior = 'position'
      offset = this.state.offset
    } else {
      behavior = 'padding'
    }
    let canRegister = false
    if (!this.state.showTip && mobile && code && password && passwordAgain && true) {
      canRegister = true
    }
    const registerBtnBackgroundColor = canRegister ? {} : { backgroundColor: common.grayColor }
    return (
      <ScrollView
        style={styles.cover}
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          contentContainerStyle={{ justifyContent: 'center' }}
          behavior={behavior}
          keyboardVerticalOffset={offset}
        >
          <View style={styles.contentContainer}>
            {this.renderAccount()}

            {this.renderAccountTip()}

            {this.renderCheckCode()}

            <View style={{ height: 40 }} />

            {this.renderPassword()}

            {this.renderPwdErrorTip()}

            {this.renderConfirmPwd()}

            <View style={{ height: 40 }} />

            {this.renderRecommendNo()}

            {this.renderExtraBtns()}

            <View style={{ height: 40 }} />
          </View>

          <TKButton
            style={registerBtnBackgroundColor}
            theme="yellow"
            caption={transfer(language, 'login_registText')}
            disabled={!canRegister}
            onPress={() => this.registerPress()}
          />
        </KeyboardAvoidingView>
        <TKSpinner
          isVisible={registerVisible}
        />
      </ScrollView>

    )
  }
}

function mapStateToProps(state) {
  return {
    mobile: state.user.mobileRegister,
    code: state.user.codeRegister,
    password: state.user.passwordRegister,
    passwordAgain: state.user.passwordAgainRegister,
    recommendNo: state.user.recommendNo,
    mobileIsExist: state.user.mobileIsExist,

    registerVisible: state.user.registerVisible,
    registerResponse: state.user.registerResponse,

    getVerificateSmtpCodeVisible: state.user.getVerificateSmtpCodeVisible,
    getVerificateCodeResponse: state.user.getVerificateSmtpCodeResponse,

    language: state.system.language,
  }
}

export default connect(
  mapStateToProps,
)(EmailRegist)
