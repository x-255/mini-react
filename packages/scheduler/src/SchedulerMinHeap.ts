export type Heap<T extends Node> = Array<T>

export interface Node {
  id: number
  sortIndex: number
}

export const peek = <T extends Node>(heap: Heap<T>): T | null =>
  heap.length === 0 ? null : heap[0]

export const push = <T extends Node>(heap: Heap<T>, node: T): void => {
  const len = heap.length
  heap.push(node)
  siftUp(heap, node, len)
}

export const pop = <T extends Node>(heap: Heap<T>): T | null => {
  const len = heap.length
  if (len === 0) return null

  const first = heap[0]
  const last = heap.pop()!

  if (first !== last) {
    heap[0] = last
    siftDown(heap, last, 0)
  }

  return first
}

export const siftUp = <T extends Node>(
  heap: Heap<T>,
  node: T,
  i: number
): void => {
  let index = i
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1
    const parent = heap[parentIndex]
    if (compare(parent, node) <= 0) {
      break
    }
    switchItems(heap, index, parentIndex)
    index = parentIndex
  }
}

export const siftDown = <T extends Node>(
  heap: Heap<T>,
  node: T,
  i: number
): void => {
  let index = i
  const len = heap.length
  const halfIndex = len >>> 1
  while (index < halfIndex) {
    const leftIndex = (index + 1) * 2 - 1
    const left = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const right = heap[rightIndex]

    if (compare(left, node) < 0) {
      if (rightIndex < len && compare(right, left) < 0) {
        switchItems(heap, index, rightIndex)
        index = rightIndex
      } else {
        switchItems(heap, index, leftIndex)
        index = leftIndex
      }
    } else if (rightIndex < len && compare(right, node) < 0) {
      switchItems(heap, index, rightIndex)
      index = rightIndex
    } else {
      return
    }
  }
}

const compare = <T extends Node>(a: T, b: T) => {
  const diffSort = a.sortIndex - b.sortIndex
  return diffSort !== 0 ? diffSort : a.id - b.id
}

const switchItems = (arr: any[], i: number, j: number) =>
  ([arr[i], arr[j]] = [arr[j], arr[i]])
