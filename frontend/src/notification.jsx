/*
 Show alert message when Api throws error
*/

import { toast } from 'react-toastify'
import './notification.css'

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

export { toast, message, info, error, success, warning }
