/**
 * 进行中任务管理：避免重复并发
 */
const inflight = new Set<string>()

/**
 * 标记任务开始（返回是否成功标记）
 */
export function start(key: string): boolean {
  if (inflight.has(key)) return false
  inflight.add(key)
  return true
}

/**
 * 标记任务结束
 */
export function finish(key: string): void {
  inflight.delete(key)
}

/**
 * 查询任务是否进行中
 */
export function inFlight(key: string): boolean {
  return inflight.has(key)
}
