// 存储状态 数据
import {playMode} from 'common/js/config'
import {loadSearch, loadPlay} from 'common/js/cache'

const state = {
  singer: {},
  playing: false, // 播放|暂停
  fullScreen: false, // 全屏
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  musicList: {},
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay()
}

export default state
