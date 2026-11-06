'use strict'

const test = require('brittle')
const { promiseSleep: sleep } = require('@bitfinex/lib-js-util-promise')
const { TaskPriorityQueue } = require('../')

const job = async (mts, i, arr) => {
  await sleep(mts)
  arr.push(i)
  return i
}

test('pushTask - should process promise and return result', { timeout: 7000 }, async (t) => {
  const tq = new TaskPriorityQueue()
  const res = await tq.pushTask(async () => {
    await sleep(500)
    return 123
  }, 2)

  t.is(res, 123)
})

test('pushTask - should work with non async functions', { timeout: 7000 }, async (t) => {
  const tq = new TaskPriorityQueue()
  const res = await tq.pushTask(() => 123, 2)

  t.is(res, 123)
})

test('pushTask - should work process items according to concurrency', { timeout: 7000 }, async (t) => {
  const tq = new TaskPriorityQueue()

  const promises = []
  const process = []
  promises.push(tq.pushTask(() => job(500, 1, process), 2))
  promises.push(tq.pushTask(() => job(200, 2, process), 2))
  promises.push(tq.pushTask(() => job(700, 3, process), 2))
  promises.push(tq.pushTask(() => job(300, 4, process), 2))
  const res = await Promise.all(promises)

  t.alike(res, [1, 2, 3, 4])
  t.alike(process, [1, 2, 3, 4])
})

test('pushTask - should support parallel processing as well', { timeout: 10000 }, async (t) => {
  const tq = new TaskPriorityQueue(3)

  const promises = []
  const process = []

  promises.push(tq.pushTask(() => job(3000, 1, process), 2))
  promises.push(tq.pushTask(() => job(5000, 2, process), 2))
  promises.push(tq.pushTask(() => job(4000, 3, process), 2))
  promises.push(tq.pushTask(() => job(1000, 4, process), 2))
  const res = await Promise.all(promises)

  t.alike(res, [1, 2, 3, 4])
  t.alike(process, [1, 3, 4, 2])
})

test('pushTask - should handle tasks based on priority according to concurrency', { timeout: 20000 }, async (t) => {
  const tq = new TaskPriorityQueue()

  const promises = []
  const process = []

  promises.push(tq.pushTask(() => job(3000, 1, process), 2))
  promises.push(tq.pushTask(() => job(4000, 2, process), 1))
  promises.push(tq.pushTask(() => job(2000, 3, process), 2))
  promises.push(tq.pushTask(() => job(1000, 4, process), 1))
  const res = await Promise.all(promises)

  t.alike(res, [1, 2, 3, 4])
  t.alike(process, [2, 4, 1, 3])
})

test('pushTask - should handle tasks based on priority in parallel as well', { timeout: 20000 }, async (t) => {
  const tq = new TaskPriorityQueue(2)

  const promises = []
  const process = []

  promises.push(tq.pushTask(() => job(2000, 1, process), 2))
  promises.push(tq.pushTask(() => job(4000, 2, process), 1))
  promises.push(tq.pushTask(() => job(2000, 3, process), 3))
  promises.push(tq.pushTask(() => job(3000, 4, process), 1))
  const res = await Promise.all(promises)

  t.alike(res, [1, 2, 3, 4])
  t.alike(process, [4, 2, 1, 3])
})
