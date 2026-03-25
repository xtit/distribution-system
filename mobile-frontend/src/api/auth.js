import request from './request'

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 注册
export function register(data) {
  return request.post('/auth/register', data)
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/auth/me')
}

// 更新用户信息
export function updateProfile(data) {
  return request.put('/auth/profile', data)
}

// 修改密码
export function changePassword(data) {
  return request.post('/auth/change-password', data)
}

// 上传头像
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  
  // 不设置 Content-Type，让 axios 自动处理（包含 boundary）
  return request.post('/auth/upload-avatar', formData, {
    // 注意：不要手动设置 Content-Type
    // axios 会自动设置为 multipart/form-data 并添加 boundary
  })
}

// 获取下级列表
export function getReferees(params) {
  return request.get('/auth/referees', { params })
}

// 获取佣金记录
export function getCommissions(params) {
  return request.get('/auth/commissions', { params })
}

// 获取分销统计
export function getReferralStats() {
  return request.get('/auth/referral-stats')
}

// 获取下级订单统计
export function getRefereeOrderStats(userId) {
  return request.get(`/auth/referee/${userId}/order-stats`)
}
