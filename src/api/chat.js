import client from './client'

export const getMySessions = () =>
  client.get('/api/chat/sessions/me')

export const createSession = (resumeId, jobPostId) =>
  client.post('/api/chat/sessions', { resumeId, jobPostId })

export const getSession = (sessionId) =>
  client.get(`/api/chat/sessions/${sessionId}`)

export const sendMessage = (sessionId, content) =>
  client.post(`/api/chat/sessions/${sessionId}/messages`, { content })