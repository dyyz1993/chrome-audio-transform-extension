import { describe, it, expect } from 'vitest'
import { searchAwemeMediaById } from './douyin.adapter'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 读取 JSON 文件为对象
 */
function readJson(rel: string): any {
  const p = path.resolve(process.cwd(), rel)
  const txt = fs.readFileSync(p, 'utf-8')
  return JSON.parse(txt)
}

/**
 * 使用 detail.json 验证按 aweme_id 精确抽取音视频
 */
it('detail.json: 按 aweme_id 抽取音视频（字符串）', () => {
  const detail = readJson('test-data/detail.json')
  const idStr = '7578739759217747667'
  const r1 = searchAwemeMediaById([detail], idStr)
  expect(r1).toBeTruthy()
  expect(r1?.audio && typeof r1?.audio === 'string').toBe(true)
  expect(r1?.video && typeof r1?.video === 'string').toBe(true)
})

/**
 * 使用 aweme_list.json 验证按 aweme_id 精确抽取音视频
 */
it('aweme_list.json: 按 aweme_id 抽取音视频（列表结构）', () => {
  const list = readJson('test-data/aweme_list.json')
  const id = '7166582832951725315'
  const r = searchAwemeMediaById([list], id)
  expect(r).toBeTruthy()
  expect(r?.audio && typeof r?.audio === 'string').toBe(true)
  expect(r?.video && typeof r?.video === 'string').toBe(true)
})
