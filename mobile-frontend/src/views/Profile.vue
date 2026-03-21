<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <van-image
          :src="getImageUrl(user?.avatarUrl) || 'https://via.placeholder.com/80'"
          width="60"
          height="60"
          round
        />
        <div class="user-detail">
          <div class="nickname">{{ user?.nickname || user?.username }}</div>
          <div class="referral-code">
            我的推荐码：{{ user?.referralCode }}
            <van-icon name="copy" @click="copyCode" />
          </div>
        </div>
      </div>
      <van-button size="small" plain @click="showQRCode">
        <van-icon name="qrcode" /> 分享二维码
      </van-button>
    </div>

    <!-- 分销统计 -->
    <div class="stats-card">
      <div class="stats-title">我的分销</div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ stats.directReferees || 0 }}</div>
          <div class="stat-label">直接下级</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.indirectReferees || 0 }}</div>
          <div class="stat-label">间接下级</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: #4caf50;">¥{{ stats.commissions?.paid || 0 }}</div>
          <div class="stat-label">已提现</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: #1989fa;">¥{{ stats.commissions?.confirmed || 0 }}</div>
          <div class="stat-label">可提现</div>
        </div>
      </div>
      <div class="stats-sub-grid">
        <div class="stat-sub-item">
          <span class="stat-sub-label">冻结中：</span>
          <span class="stat-sub-value" style="color: #ff5722;">¥{{ stats.commissions?.frozen || 0 }}</span>
        </div>
        <div class="stat-sub-item">
          <span class="stat-sub-label">待结算：</span>
          <span class="stat-sub-value" style="color: #ff9800;">¥{{ stats.commissions?.pending || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <van-cell-group inset>
      <van-cell title="我的下级" icon="friends-o" is-link @click="goToReferees" />
      <van-cell title="佣金记录" icon="gold-coin-o" is-link @click="goToCommissions" />
      <van-cell title="我的订单" icon="orders-o" is-link @click="goToOrders" />
      <van-cell title="账户余额" icon="balance-list-o" is-link>
        <template #right-icon>
          <span class="balance">¥{{ user?.balance || 0 }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 其他功能 -->
    <van-cell-group inset>
      <van-cell title="个人信息" icon="user-o" is-link @click="showEditProfile" />
      <van-cell title="联系客服" icon="service-o" is-link />
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button block plain type="danger" @click="logout">
        退出登录
      </van-button>
    </div>

    <!-- 底部标签栏 -->
    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 编辑资料弹窗 -->
    <van-dialog
      v-model:show="showEditDialog"
      title="编辑资料"
      show-cancel-button
      @confirm="saveProfile"
    >
      <div class="edit-dialog">
        <!-- 头像上传 -->
        <div class="avatar-upload">
          <div class="avatar-label">头像</div>
          <van-uploader
            v-model="avatarFileList"
            :max-count="1"
            :after-read="onAvatarRead"
            accept="image/*"
          >
            <template #default>
              <div class="avatar-preview" v-if="editForm.avatarUrl">
                <van-image
                  :src="editForm.avatarUrl"
                  width="80"
                  height="80"
                  round
                  fit="cover"
                />
              </div>
              <div class="avatar-placeholder" v-else>
                <van-icon name="photograph" size="32" color="#999" />
                <div class="avatar-tip">点击上传</div>
              </div>
            </template>
          </van-uploader>
        </div>
        
        <!-- 昵称输入 -->
        <van-field
          v-model="editForm.nickname"
          label="昵称"
          placeholder="请输入昵称"
          clearable
        />
        
        <!-- 手机号输入 -->
        <van-field
          v-model="editForm.phone"
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
          clearable
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getReferralStats, updateProfile, uploadAvatar } from '@/api/auth'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
const stats = ref({})
const showEditDialog = ref(false)
const editForm = ref({
  nickname: '',
  phone: '',
  avatarUrl: ''
})
const avatarFileList = ref([])
const activeTab = ref(2) // 个人中心是第 3 个标签（索引从 0 开始）

onMounted(async () => {
  await loadUserData()
  await loadStats()
})

const loadUserData = async () => {
  try {
    await userStore.fetchCurrentUser()
    user.value = userStore.user
    editForm.value.nickname = user.value.nickname || ''
    editForm.value.phone = user.value.phone || ''
    editForm.value.avatarUrl = user.value.avatarUrl || ''
    if (editForm.value.avatarUrl) {
      avatarFileList.value = [{ url: editForm.value.avatarUrl }]
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 头像上传处理
const onAvatarRead = async (file) => {
  try {
    showLoadingToast({
      message: '上传中...',
      forbidClick: true
    })
    
    // 调用上传接口
    const res = await uploadAvatar(file.file)
    
    editForm.value.avatarUrl = res.data.url
    showToast('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    showToast('上传失败，请重试')
  } finally {
    closeToast()
  }
}

const loadStats = async () => {
  try {
    const res = await getReferralStats()
    stats.value = res.data.stats
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const showQRCode = () => {
  if (user.value?.qrCodeUrl) {
    router.push('/invite-poster')
  } else {
    showToast('二维码生成中')
  }
}

const copyCode = () => {
  if (user.value?.referralCode) {
    navigator.clipboard.writeText(user.value.referralCode)
    showToast('推荐码已复制')
  }
}

const goToReferees = () => {
  router.push('/referees')
}

const goToCommissions = () => {
  router.push('/commissions')
}

const goToOrders = () => {
  router.push('/orders')
}

const showEditProfile = () => {
  showEditDialog.value = true
}

const saveProfile = async () => {
  try {
    if (!editForm.value.nickname || editForm.value.nickname.trim() === '') {
      showToast('昵称不能为空')
      return
    }
    
    const res = await updateProfile({
      nickname: editForm.value.nickname.trim(),
      phone: editForm.value.phone,
      avatarUrl: editForm.value.avatarUrl
    })
    
    // 更新 userStore 中的用户信息
    if (res.data.user) {
      userStore.user = { ...res.data.user }
      user.value = { ...res.data.user }
    }
    
    showToast('保存成功')
    showEditDialog.value = false
    // 重新加载确保数据一致
    await loadUserData()
  } catch (error) {
    console.error('保存失败:', error)
    showToast(error.message || '保存失败')
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
  showToast('已退出登录')
}

// 获取图片完整 URL
const getImageUrl = (url) => {
  if (!url) return ''
  // 如果已经是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  // 相对路径，通过 Vite 代理访问
  return url
}

const onTabChange = (index) => {
  if (index === 0) {
    router.push('/')
  } else if (index === 1) {
    router.push('/orders')
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px; /* 为底部导航栏留出空间 */
}

.user-card {
  background: linear-gradient(135deg, #1989fa, #0e6fd6);
  padding: 20px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.user-detail {
  flex: 1;
  margin-left: 12px;
}

.nickname {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.referral-code {
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-card {
  background: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 8px;
}

.stats-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stats-sub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-sub-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.stat-sub-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-sub-value {
  font-size: 16px;
  font-weight: bold;
}

.balance {
  color: #f44;
  font-weight: bold;
}

.logout-section {
  padding: 20px;
}

/* 编辑对话框样式 */
.edit-dialog {
  padding: 16px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-label {
  width: 80px;
  font-size: 14px;
  color: #666;
}

.avatar-preview {
  display: flex;
  justify-content: center;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px dashed #dcdee0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-placeholder:active {
  background: #e8ecef;
}

.avatar-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 上传组件样式 */
:deep(.van-uploader) {
  flex: 1;
}

:deep(.van-uploader__preview) {
  margin: 0;
}

:deep(.van-uploader__upload) {
  width: 80px;
  height: 80px;
}
</style>
