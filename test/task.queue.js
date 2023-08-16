'use strict'

/* eslint-env mocha */

const assert = require('assert')
const { promiseSleep: sleep } = require('@bitfinex/lib-js-util-promise')
const { TaskQueue } = require('../')

describe('TaskQueue tests', () => {
  const job = async (mts, i, arr) => {
    await sleep(mts)
    arr.push(i)
    return i
  }

  it('pushTask - should process promise and return result', async () => {
    const tq = new TaskQueue()
    const res = await tq.pushTask(async () => {
      await sleep(500)
      return 123
    })

    assert.strictEqual(res, 123)
  })

  it('pushTask - should work with non async functions', async () => {
    const tq = new TaskQueue()
    const res = await tq.pushTask(() => 123)

    assert.strictEqual(res, 123)
  })

  it('pushTask - should work process items according to concurrency', async () => {
    const tq = new TaskQueue()

    const promises = []
    const process = []
    promises.push(tq.pushTask(() => job(500, 1, process)))
    promises.push(tq.pushTask(() => job(200, 2, process)))
    promises.push(tq.pushTask(() => job(700, 3, process)))
    promises.push(tq.pushTask(() => job(300, 4, process)))
    const res = await Promise.all(promises)

    assert.deepStrictEqual(res, [1, 2, 3, 4])
    assert.deepStrictEqual(process, [1, 2, 3, 4])
  })

  it('pushTask - should support parallel processing as well', async () => {
    const tq = new TaskQueue(3)

    const promises = []
    const process = []

    promises.push(tq.pushTask(() => job(3000, 1, process)))
    promises.push(tq.pushTask(() => job(5000, 2, process)))
    promises.push(tq.pushTask(() => job(4000, 3, process)))
    promises.push(tq.pushTask(() => job(1000, 4, process)))
    const res = await Promise.all(promises)

    assert.deepStrictEqual(res, [1, 2, 3, 4])
    assert.deepStrictEqual(process, [1, 3, 4, 2])
  }).timeout(10000)
}).timeout(7000)
