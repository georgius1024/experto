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
  publicationCameraAdd: actionFactory(consts.PUBLICATION_CAMERA_ADD),
  publicationCameraRemove: actionFactory(consts.PUBLICATION_CAMERA_REMOVE),
  publicationScreenAdd: actionFactory(consts.PUBLICATION_SCREEN_ADD),
  publicationScreenRemove: actionFactory(consts.PUBLICATION_SCREEN_REMOVE),
  publicationRemoveAll: actionFactory(consts.PUBLICATION_REMOVE_ALL),
  subscriptionAdd: actionFactory(consts.SUBSCRIPTION_ADD),
  subscriptionRemove: actionFactory(consts.SUBSCRIPTION_REMOVE),
  subscriptionsRemoveAll: actionFactory(consts.SUBSCRIPTIONS_REMOVE_ALL),
  subscriptionsUpdateAll: actionFactory(consts.SUBSCRIPTIONS_UPDATE_ALL),
  cameraAudioEnable: actionFactory(consts.CAMERA_AUDIO_ENABLE),
  cameraAudioDisable: actionFactory(consts.CAMERA_AUDIO_DISABLE),
  cameraVideoEnable: actionFactory(consts.CAMERA_VIDEO_ENABLE),
  cameraVideoDisable: actionFactory(consts.CAMERA_VIDEO_DISABLE),
  screenVideoEnable: actionFactory(consts.SCREEN_VIDEO_ENABLE),
  screenVideoDisable: actionFactory(consts.SCREEN_VIDEO_DISABLE),
  userNameUpdate: actionFactory(consts.USERNAME_UPDATE),
  appointmentUpdate: actionFactory(consts.APPOINTMENT_UPDATE),
  controlSocketUpdate: actionFactory(consts.CONTROL_SOCKET_UPDATE)
}

export default actions
