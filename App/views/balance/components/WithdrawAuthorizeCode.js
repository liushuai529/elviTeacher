import React, { Component } from 'react'
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native'
import { common } from '../../../constants/common'
import TKCheckCodeBtn from '../../../components/TKCheckCodeBtn'
import WithdrawAuthSelecionBar from './WithdrawAuthSelecionBar'
import NextTouchableOpacity from '../../../components/NextTouchableOpacity'
import transfer from '../../../localization/utils'
import * as api from '../../../services/api'

const styles = StyleSheet.create({
  unbinkMobileContainer: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tip: {
    color: common.blackColor,
    fontSize: common.font12,
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#fff',
    marginLeft: common.getH(48),
    marginRight: common.getH(48),
    borderRadius: common.radius6,
  },
  mobileContainer: {
    marginTop: common.getH(10),
    marginLeft: common.getH(20),
    marginRight: common.getH(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mobileTip: {
    color: common.blackColor,
    fontSize: common.font12,
    alignSelf: 'center',
  },
  mobile: {
    color: common.blackColor,
    fontSize: common.font14,
    width: '62%',
  },
  inputContainer: {
    marginTop: common.getH(12),
    marginLeft: common.getH(20),
    marginRight: common.getH(20),
    marginBottom: common.getH(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputInnerContainer: {
    borderColor: common.lineColor,
    borderWidth: 1,
    height: common.getH(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '62%',
  },
  textInput: {
    padding: 0,
    marginLeft: common.getH(5),
    color: common.blackColor,
    fontSize: common.font14,
    width: '50%',
  },
  codeContainer: {
    marginRight: common.getH(5),
    alignSelf: 'center',
  },
  fetchCodeTitle: {
    fontSize: common.font10,
  },
  btnsContainer: {
    marginTop: common.getH(10),
    marginLeft: common.getH(20),
    marginRight: common.getH(20),
    marginBottom: common.getH(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  googleCodeContainer: {
    marginTop: common.getH(25),
    marginBottom: common.getH(24),
    marginLeft: common.getH(20),
    marginRight: common.getH(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  googleCode: {
    color: common.blackColor,
    fontSize: common.font12,
  },
  googleInputContainer: {
    borderColor: common.lineColor,
    borderWidth: 1,
    width: '62%',
    height: common.getH(30),
    justifyContent: 'center',
  },
  googleInput: {
    marginLeft: common.margin5,
    color: common.blackColor,
    fontSize: common.font12,
    width: '50%',
  },
  line: {
    marginLeft: common.getH(10),
    marginRight: common.getH(10),
    height: common.getH(1),
    backgroundColor: common.lineColor,
  },
  cancelBtn: {
    width: common.getH(70),
    height: common.getH(30),
    borderColor: common.lineColor,
    borderWidth: 1,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: common.blackColor,
    fontSize: common.font12,
    alignSelf: 'center',
  },
})

export default class TKViewCheckAuthorize extends Component {
  constructor(props) {
    super(props)
    this.state = {
      googleAuth: undefined,
    }
  }

  getGoogleAuth() {
    fetch(`${api.API_ROOT}/1.0/app/user/getGoogleAuth`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{}',
      credentials: 'same-origin',
    })
      .then(e => e.json())
      .then((e) => {
        if (e && e.secret) {
          this.setState({
            googleAuth: false,
          })
        } else {
          this.setState({
            googleAuth: true,
          })
        }
      })
      .catch(() => {
        this.setState({
          googleAuth: false,
        })
      })
  }

  renderTitles = () => {
    const { titles, segmentValueChanged } = this.props
    return (
      <WithdrawAuthSelecionBar
        titles={titles}
        onPress={(e) => {
          if (segmentValueChanged) {
            segmentValueChanged(e)
          }
          if (e.index === 1) {
            this.getGoogleAuth()
          } else {
            this.setState({
              googleAuth: undefined,
            })
          }
        }}
        renderItem={this.renderContent}
      />
    )
  }

  renderSMSCode = () => {
    const { mobile, titles, smsCodePress, onChangeText, language } = this.props
    const index = titles.indexOf(transfer(language, 'AuthCode_SMS_code'))
    if (!mobile) {
      return (
        <View>
          <View style={styles.unbinkMobileContainer}>
            <Text
              style={styles.tip}
            >{transfer(language, 'auth_mobile_unbind')}</Text>
          </View>
          {this.renderBtns('auth_go_bind')}
        </View>
      )
    }
    return (
      <View>
        <View style={styles.mobileContainer}>
          <Text style={styles.mobileTip}>{transfer(language, 'AuthCode_mobile_tip')}</Text>
          <Text style={styles.mobile}>{mobile}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.mobileTip}>{transfer(language, 'AuthCode_sms_tip')}</Text>
          <View style={styles.inputInnerContainer}>
            <TextInput
              style={styles.textInput}
              maxLength={6}
              onChangeText={text => onChangeText({
                title: '',
                index,
              }, text)}
              underlineColorAndroid="transparent"
            />
            <TKCheckCodeBtn
              style={styles.codeContainer}
              titleStyle={styles.fetchCodeTitle}
              language={language}
              onPress={() => {
                if (smsCodePress) {
                  smsCodePress()
                }
              }}
            />
          </View>
        </View>
        {this.renderBtns('AuthCode_confirm')}
      </View>
    )
  }

  renderGoogleCode = () => {
    const { onChangeText, titles, language } = this.props
    const { googleAuth } = this.state
    const index = titles.indexOf(transfer(language, 'AuthCode_GV_code'))
    if (!googleAuth) {
      return (
        <View>
          <View style={styles.unbinkMobileContainer}>
            <Text
              style={styles.tip}
            >{transfer(language, 'auth_google_unbind')}</Text>
          </View>
          {this.renderBtns('auth_go_ok')}
        </View>
      )
    }
    return (
      <View>
        <View style={styles.googleCodeContainer}>
          <Text style={styles.mobileTip}>{transfer(language, 'AuthCode_GV_code')}</Text>
          <View style={styles.googleInputContainer}>
            <TextInput
              style={styles.textInput}
              maxLength={6}
              onChangeText={text => onChangeText({
                title: '',
                index,
              }, text)}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
        {this.renderBtns('AuthCode_confirm')}
      </View>
    )
  }

  renderBtns = (comfirmTitle) => {
    const { confirmPress, cancelPress, language } = this.props
    return (
      <View>
        <View style={styles.line} />
        <View style={styles.btnsContainer}>
          {
            comfirmTitle === 'auth_go_ok' ?
              <View /> :
              (<NextTouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={common.activeOpacity}
                onPress={cancelPress}
              >
                <Text style={styles.cancelBtnText}>{transfer(language, 'AuthCode_cancel')}</Text>
              </NextTouchableOpacity>)
          }
          <NextTouchableOpacity
            style={[styles.cancelBtn, {
              backgroundColor: common.btnTextColor,
              borderWidth: 0,
            }]}
            activeOpacity={common.activeOpacity}
            onPress={() => {
              if (comfirmTitle === 'auth_go_ok') {
                confirmPress(undefined)
              } else {
                confirmPress(comfirmTitle === 'auth_go_bind')
              }
            }}
          >
            <Text
              style={[styles.cancelBtnText, {
                color: 'white',
              }]}
            >{transfer(language, comfirmTitle)}</Text>
          </NextTouchableOpacity>
        </View>
      </View>
    )
  }

  renderContent = (segmentIndex) => {
    if (segmentIndex === 0) {
      return this.renderSMSCode()
    }
    return this.renderGoogleCode()
  }

  render() {
    return (
      <NextTouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={() => Keyboard.dismiss()}
      >
        {this.renderTitles()}
      </NextTouchableOpacity>
    )
  }
}
