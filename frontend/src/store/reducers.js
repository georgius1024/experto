import consts from './consts'
const reducers = {
  publicationsReducer(state = { camera: null, screen: null }, action) {
    switch (action.type) {
      case consts.PUBLICATION_CAMERA_ADD:
        return { ...state, camera: action.payload }
      case consts.PUBLICATION_CAMERA_REMOVE:
        return { ...state, camera: null }
      case consts.PUBLICATION_SCREEN_ADD:
        return { ...state, screen: action.payload }
      case consts.PUBLICATION_SCREEN_REMOVE:
        return { ...state, screen: null }
      case consts.PUBLICATION_REMOVE_ALL:
        return { camera: null, screen: null }
      default:
        return state
    }
  },
  subscriptionsReducer(state = [], action) {
    switch (action.type) {
      case consts.SUBSCRIPTION_ADD:
        return [...state.filter(subscription => subscription.channel !== action.payload.channel), action.payload]
      case consts.SUBSCRIPTION_REMOVE:
        return state.filter(subscription => subscription.channel !== action.payload)
      case consts.SUBSCRIPTIONS_REMOVE_ALL:
        return []
      case consts.SUBSCRIPTIONS_UPDATE_ALL:
        return action.payload
      default:
        return state
    }
  },
  cameraAudioReducer(state = true, action) {
    switch (action.type) {
      case consts.CAMERA_AUDIO_ENABLE:
        return true
      case consts.CAMERA_AUDIO_DISABLE:
        return false
      default:
        return state
    }
  },
  cameraVideoReducer(state = true, action) {
    switch (action.type) {
      case consts.CAMERA_VIDEO_ENABLE:
        return true
      case consts.CAMERA_VIDEO_DISABLE:
        return false
      default:
        return state
    }
  },
  screenVideoReducer(state = true, action) {
    switch (action.type) {
      case consts.SCREEN_VIDEO_ENABLE:
        return true
      case consts.SCREEN_VIDEO_DISABLE:
        return false
      default:
        return state
    }
  }
}

export default reducers
