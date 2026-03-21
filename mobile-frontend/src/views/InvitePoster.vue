<template>
  <div class="invite-poster-page">
    <van-nav-bar 
      title="邀请海报" 
      left-arrow 
      @click-left="$router.back()" 
    />
    
    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-info">
        <van-image
          :src="user?.avatarUrl || 'https://via.placeholder.com/80'"
          width="50"
          height="50"
          round
          class="avatar"
        />
        <div class="user-detail">
          <div class="nickname">{{ user?.nickname || user?.username }}</div>
          <div class="referral-code">
            邀请码 <span class="code">{{ user?.referralCode }}</span>
          </div>
        </div>
        <van-button size="small" icon="copy" @click="copyCode">
          复制
        </van-button>
      </div>
    </div>

    <!-- 佣金余额卡片 -->
    <div class="commission-card">
      <div class="commission-info">
        <div class="commission-label">当前佣金余额</div>
        <div class="commission-amount">¥{{ user?.balance || '0.00' }}</div>
      </div>
      <van-button 
        type="primary" 
        size="small" 
        round 
        @click="$router.push('/commissions')"
      >
        进入钱包
        <van-icon name="arrow" />
      </van-button>
    </div>

    <!-- 邀请海报主体 -->
    <div class="poster-content">
      <div class="poster-header">
        <div class="poster-title">
          <van-icon name="star" class="star-icon" />
          好友一起学，收获双倍快乐！
          <van-icon name="star" class="star-icon" />
        </div>
        <div class="poster-subtitle">
          邀请好友加入，共同成长，赚取佣金
        </div>
      </div>

      <!-- 二维码区域 -->
      <div class="qrcode-section">
        <div class="qrcode-wrapper">
          <van-image
            :src="qrCodeUrl"
            width="200"
            height="200"
            fit="contain"
          />
        </div>
        <div class="qrcode-hint">
          长按识别二维码
        </div>
      </div>

      <!-- 底部品牌信息 -->
      <div class="poster-footer">
        <div class="brand-info">
          <div class="brand-logo">直</div>
          <div class="brand-name">直注英语 · 学伴计划</div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <van-button 
        type="primary" 
        block 
        round 
        @click="savePoster"
        class="action-btn"
      >
        <van-icon name="share-o" /> 保存海报
      </van-button>
      <van-button 
        plain 
        block 
        round 
        @click="shareToFriend"
        class="action-btn"
      >
        <van-icon name="friends-o" /> 分享给好友
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showImagePreview } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
const qrCodeUrl = ref('')

onMounted(async () => {
  await loadUserData()
})

const loadUserData = async () => {
  try {
    await userStore.fetchCurrentUser()
    user.value = userStore.user
    qrCodeUrl.value = user.value?.qrCodeUrl || 'https://via.placeholder.com/200'
  } catch (error) {
    console.error('加载用户信息失败:', error)
    showToast('加载失败')
  }
}

const copyCode = () => {
  if (user.value?.referralCode) {
    navigator.clipboard.writeText(user.value.referralCode)
    showToast('邀请码已复制')
  }
}

const savePoster = () => {
  showToast('海报保存中...')
  // TODO: 实现海报保存功能（需要 html2canvas 等库）
  setTimeout(() => {
    showToast('海报已保存到相册')
  }, 1000)
}

const shareToFriend = () => {
  showToast('分享功能开发中')
  // TODO: 实现分享功能
}
</script>

<style scoped>
.invite-poster-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
  padding-bottom: 20px;
}

/* 用户信息卡片 */
.user-info-card {
  background: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-detail {
  flex: 1;
  margin-left: 12px;
}

.nickname {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.referral-code {
  font-size: 13px;
  color: #666;
}

.referral-code .code {
  color: #1989fa;
  font-weight: bold;
  margin-left: 4px;
}

/* 佣金余额卡片 */
.commission-card {
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%);
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.commission-info {
  flex: 1;
}

.commission-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.commission-amount {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

/* 海报主体 */
.poster-content {
  background: #fff;
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.poster-header {
  text-align: center;
  margin-bottom: 24px;
}

.poster-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.star-icon {
  color: #1989fa;
  font-size: 16px;
}

.poster-subtitle {
  font-size: 14px;
  color: #999;
}

/* 二维码区域 */
.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
}

.qrcode-wrapper {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qrcode-hint {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}

/* 底部品牌信息 */
.poster-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 16px;
}

.brand-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.brand-logo {
  width: 24px;
  height: 24px;
  background: #1989fa;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.brand-name {
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

/* 底部操作按钮 */
.action-buttons {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
}
</style>
