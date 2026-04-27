import client from './client'

export const register = (data) =>
  client.post('/api/users/register', data)

export const login = (data) =>
  client.post('/api/users/login', data)

export const getMe = () =>
  client.get('/api/users/me')