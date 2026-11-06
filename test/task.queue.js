'use strict'

const test = require('brittle')
const { promiseSleep: sleep } = require('@bitfinex/lib-js-util-promise')
const { TaskQueue } = require('../')

const job = async (mts, i, arr) => {
  await sleep(mts)
  arr.push(i)
  return i
}

test('pushTask - should process promise and return result', { timeout: 7000 }, async (t) => {
  const tq = new TaskQueue()
  const res = await tq.pushTask(async () => {
    await sleep(500)
    return 123
  })

  t.is(res, 123)
})

test('pushTask - should work with non async functions', { timeout: 7000 }, async (t) => {
  const tq = new TaskQueue()
  const res = await tq.pushTask(() => 123)

  t.is(res, 123)
})

test('pushTask - should work process items according to concurrency', { timeout: 7000 }, async (t) => {
  const tq = new TaskQueue()

  const promises = []
  const process = []
  promises.push(tq.pushTask(() => job(500, 1, process)))
  promises.push(tq.pushTask(() => job(200, 2, process)))
  promises.push(tq.pushTask(() => job(700, 3, process)))
  promises.push(tq.pushTask(() => job(300, 4, process)))
  const res = await Promise.all(promises)

  t.alike(res, [1, 2, 3, 4])
  t.alike(process, [1, 2, 3, 4])
})

test('pushTask - should support parallel processing as well', { timeout: 10000 }, async (t) => {
  const tq = new TaskQueue(3)

  const promises = []
  const process = []

  promises.push(tq.pushTask(() => job(3000, 1, process)))
  promises.push(tq.pushTask(() => job(5000, 2, process)))
  promises.push(tq.pushTask(() => job(4000, 3, process)))
  promises.push(tq.pushTask(() => job(1000, 4, process)))
  const res = await Promise.all(promises)

  t.alike(res, [1, 2, 3, 4])
  t.alike(process, [1, 3, 4, 2])
})
