const ws = require('ws')
const kurento = require('kurento-client')
var kurentoConnection = null
function getKurentoClient$(url) {
  if (kurentoConnection !== null) {
    return kurentoConnection
  }
  return new Promise((resolve, reject) => {
    kurento(url, (error, client) => {
      if (error) {
        return reject(`Could not find media server at address ${url}. Exiting with error ${error}`)
      } else {
        kurentoConnection = client
        return resolve(client)
      }
    })
  })
}

function createMediaPipeline$() {
  if (!kurentoConnection) {
    return Promise.reject('kurento connection not available')
  }
  return new Promise((resolve, reject) => {
    kurentoConnection.create('MediaPipeline', (error, pipeline) => {
      if (error) {
        return reject(`Could not create media pipeline object. Exiting with error ${error}`)
      } else {
        return resolve(pipeline)
      }
    })
  })
}

function createWebRtcEndpoint$(pipeline) {
  if (!pipeline) {
    return Promise.reject('pipeline not available')
  }
  return new Promise((resolve, reject) => {
    pipeline.create('WebRtcEndpoint', (error, webRtcEndpoint) => {
      if (error) {
        pipeline.release()
        return reject(`Could not create WebRtcEndpoint object. Exiting with error ${error}`)
      } else {
        return resolve(webRtcEndpoint)
      }
    })
  })
}

function connectMediaElements$(webRtcEndpoint1, webRtcEndpoint2, pipeline) {
  return new Promise((resolve, reject) => {
    webRtcEndpoint1.connect(webRtcEndpoint2, error => {
      if (error) {
        pipeline.release()
        return reject(`Could not connect WebRtcEndpoints. Exiting with error ${error}`)
      } else {
        return resolve()
      }
    })
  })
}

function setOutputBitrate$(endPoint, bitrate) {
  return new Promise((resolve, reject) => {
    endPoint.setOutputBitrate(bitrate, error => {
      if (error) {
        reject(error)
      }
      resolve(endPoint)
    })
  })
}

function createRecorderEndPoint$(pipeline, path) {
  return new Promise((resolve, reject) => {
    let started = Date.valueOf()
    let params = {
      uri: path + '/' + started + '.webm',
      mediaProfile: channel.indexOf('screen') >= 0 ? 'WEBM_VIDEO_ONLY' : 'WEBM'
    }

    pipeline.create(
      [
        {
          type: 'RecorderEndpoint',
          params: params
        }
      ],
      (error, elements) => {
        if (error) {
          reject(error)
        }
        elements[0].uri = params.uri
        elements[0].started = started
        resolve(elements[0])
      }
    )
  })
}

function connectRecorder$(endPoint, recorder) {
  return new Promise((resolve, reject) => {
    endPoint.connect(recorder, error => {
      if (error) {
        reject(error)
      }
      resolve(recorder)
    })
  })
}

function startRecording$(recorder) {
  return new Promise((resolve, reject) => {
    if (recorder) {
      recorder.record(error => {
        if (error) {
          reject(error)
        }
        resolve()
      })
    }
  })
}

function pauseRecording$(recorder) {
  return new Promise((resolve, reject) => {
    if (recorder) {
      recorder.pause(error => {
        if (error) {
          reject(error)
        }
        resolve()
      })
    }
  })
}

function stopRecording$(recorder) {
  return new Promise((resolve, reject) => {
    if (recorder) {
      recorder.stop(error => {
        if (error) {
          reject(error)
        }
        resolve()
      })
    }
  })
}

module.exports = {
  getKurentoClient$,
  createMediaPipeline$,
  createWebRtcEndpoint$,
  connectMediaElements$,
  setOutputBitrate$,
  createRecorderEndPoint$,
  connectRecorder$,
  startRecording$,
  pauseRecording$,
  stopRecording$
}
