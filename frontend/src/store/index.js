import { combineReducers, createStore } from 'redux'
import reducers from './reducers'

const mainReducer = combineReducers({
  publications: reducers.publicationsReducer,
  subscriptions: reducers.subscriptionsReducer,
  cameraAudio: reducers.cameraAudioReducer,
  cameraVideo: reducers.cameraVideoReducer,
  screenVideo: reducers.screenVideoReducer
})

const store = createStore(mainReducer)

export default store
