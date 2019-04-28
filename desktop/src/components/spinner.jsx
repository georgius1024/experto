/*
 Show transparent layer with wait cursor
*/
import React, { useEffect, useState } from 'react'
import Api from '../api'
import styles from './spinner.module.scss'

function LoadingComponent(props) {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const subscription = Api.busy$.subscribe(busy => {
      setLoading(busy)
      if (busy) {
        setTimeout(() => {
          setLoading(false)
        }, 5000)
      }
    })
    return function cleanup() {
      subscription.unsubscrube()
    }
  }, [])
  return loading && <div className={styles.loading} />
}
export default LoadingComponent
