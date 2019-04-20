/*
 Show alert message when Api throws error
*/

import { toast } from 'react-toastify'
import Api from './api'
import './notification.css'
toast.configure({
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false
})

function message(text) {
  toast.info(text)
}

function info(text) {
  toast.info(text)
}

function error(text) {
  toast.error(text)
}

function success(text) {
  toast.success(text)
}

function warning(text) {
  toast.warning(text)
}

Api.error$.subscribe(text => {
  error(String(text))
})

Api.message$.subscribe(text => {
  message(String(text))
})

export { toast, message, info, error, success, warning }
