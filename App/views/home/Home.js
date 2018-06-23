import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  AppState,
  StatusBar,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native'
import equal from 'deep-equal'
import HotUpdate from 'rn-hotupdate-d3j'
import SplashScreen from 'react-native-splash-screen'
import {
  common,
} from '../../constants/common'
import HomeMarket from './HomeMarket'
import HomeSwiper from './HomeSwiper'
import TKButton from '../../components/TKButton'
import actions from '../../actions/index'
import schemas from '../../schemas/index'
import * as exchange from '../../actions/exchange'
import cache from '../../utils/cache'
import packageJson from '../../../package.json'
import transfer from '../../localization/utils'

global.Buffer = require('buffer').Buffer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: common.bgColor,
  },
})

class Home extends Component {
  constructor(props) {
    super(props)
    props.navigation.addListener('didFocus', () => {
      cache.setObject('currentComponentVisible', 'Home')
    })
  }

  componentDidMount() {
    setTimeout(() => {
      SplashScreen.hide()
    }, 200)
    cache.setObject('currentComponentVisible', 'Home')
    this.refreshData()
    const { dispatch } = this.props
    this.timeId = setInterval(() => {
      const page = cache.getObject('currentComponentVisible')
      if (page === 'Home' || page === 'Deal') {
        dispatch(actions.requestMarket())
      }
    }, common.refreshIntervalTime)

    // this.checkUpdate()

    AppState.addEventListener('change',
      nextAppState => this._handleAppStateChange(nextAppState))
  }

  componentWillReceiveProps(props) {
    const { market, dispatch } = this.props
    const { selectedPair } = props
    for (let i = 0; i < market.length; i++) {
      const item = market[i]
      if (item.currency.id === selectedPair.currency.id
        && item.goods.id === selectedPair.goods.id) {
        if (item !== selectedPair) {
          dispatch(exchange.updatePair(item))
        }
        break
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.language !== this.props.language) {
      return true
    }
    if (nextProps.market.length && this.props.market.length) {
      return !equal(nextProps.market, this.props.market)
    }
    return true
  }

  componentWillUnmount() {
    AppState.removeEventListener('change',
      nextAppState => this._handleAppStateChange(nextAppState))
    if (this.timeId) {
      clearInterval(this.timeId)
      this.timeId = null
    }
  }

  _handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      this.refreshData()
    }
  }

  checkUpdate() {
    const currentVersion = packageJson.jsVersion
    HotUpdate.setValueToUserStand(currentVersion, 'build', () => { })
    const url = `http://192.168.1.165:8989/update/${currentVersion}/${common.IsIOS ? 'ios' : 'android'}`
    fetch(url)
      .then(r => r.json())
      .then((r) => {
        if (r.version.toString() !== currentVersion.toString()) {
          const options = {
            zipPath: r.url,
            isAbort: false,
          }
          HotUpdate.downLoadBundleZipWithOption(options, () => {
            const { language } = this.props
            Alert.alert(
              transfer(language, 'home_receiveNewVersion'),
              '',
              [
                {
                  text: transfer(language, 'home_updateNow'),
                  onPress: () => HotUpdate.killApp(),
                },
                {
                  text: transfer(language, 'home_updateCancel'),
                  onPress: () => {},
                },
              ],
            )
          })
        }
      })
      .catch(() => { })
  }

  refreshData() {
    const { dispatch } = this.props
    dispatch(actions.requestBanners(schemas.findBanners()))
    dispatch(actions.requestAnnouncements(schemas.findAnnouncement()))
    dispatch(actions.requestMarket())
  }

  marketPress(rd) {
    const { navigation, dispatch } = this.props
    dispatch(exchange.updatePair(rd))
    navigation.navigate('Deal')
  }

  menuBtnPress = (i) => {
    const { navigation, user, language } = this.props
    const navigateKeys = ['Recharge', 'Withdraw', 'Orders', 'Orders']
    if (!user) {
      navigation.navigate('LoginStack')
    } else if (i === 2) {
      navigation.navigate('Orders', {
        title: transfer(language, 'home_currentDelegate'),
      })
    } else if (i === 3) {
      navigation.navigate('Orders', {
        title: transfer(language, 'home_historyDelegate'),
      })
    } else {
      navigation.navigate(navigateKeys[i])
    }
  }

  renderMenuBtns = () => {
    const { language } = this.props
    const btnTitles = [
      transfer(language, 'home_deposit'),
      transfer(language, 'home_withdrawal'),
      transfer(language, 'home_currentDelegate'),
      transfer(language, 'home_historyDelegate'),
    ]
    const menuBtns = []
    const icons = [
      require('../../assets/recharge.png'),
      require('../../assets/recharge2.png'),
      require('../../assets/currentDelegate.png'),
      require('../../assets/history_delegate.png'),
    ]
    for (let i = 0; i < btnTitles.length; i++) {
      menuBtns.push(
        <TKButton
          key={i}
          target="global"
          titleStyle={{ color: common.textColor }}
          theme={'home-balance'}
          caption={btnTitles[i]}
          icon={icons[i]}
          onPress={() => this.menuBtnPress(i)}
        />,
      )
    }
    return (
      <View style={{ flexDirection: 'row' }}>
        {menuBtns}
      </View>
    )
  }

  renderRefreshControl = () => (
    <RefreshControl
      onRefresh={() => this.refreshData()}
      refreshing={false}
      colors={[common.textColor]}
      progressBackgroundColor={common.navBgColor}
      progressViewOffset={0}
      tintColor={common.textColor}
    />
  )

  render() {
    const { announcements, banners, market, navigation, language } = this.props

    return (
      <View style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <ScrollView
          refreshControl={this.renderRefreshControl()}
          showsVerticalScrollIndicator={false}
        >
          <HomeSwiper
            banners={banners}
            announcements={announcements}
            onPress={(e) => {
              navigation.navigate(e.type, { element: e.element })
            }}
          />

          {this.renderMenuBtns()}

          <HomeMarket
            data={market}
            language={language}
            onPress={rd => this.marketPress(rd)}
          />
        </ScrollView>
      </View>
    )
  }
}

function mapStateToProps(store) {
  return {
    ...store.home,
    selectedPair: store.exchange.selectedPair,
    user: store.user.user,
    language: store.system.language,
  }
}

export default connect(
  mapStateToProps,
)(Home)
