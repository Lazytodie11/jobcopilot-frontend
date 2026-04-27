import client from './client'

export const analyzeMatch = (resumeId, jobPostId) =>
  client.post('/api/analysis/match', { resumeId, jobPostId })

export const generateCoverLetter = (resumeId, jobPostId, extraContext) =>
  client.post('/api/analysis/cover-letter', { resumeId, jobPostId, extraContext })

export const generateMockInterview = (resumeId, jobPostId, focusArea) =>
  client.post('/api/analysis/mock-interview', { resumeId, jobPostId, focusArea })

export const generateSelfIntro = (resumeId, jobPostId) =>
  client.post('/api/analysis/self-intro', { resumeId, jobPostId })