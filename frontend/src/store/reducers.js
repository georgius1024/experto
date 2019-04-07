import consts from './consts'
const reducers = {
  publicationReducer(state = '', action) {
    switch (action.type) {
    case consts.PUBLICATION_ADD:
      return action.payload
    case consts.PUBLICATION_REMOVE:
      return ''
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
    case consts.SUBSCRIPTION_REMOVE_ALL:
      return []
    case consts.SUBSCRIPTION_UPDATE_ALL:
      return action.payload
    default:
      return state
    }
  },
  audioReducer(state = true, action) {
    switch (action.type) {
    case consts.AUDIO_ENABLE:
      return true
    case consts.AUDIO_DISABLE:
      return false
    default:
      return state
    }
  },
  videoReducer(state = true, action) {
    switch (action.type) {
    case consts.VIDEO_ENABLE:
      return true
    case consts.VIDEO_DISABLE:
      return false
    default:
      return state
    }
  },
  usernameReducer(state = '', action) {
    switch (action.type) {
    case consts.USERNAME_UPDATE:
      return action.payload
    default:
      return state
    }
  },
  appointmentReducer(state = {}, action) {
    switch (action.type) {
    case consts.APPOINTMENT_UPDATE:
      return action.payload
    default:
      return state
    }
  },
  controlSocketReducer(state = null, action) {
    switch (action.type) {
    case consts.CONTROL_SOCKET_UPDATE:
      return action.payload
    default:
      return state
    }
  }
}

export default reducers
