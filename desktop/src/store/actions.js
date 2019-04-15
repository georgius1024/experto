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
  register: actionFactory(consts.REGISTER),
  unregister: actionFactory(consts.UNREGISTER),
  refresh: actionFactory(consts.REFRESH),
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
}

export default actions
