import React, { Component } from 'react'
import {
  Image,
  WebView,
  TouchableOpacity,
} from 'react-native'
import {
  common,
} from '../../constants/common'

export default class Banner extends Component {
  static navigationOptions(props) {
    return {
      headerTitle: '活动',
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
          <TouchableOpacity
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
              source={require('../../assets/arrow_left_left.png')}
            />
          </TouchableOpacity>
        ),
    }
  }
  componentDidMount() { }

  render() {
    const { navigation } = this.props
    const uri = navigation.state.params.element.hyperlink
    return (
      <WebView
        source={{ uri }}
      />
    )
  }
}
