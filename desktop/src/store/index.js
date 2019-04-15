import { compose, combineReducers, createStore } from 'redux'
import reducers from './reducers'
import persistState from 'redux-localstorage'

const mainReducer = combineReducers({
  registration: reducers.registrationReducer,
  publications: reducers.publicationsReducer,
  subscriptions: reducers.subscriptionsReducer,
  cameraAudio: reducers.cameraAudioReducer,
  cameraVideo: reducers.cameraVideoReducer,
  screenVideo: reducers.screenVideoReducer
})

const enhancer = compose(persistState())

const store = createStore(mainReducer, enhancer)

export default store
