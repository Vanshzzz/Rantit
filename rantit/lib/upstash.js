import { Redis } from '@upstash/redis'

const getRedis = () => Redis.fromEnv()

export async function getVoteCount(rantId) {
  try {
    const count = await getRedis().get(`votes:${rantId}`)
    return Number(count) || 0
  } catch { return 0 }
}

export async function getUserVote(rantId, userId) {
  try {
    const vote = await getRedis().get(`vote:${rantId}:${userId}`)
    return vote || null
  } catch { return null }
}

export async function castVote(rantId, userId, direction) {
  try {
    const redis = getRedis()
    const voteKey  = `vote:${rantId}:${userId}`
    const countKey = `votes:${rantId}`
    const existing = await redis.get(voteKey)

    let delta = 0
    if (existing === direction) {
      await redis.del(voteKey)
      delta = direction === 'up' ? -1 : 1
      direction = null
    } else {
      if (existing === 'up')   delta -= 1
      if (existing === 'down') delta += 1
      delta += direction === 'up' ? 1 : -1
      await redis.set(voteKey, direction)
    }

    const newCount = await redis.incrby(countKey, delta)
    return { newCount, direction }
  } catch (e) {
    console.error('castVote error:', e)
    return { newCount: 0, direction: null }
  }
}

export async function getBulkVoteCounts(rantIds) {
  try {
    if (!rantIds.length) return {}
    const redis = getRedis()
    const pipeline = redis.pipeline()
    rantIds.forEach(id => pipeline.get(`votes:${id}`))
    const results = await pipeline.exec()
    return Object.fromEntries(rantIds.map((id, i) => [id, Number(results[i]) || 0]))
  } catch { return {} }
}
