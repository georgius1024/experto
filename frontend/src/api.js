import axios from 'axios'
import { Subject } from 'rxjs'
import { from } from 'rxjs'
import store from './store'
import actions from './store/actions'
import config from './config'
const Api = {
  http: axios,
  accessToken: '',
  refreshToken: '',
  refreshEndPoint: '',
  error$: new Subject(),
  response$: new Subject(),
  message$: new Subject(),
  busy$: new Subject(),
  originalRequest: {},
  setBaseUrl(url) {
    this.http.defaults.baseURL = url.substr(-1) === '/' ? url : url + '/'
  },
  setRefreshEndpoint(url) {
    this.refreshEndPoint = url
  },
  success(response) {
    this.busy$.next(false)
    if (response.data) {
      this.response$.next(response.data)
      if (response.data.message) {
        this.message$.next(response.data.message)
      }
      if (response.data.auth) {
        store.dispatch(actions.refresh(response.data.auth))
      }
    }
  },

  error(error) {
    this.busy$.next(false)
    let message = error.message || 'Общая ошибка'
    if (message === 'Network Error') {
      message = 'Ошибка сети'
    }
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message
      }
      if (error.response.status === 401) {
        this.retry()
      }
    } else if (error.code === 'ECONNREFUSED') {
      message = 'Пропала связь с сервером'
    }
    this.error$.next(error)
  },

  retry() {
    const state = store.getState()
    const refreshToken = state.registration.refreshToken
    if (!this.originalRequest._restoring && refreshToken) {
      this.originalRequest._restoring = true
      delete this.http.defaults.headers.common['Authorization']
      const refreshQuery = from(
        this.http({
          url: this.refreshEndPoint,
          method: 'post',
          data: {
            token: this.refreshToken
          }
        })
      )
      refreshQuery.subscribe({
        next: response => {
          if (response.data.auth) {
            store.dispatch(actions.refresh(response.data.auth))
          }
          const retryQuery = from(this.http(this.originalRequest))
          retryQuery.subscribe({
            next: response => this.success(response),
            error: error => this.error(error)
          })
        },
        error: error => this.error(error)
      })
    } else {
      this.clearAccessToken()
      this.clearRefreshToken()
    }
  },

  execute(request) {
    const state = store.getState()
    const accessToken = state.registration.accessToken
    if (accessToken) {
      this.http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken
    } else {
      delete this.http.defaults.headers.common['Authorization']
    }
    this.originalRequest = request
    this.busy$.next(true)
    const query = from(this.http(request))
    query.subscribe({
      next: response => this.success(response),
      error: error => this.error(error)
    })
    return query
  },

  get(url) {
    const request = {
      url,
      method: 'get'
    }
    return this.execute(request)
  },

  post(url, data) {
    const request = {
      url,
      data,
      method: 'post'
    }
    return this.execute(request)
  },

  put(url, data) {
    const request = {
      url,
      data,
      method: 'put'
    }
    return this.execute(request)
  },

  delete(url, data) {
    const request = {
      url,
      data,
      method: 'delete'
    }
    return Api.execute(request)
  }
}

//Api.setBaseUrl(config.apiEndPoint)
//Api.setRefreshEndpoint('auth/refresh')
export default Api
