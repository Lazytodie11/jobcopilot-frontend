import client from './client'

export const getMyResumes = () =>
  client.get('/api/resumes/me')

export const uploadResume = (formData) =>
  client.post('/api/resumes/me/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteResume = (id) =>
  client.delete(`/api/resumes/me/${id}`)

export const embedResume = (id) =>
  client.post(`/api/resumes/me/${id}/embed`)