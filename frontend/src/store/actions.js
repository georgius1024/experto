import consts from './consts'

function actionFactory(type) {
  return function(payload) {
    return {
      type,
      payload
    }
  }
}
const actions = {
  publicationAdd: actionFactory(consts.PUBLICATION_ADD),
  publicationRemove: actionFactory(consts.PUBLICATION_REMOVE),
  subscriptionAdd: actionFactory(consts.SUBSCRIPTION_ADD),
  subscriptionRemove: actionFactory(consts.SUBSCRIPTION_REMOVE),
  subscriptionRemoveAll: actionFactory(consts.SUBSCRIPTION_REMOVE_ALL),
  subscriptionUpdateAll: actionFactory(consts.SUBSCRIPTION_UPDATE_ALL),
  audioEnable: actionFactory(consts.AUDIO_ENABLE),
  audioDisable: actionFactory(consts.AUDIO_DISABLE),
  videoEnable: actionFactory(consts.VIDEO_ENABLE),
  videoDisable: actionFactory(consts.VIDEO_DISABLE),
  userNameUpdate: actionFactory(consts.USERNAME_UPDATE),
  appointmentUpdate: actionFactory(consts.APPOINTMENT_UPDATE),
  controlSocketUpdate: actionFactory(consts.CONTROL_SOCKET_UPDATE)
}

export default actions
