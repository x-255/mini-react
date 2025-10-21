import { getCurrentTime, isFn } from 'shared/utils'
import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
  NoPriority,
  type PriorityLevel,
} from './SchedulerPriorities'
import {
  lowPriorityTimeout,
  maxSigned31BitInt,
  normalPriorityTimeout,
  userBlockingPriorityTimeout,
} from './SchedulerFeatureFlags'
import { peek, pop, push } from './SchedulerMinHeap'

export interface Task {
  id: number
  callback: Callback | null
  priorityLevel: PriorityLevel
  startTime: number
  expirationTime: number
  sortIndex: number
}

type Callback = (arg: boolean) => Callback | null | void

const taskQueue: Task[] = []
let currentTask: Task | null = null
let currentPriorityLevel: PriorityLevel = NormalPriority
let startTime = -1
let frameInterval = 5
let taskIdCounter = 0
let isHostCallbackScheduled = false
let isPerformingWork = false
let isMessageLoopRunning = false

function scheduleCallback(priorityLevel: PriorityLevel, callback: Callback) {
  let timeout: number
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = -1
      break
    case UserBlockingPriority:
      timeout = userBlockingPriorityTimeout
      break
    case LowPriority:
      timeout = lowPriorityTimeout
      break
    case IdlePriority:
      timeout = maxSigned31BitInt
      break
    default:
      timeout = normalPriorityTimeout
  }

  const currentTime = getCurrentTime()
  const expirationTime = currentTime + timeout

  const task: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime: currentTime,
    expirationTime,
    sortIndex: expirationTime,
  }

  push(taskQueue, task)

  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true
    requestHostCallback()
  }
}

function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true
    schedulePerformWorkUtilDeadline()
  }
}

const channel = new MessageChannel()
const port = channel.port2
channel.port1.onmessage = performWorkUtilDeadline
function schedulePerformWorkUtilDeadline() {
  port.postMessage(null)
}

function performWorkUtilDeadline() {
  if (!isMessageLoopRunning) return

  const currentTime = getCurrentTime()
  startTime = currentTime
  let hasMoreWork = true
  try {
    hasMoreWork = flushWork(currentTime)
  } finally {
    if (hasMoreWork) {
      schedulePerformWorkUtilDeadline()
    } else {
      isMessageLoopRunning = false
    }
  }
}

function flushWork(initialTime: number) {
  isHostCallbackScheduled = false
  isPerformingWork = true
  const prevPriorityLevel = currentPriorityLevel
  try {
    return workLoop(initialTime)
  } finally {
    currentTask = null
    currentPriorityLevel = prevPriorityLevel
    isPerformingWork = false
  }
}

function workLoop(initialTime: number) {
  let currentTime = initialTime
  currentTask = peek(taskQueue)
  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) break

    const { callback, priorityLevel } = currentTask
    if (isFn(callback)) {
      currentTask.callback = null
      currentPriorityLevel = priorityLevel
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime
      const nextCallback = callback(didUserCallbackTimeout)
      if (isFn(nextCallback)) {
        currentTask.callback = nextCallback
        return true
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue)
        }
      }
    } else {
      pop(taskQueue)
    }

    currentTask = peek(taskQueue)
  }
  return currentTask !== null
}

function cancelCallback() {
  currentTask && (currentTask.callback = null)
}

function getCurrentPriorityLevel() {
  return currentPriorityLevel
}

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime
  return timeElapsed >= frameInterval
}

export {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
  scheduleCallback,
  cancelCallback,
  getCurrentPriorityLevel,
  shouldYieldToHost as shouldYield,
}
