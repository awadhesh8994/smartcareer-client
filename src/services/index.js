import api from './axiosInstance'

// ── Auth Service ──────────────────────────────────────────────────
export const authService = {
  login:         (data)  => api.post('/auth/login', data),
  register:      (data)  => api.post('/auth/register', data),
  getMe:         ()      => api.get('/auth/me'),
  forgotPassword:(email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
}

// ── User Service ──────────────────────────────────────────────────
export const userService = {
  getProfile:   ()       => api.get('/users/profile'),
  updateProfile:(data)   => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStats:     ()       => api.get('/users/stats'),
  deleteAccount:()       => api.delete('/users/account'),
}

// ── Assessment Service ────────────────────────────────────────────
export const assessmentService = {
  start:   (domain)                         => api.post('/assessments/start', { domain }),
  submit:  (id, answers, timeTakenMinutes)  => api.post(`/assessments/submit/${id}`, { answers, timeTakenMinutes }),
  history: ()                               => api.get('/assessments/history'),
  getById: (id)                             => api.get(`/assessments/${id}`),
}

// ── Roadmap Service ───────────────────────────────────────────────
export const roadmapService = {
  generate:         (targetRole)  => api.post('/roadmaps/generate', { targetRole }),
  get:              ()            => api.get('/roadmaps'),
  updateMilestone:  (milestoneId, data) => api.patch(`/roadmaps/milestone/${milestoneId}`, data),
  delete:           (id)          => api.delete(`/roadmaps/${id}`),
}

// ── Learning Service ──────────────────────────────────────────────
export const learningService = {
  getPlan:         ()     => api.get('/learning'),
  generateStudyPlan:(data) => api.post('/learning/study-plan', data),
  addBookmark:     (data)  => api.post('/learning/bookmarks', data),
  removeBookmark:  (id)    => api.delete(`/learning/bookmarks/${id}`),
  addPlaylist:     (data)  => api.post('/learning/playlists', data),
  updateTopic:     (id, data) => api.patch(`/learning/topics/${id}`, data),
  markDailyGoal:   (planId, day) => api.patch(`/learning/daily-goal/${planId}/${day}`),
  updateStreak:    ()      => api.post('/learning/streak'),
}

// ── Resume Service ────────────────────────────────────────────────
export const resumeService = {
  create:       (data)  => api.post('/resumes', data),
  getAll:       ()      => api.get('/resumes'),
  getById:      (id)    => api.get(`/resumes/${id}`),
  update:       (id, data) => api.put(`/resumes/${id}`, data),
  delete:       (id)    => api.delete(`/resumes/${id}`),
  checkATS:     (id, jobDescription) => api.post(`/resumes/${id}/ats-score`, { jobDescription }),
  improveBullet:(bullet, role) => api.post('/resumes/improve-bullet', { bullet, role }),
  exportPdf:    (id, pdfUrl) => api.get(`/resumes/${id}/export-pdf`, { pdfUrl }),
  uploadParse:  (formData) => api.post('/resumes/upload-parse', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Chat Service ──────────────────────────────────────────────────
export const chatService = {
  sendMessage:  (message) => api.post('/chat/message', { message }),
  getHistory:   ()        => api.get('/chat/history'),
  clearHistory: ()        => api.delete('/chat/history'),
}

// ── Network Service ───────────────────────────────────────────────
export const networkService = {
  getMentors:        (domain)  => api.get('/network/mentors', { params: { domain } }),
  sendMentorRequest: (data)    => api.post('/network/mentor-request', data),
  respondToRequest:  (id, data) => api.patch(`/network/mentor-request/${id}`, data),
  getMyMentors:      ()        => api.get('/network/my-mentors'),
  getMyStudents:     ()        => api.get('/network/my-students'),
  getForumPosts:     (params)  => api.get('/network/forum', { params }),
  createForumPost:   (data)    => api.post('/network/forum', data),
  replyToPost:       (id, content) => api.post(`/network/forum/${id}/reply`, { content }),
  likePost:          (id)      => api.post(`/network/forum/${id}/like`),
  getLeaderboard:    ()        => api.get('/network/leaderboard'),
}

// ── Notification Service ──────────────────────────────────────────
export const notifService = {
  getAll:    ()   => api.get('/notifications'),
  markRead:  (id) => api.patch(`/notifications/${id}/read`),
  markAllRead:()  => api.patch('/notifications/read-all'),
  delete:    (id) => api.delete(`/notifications/${id}`),
}

// ── Admin Service ─────────────────────────────────────────────────
export const adminService = {
  getUsers:       (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser:     (id)     => api.delete(`/admin/users/${id}`),
  getStats:       ()       => api.get('/admin/stats'),
  getQuestions:   (params) => api.get('/admin/questions', { params }),
  addQuestion:    (data)   => api.post('/admin/questions', data),
  deleteQuestion: (id)     => api.delete(`/admin/questions/${id}`),
  getForumPosts:  ()       => api.get('/admin/forum'),
  deleteForumPost:(id)     => api.delete(`/admin/forum/${id}`),
}

// ── Jobs Service ──────────────────────────────────────────────────
export const jobsService = {
  getAll:            (params) => api.get('/jobs', { params }),
  getMatched:        ()       => api.get('/jobs/matched'),
  getById:           (id)     => api.get(`/jobs/${id}`),
  apply:             (id, data) => api.post(`/jobs/${id}/apply`, data),
  save:              (id)     => api.post(`/jobs/${id}/save`),
  getApplications:   ()       => api.get('/jobs/applications'),
  updateApplication: (id, data) => api.post(`/jobs/applications/${id}`, data),
  deleteApplication: (id)     => api.delete(`/jobs/applications/${id}`),
}

// ── Recruiter Service ─────────────────────────────────────────────
export const recruiterService = {
  setup:               (data)  => api.post('/recruiter/setup', data),
  getProfile:          ()      => api.get('/recruiter/profile'),
  getDashboard:        ()      => api.get('/recruiter/dashboard'),
  postJob:             (data)  => api.post('/recruiter/jobs', data),
  getJobs:             ()      => api.get('/recruiter/jobs'),
  updateJob:           (id, data) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob:           (id)    => api.delete(`/recruiter/jobs/${id}`),
  getCandidates:       (jobId) => api.get(`/recruiter/jobs/${jobId}/candidates`),
  updateCandidateStatus: (id, status) => api.patch(`/recruiter/applications/${id}`, { status }),
}

// ── Interview Service ─────────────────────────────────────────────
export const interviewService = {
  start:    (data)       => api.post('/interviews/start', data),
  answer:   (id, data)   => api.post(`/interviews/${id}/answer`, data),
  complete: (id)         => api.post(`/interviews/${id}/complete`),
  history:  ()           => api.get('/interviews/history'),
  getById:  (id)         => api.get(`/interviews/${id}`),
}
