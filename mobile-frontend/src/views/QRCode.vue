<template>
  <div class="qrcode-page">
    <van-nav-bar title="我的二维码" left-arrow @click-left="$router.back()" />
    
    <div class="qrcode-content">
      <van-image
        :src="user?.qrCodeUrl || 'https://via.placeholder.com/300'"
        width="250"
        height="250"
      />
      <div class="qrcode-text">
        <p>扫一扫二维码</p>
        <p>成为我的下线</p>
      </div>
      <div class="qrcode-info">
        <p>我的推荐码：{{ user?.referralCode }}</p>
        <van-button size="small" @click="copyCode">
          复制推荐码
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const userStore = useUserStore()
const user = ref(null)

onMounted(async () => {
  await userStore.fetchCurrentUser()
  user.value = userStore.user
})

const copyCode = () => {
  if (user.value?.referralCode) {
    navigator.clipboard.writeText(user.value.referralCode)
    showToast('推荐码已复制')
  }
}
</script>

<style scoped>
.qrcode-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qrcode-content {
  text-align: center;
  padding: 40px 20px;
}

.qrcode-text {
  margin: 20px 0;
  color: #666;
}

.qrcode-text p {
  margin: 8px 0;
  font-size: 16px;
}

.qrcode-info {
  margin-top: 20px;
  padding: 20px;
  background: #f7f8fa;
  border-radius: 8px;
}

.qrcode-info p {
  margin-bottom: 12px;
  color: #666;
}
</style>
