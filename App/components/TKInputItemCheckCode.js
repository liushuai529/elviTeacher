import React, { Component } from 'react'
import TKInputItem from './TKInputItem'
import TKCheckCodeBtn from './TKCheckCodeBtn'

class TKInputItemCheckCode extends Component {
  state = {
    checkCode: '验证码',
  }

  onChangeText = (text) => {
    if (this.props.onTextChanged) {
      this.props.onChangeText(text)
    }
  }

  onChange = (e) => {
    if (this.props.onChange) {
      this.props.onChange(e)
    }
  }

  clear = () => {
    this.textInputCodeRef.clear()
  }

  renderCheckCodeBtn = () => (
    <TKCheckCodeBtn
      onPress={() => {
        if (this.props.onPressCheckCodeBtn) {
          this.props.onPressCheckCodeBtn()
        }
      }}
    />
  )

  render() {
    return (
      <TKInputItem
        ref={(e) => { this.textInputCodeRef = e }}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        placeholder={this.props.placeholder}
        keyboardType={this.props.keyboardType}
        maxLength={this.props.maxLenth}
        onChange={e => this.onChange(e)}
        onChangeText={text => this.onChangeText(text)}
        editable={this.props.editable}
        title={this.props.title}
        renderExtra={this.renderCheckCodeBtn}
      />
    )
  }
}

export default TKInputItemCheckCode
