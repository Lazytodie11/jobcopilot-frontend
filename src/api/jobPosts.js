import client from './client'

export const getMyJobPosts = () =>
  client.get('/api/job-posts/me')

export const createJobPost = (data) =>
  client.post('/api/job-posts/me', data)

export const createJobPostFromUrl = (url) =>
  client.post('/api/job-posts/me/parse-url', { url })

export const deleteJobPost = (id) =>
  client.delete(`/api/job-posts/me/${id}`)

export const getRecommended = (resumeId) =>
  client.get(`/api/job-posts/me/recommended?resumeId=${resumeId}`)