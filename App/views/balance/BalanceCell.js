import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
} from 'react-native'
import { common } from '../../constants/common'

export default class BalanceCell extends Component {
  componentDidMount() { }
  render() {
    return (
      <View
        style={{
          marginTop: common.margin10,
          marginLeft: common.margin10,
          marginRight: common.margin10,
          backgroundColor: common.borderColor,
          borderRadius: common.radius6,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: '30%',
          }}
        >
          <Image
            style={{
              marginLeft: common.margin15,
              height: common.w20,
              width: common.w20,
              alignSelf: 'center',
            }}
            source={this.props.leftImageSource}
          />
          <Text
            style={{
              marginLeft: common.margin10,
              fontSize: common.font14,
              color: common.textColor,
              alignSelf: 'center',
            }}
          >{this.props.title}</Text>
        </View>

        <Text
          style={{
            marginTop: common.margin15,
            marginBottom: common.margin15,
            paddingRight: common.margin15,
            fontSize: common.font14,
            color: common.textColor,
            width: '70%',
            alignSelf: 'center',
            textAlign: 'right',
          }}
        >{this.props.detail}</Text>
      </View>
    )
  }
}
