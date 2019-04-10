import { Subject } from 'rxjs'
class ObservableSocket {
  constructor(url) {
    this.url = url
    this.webSocket = null
    this.error$ = new Subject()
    this.close$ = new Subject()
    this.open$ = new Subject()
    this.message$ = new Subject()
    this.reconnect = false
    this.reconnectTimer = null
    this.reconnectInterval = 1000 * 10
  }

  connect() {
    console.trace()
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer)
    }
    this.webSocket = new WebSocket(this.url)
    this.webSocket.onopen = () => {
      this.open$.next(this.webSocket)
    }

    this.webSocket.onmessage = ({ data: event }) => {
      try {
        this.message$.next(JSON.parse(event))
      } catch (error) {
        this.message$.next(event)
      }
    }

    this.webSocket.onclose = () => {
      this.close$.next(this.webSocket)
      if (this.reconnect) {
        this.reconnectTimer = setInterval(() => {
          this.connect()
        }, this.reconnectInterval)
      }
    }

    this.webSocket.onerror = error => {
      this.error$.next(error, this.webSocket)
      this.webSocket.onclose = undefined
      this.webSocket.close()
    }
  }

  online() {
    return this.webSocket && this.webSocket.readyState === 1
  }

  disconnect() {
    this.reconnect = false
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer)
    }
    this.webSocket.close()
  }

  sendRaw(payload) {
    this.webSocket.send(payload)
  }

  send(payload) {
    this.sendRaw(JSON.stringify(payload))
  }

  sendMessage(id, payload) {
    this.sendRaw(JSON.stringify({ id, ...payload }))
  }

  sendMessageInChannel(id, channel, payload) {
    this.sendRaw(JSON.stringify({ id, channel, ...payload }))
  }
}

export default ObservableSocket
