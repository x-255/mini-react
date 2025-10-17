import { getCurrentTime } from 'shared/utils'
import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
  NoPriority,
  type PriorityLevel,
} from './SchedulerPriorities'
import { lowPriorityTimeout, maxSigned31BitInt, normalPriorityTimeout, userBlockingPriorityTimeout } from './SchedulerFeatureFlags'

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
let currentPriorityLevel: PriorityLevel = NoPriority

let startTime = -1
let frameInterval = 5

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
