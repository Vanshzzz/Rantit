import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

export async function signUp(email, password) {
  return await supabase.auth.signUp({ email, password })
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function createProfile(userId, username) {
  return await supabase.from('profiles').insert({ id: userId, username }).select().single()
}

export async function getProfile(userId) {
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function usernameExists(username) {
  const { data } = await supabase.from('profiles').select('username').eq('username', username).single()
  return !!data
}

export async function getRants({ tag, sort = 'hot', page = 0, limit = 20 } = {}) {
  let query = supabase
    .from('rants')
    .select('*, profiles(username)')
    .range(page * limit, (page + 1) * limit - 1)

  if (tag && tag !== 'All') query = query.eq('tag', tag)
  if (sort === 'new')  query = query.order('created_at', { ascending: false })
  if (sort === 'hot')  query = query.order('upvotes', { ascending: false })
  if (sort === 'rage') query = query.order('rage', { ascending: false })

  return await query
}

export async function getRant(id) {
  return await supabase.from('rants').select('*, profiles(username)').eq('id', id).single()
}

export async function createRant({ userId, username, title, body, tag, rage }) {
  return await supabase
    .from('rants')
    .insert({ user_id: userId, username, title, body, tag, rage, upvotes: 1 })
    .select()
    .single()
}

export async function getComments(rantId) {
  return await supabase
    .from('comments')
    .select('*, profiles(username)')
    .eq('rant_id', rantId)
    .order('created_at', { ascending: true })
}

export async function createComment({ rantId, userId, username, body }) {
  const result = await supabase
    .from('comments')
    .insert({ rant_id: rantId, user_id: userId, username, body })
    .select()
    .single()
  await supabase.rpc('increment_comments', { rant_id: rantId })
  return result
}
