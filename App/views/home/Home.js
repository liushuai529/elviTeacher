import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  AppState,
  StatusBar,
  ScrollView,
  StyleSheet,
  RefreshControl,
  AsyncStorage,
  Linking,
} from 'react-native'
import equal from 'deep-equal'
import SplashScreen from 'react-native-splash-screen'
import {
  common,
  storeRead,
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
import * as api from '../../services/api'
import Alert from '../../components/Alert'
import { modifyLastPriceSort, modifyChangeSort, requestPairs, requestShowPairs } from '../../actions/home'
import { getDefaultLanguage } from '../../utils/languageHelper'
import * as system from '../../actions/system'
import Toast from 'teaset/components/Toast/Toast';
import { NavigationActions } from 'react-navigation'
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
      this.props.dispatch(modifyLastPriceSort('idle'))
      this.props.dispatch(modifyChangeSort('idle'))
      cache.removeObject('duration')
      this.props.dispatch(requestPairs())
    })
  }

  componentWillMount() {
    setTimeout(() => {
      this.checkUpdate(getDefaultLanguage())
    }, 1000)
  }

  componentDidMount() {
    setTimeout(() => {
      SplashScreen.hide()
    }, 200)
    this.configPair()
    cache.setObject('currentComponentVisible', 'Home')
    const { dispatch } = this.props
    this.isNeedAutoLogin(() => { dispatch(actions.sync()) })
    this.refreshData()
    this.timeId = setInterval(() => {
      const page = cache.getObject('currentComponentVisible')
      if (page === 'Home' || page === 'Deal') {
        dispatch(actions.requestMarket())
      }
    }, common.refreshIntervalTime)

    AppState.addEventListener('change',
      nextAppState => this._handleAppStateChange(nextAppState))
  }

  componentWillReceiveProps(props) {
    const { market, dispatch, requestPairStatus, requestShowPairStatus } = this.props
    const { selectedPair, requestPair } = props
    if (props.language !== this.props.language) {
      this.refreshData(props.language)
    }
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
    this.handleSync(props)
    if (props.requestPairStatus === 2 && requestPairStatus !== 1) {
      // 加载失败
      setTimeout(() => {
        dispatch(requestPairs())
      }, 2000)
    } else if (props.requestPairStatus === 1 && requestPairStatus !== 1) {
      common.setDefaultPair(requestPair)
      AsyncStorage.setItem('local_pair', JSON.stringify(requestPair), () => { })
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.language !== this.props.language) {
      return true
    }
    if (nextProps.lastPriceSortType !== this.props.lastPriceSortType ||
      nextProps.changeSortType !== this.props.changeSortType) {
      return true
    }
    if (!equal(nextProps.banners, this.props.banners)) {
      return true
    }
    if (!equal(nextProps.announcements, this.props.announcements)) {
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
      this.isNeedAutoLogin(() => { if(this.props.loggedIn) this.props.dispatch(actions.sync()) })
      this.refreshData()
    }
  }

  configPair() {
    const { dispatch } = this.props
    AsyncStorage.getItem('local_pair', (error, result) => {
      if (!error && result) {
        common.setDefaultPair(JSON.parse(result))
      }
      dispatch(requestPairs())
    })
  }

  handleSync = (nextProps) => {
    if (this.props.authorize.syncing && !nextProps.authorize.syncing) {
      const { syncSuccess, loggedIn } = nextProps.authorize
      if (syncSuccess) {
        this.syncSuccess(loggedIn)
      } else {
        this.syncFailed()
      }
    }
  }

  syncSuccess = (loggedIn) => {
    const { language } = this.props
    storeRead(common.user.string, (result) => {
      if (result) {
        const { dispatch } = this.props
        if(loggedIn){
          cache.setObject('isLoginIn', 'true')
          const user = JSON.parse(result)
          dispatch(actions.findUserUpdate(user))
          dispatch(actions.findUser(schemas.findUser(user.id)))
          dispatch(system.updateRemoteLanguage({lang: language}))
        } else{
          cache.removeObject('isLoginIn')
          dispatch(actions.clearLogin())
        }
      }
    })
  }

  syncFailed = () => {
    const { dispatch } = this.props
    // dispatch(actions.findUserUpdate(undefined))
    // dispatch(actions.clearAllReducer())
    dispatch(actions.findAssetListUpdate({
      asset: [],
      amountVisible: undefined,
    }))
  }

  isNeedAutoLogin = async (callBack) => {
    const preLoginTs = await AsyncStorage.getItem('lastLoginTs')
    if (preLoginTs) {
      const ts = new Date().getTime() - new Date(preLoginTs).getTime()
      if (ts > 15 * 24 * 60 * 60 * 1000) {
        this.syncFailed()
        return
      }
    }
    const isAutoLogin = await AsyncStorage.getItem('isAutoLogin')
    if (isAutoLogin === 'true') callBack()
  }

  checkUpdate(language) {
    this.checkIsNeedUpdate(({ isUpdate, version }) => {
      if (isUpdate) {
        const newVersion = transfer(language, 'home_receiveNewVersion')
        const availble = transfer(language, 'home_newVersionAvailble')
        Alert.alert(
          `${newVersion} V${version} ${availble}`,
          null,
          [
            {
              text: transfer(language, 'home_updateCancel'),
              onPress: () => { },
            },
            {
              text: transfer(language, 'home_updateNow'),
              onPress: () => {
                const url = `${api.API_ROOT}/landing.html`
                Linking.canOpenURL(url)
                  .then((e) => {
                    if (e) {
                      Linking.openURL(url)
                    }
                  })
              },
            },
          ])
      }
    })
  }

  checkIsNeedUpdate(callback) {
    const currentVersion = packageJson.jsVersion
    const platform = common.IsIOS ? 'ios' : 'android'
    const url = `${api.API_ROOT}/1.0/openapi/appupdate?device=${platform}&version=${currentVersion}`
    fetch(url)
      .then(r => r.json())
      .then((r) => {
        if (r) {
          callback({
            isUpdate: r.isUpdate,
            version: r.version,
          })
        }
      })
      .catch(() => { })
  }

  refreshData(lan) {
    const { dispatch, language } = this.props
    dispatch(actions.requestBanners(schemas.findBanners(lan || language)))
    dispatch(actions.requestAnnouncements())
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
      navigation.navigate('LoginStack', { transition: 'forVertical' })
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
            {...this.props}
            data={market}
            requestPair={this.props.requestPair}
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
    authorize: store.authorize,
    language: store.system.language,
    loggedIn: store.authorize.loggedIn,
  }
}

export default connect(
  mapStateToProps,
)(Home)
