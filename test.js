'use strict'

const {promisify} = require('util')
const {test} = require('tap')
const Redis4_26_0 = require('ioredis-4.26.0')
const Redis4_27_0 = require('ioredis-4.27.0')

const sleep = promisify(setTimeout)

const libs = [
  {
    __constructor__: Redis4_26_0
  , name: 'ioredis 4.26.0'
  }
, {
    __constructor__: Redis4_27_0
  , name: 'ioredis 4.27.0'
  }
]

function filterStdio(handle) {
  if (handle === process.stdin) return false
  if (handle === process.stdout) return false
  if (handle === process.stderr) return false
  return true
}

test('client can shutdown cleanly', async (t) => {
  for (const lib of libs) {
    const Constructor = lib.__constructor__
    const name = lib.name
    t.test(`(${name})`, async (t) => {
      t.comment('Using %s', name)

      const before_handles = process._getActiveHandles().filter(filterStdio)
      t.comment(`Active handles before connecting: ${before_handles.length}`)

      const client = new Constructor({
        sentinels: [
          {
            host: 'persistent-redis-sentinel'
          , port: 26371
          }
        ]
      , name: 'ldrp'
      , enableReadyCheck: true
      , retryStrategy() {
          return 5000
        }
      , sentinelRetryStrategy() {
          return 5000
        }
      , lazyConnect: true
      , enableOfflineQueue: false
      })

      client.on('error', (err) => {
        console.log('client error', err)
      })

      client.on('ready', () => {
        console.log('client ready')
      })

      client.on('end', () => {
        console.log('client ended')
      })

      await client.connect()
      await client.quit()

      t.comment('sleeping so the handles can get cleaned up')
      await sleep(1000)

      const after_handles = process._getActiveHandles()
      const handles = after_handles.filter(filterStdio)
      t.comment(`Active handles after quiting: ${handles.length}`)

      t.equal(handles.length, 0, 'Connections were cleaned up')

      if (handles.length) {
        for (const handle of handles) {
          // if (handle.destroy) handle.destroy()
          if (handle.end) {
            console.log('ending stream')
            handle.end()
          }
          // if (handle.close) handle.close()
          console.log('Found handle', handle)
        }
      }
    })
  }
})

process.on('SIGINT', () => {
  process.exit()
})
