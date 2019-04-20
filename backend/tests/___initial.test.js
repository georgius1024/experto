/**
 * Created by georgius on 29.08.18.
 */

'use strict'
require('dotenv').config()
process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED=0
process.env.APP_LISTEN_PORT=9999 // Не мешать работе dev-сервера
