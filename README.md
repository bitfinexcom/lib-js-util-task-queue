# lib-js-util-task-queue

The lib supports the following task queues:
- `TaskQueue` - FIFO task queue
- `TaskPriorityQueue` - Priority task queue

## Installing

```console
npm install --save https://github.com/bitfinexcom/lib-js-util-task-queue.git
```

## Testing

```console
npm run test
```

## Usage

```javascript
const { TaskQueue } = require('@bitfinex/lib-js-util-task-queue')

const job = async (mts, i, arr) => {
  await new Promise((resolve) => {
    setTimeout(resolve, mts)
  })
  arr.push(i)
  return i
}

const main = async () => {
  const concurrency = 3
  const tq = new TaskQueue(concurrency)

  const promises = []
  const data = []

  promises.push(tq.pushTask(() => job(3000, 1, data)))
  promises.push(tq.pushTask(() => job(5000, 2, data)))
  promises.push(tq.pushTask(() => job(4000, 3, data)))
  promises.push(tq.pushTask(() => job(1000, 4, data)))
  const res = await Promise.all(promises)

  console.log(res) // [1, 2, 3, 4]
  console.log(data) // [1, 3, 4, 2]
}

main()
```

## Authors
- vigan.abd
