import { peek, pop, push, type Heap, type Node } from '../src/SchedulerMinHeap'
import { describe, expect, it } from 'vitest'

let idCounter = 0
const createNode = (sortIndex: number): Node => ({ id: idCounter++, sortIndex })

describe('test min heap', () => {
  it('empty heap return null', () => {
    const tasks: Heap<Node> = []
    expect(peek(tasks)).toBe(null)
  })

  it('heap length === 1', () => {
    const tasks: Heap<Node> = [createNode(1)]
    expect(peek(tasks)?.sortIndex).toEqual(1)
  })

  it('heap length > 1', () => {
    const tasks: Heap<Node> = [createNode(1)]
    push(tasks, createNode(2))
    push(tasks, createNode(3))
    expect(peek(tasks)?.sortIndex).toEqual(1)
    push(tasks, createNode(0))
    expect(peek(tasks)?.sortIndex).toEqual(0)
    pop(tasks)
    expect(peek(tasks)?.sortIndex).toEqual(1)
  })
})
