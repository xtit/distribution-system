<template>
  <div class="referees-page">
    <van-nav-bar title="我的下级" left-arrow @click-left="$router.back()" />

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-value">{{ stats.direct || 0 }}</div>
          <div class="stat-label">直接下级</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-value">{{ stats.indirect || 0 }}</div>
          <div class="stat-label">间接下级</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-value">{{ stats.total || 0 }}</div>
          <div class="stat-label">总计</div>
        </div>
      </div>
    </div>

    <!-- 层级切换 -->
    <div class="tabs-section">
      <van-tabs v-model:active="activeLevel" @change="onLevelChange" color="#1989fa" title-active-color="#1989fa">
        <van-tab name="1" title="直接下级" />
        <van-tab name="2" title="间接下级" />
      </van-tabs>
    </div>

    <!-- 下级列表 -->
    <div class="referee-list">
      <div v-for="(referee, index) in referees" :key="referee.id" class="referee-item">
        <div class="item-index">{{ index + 1 }}</div>
        <div class="item-content">
          <div class="item-header">
            <van-image
              :src="referee.avatarUrl || 'https://via.placeholder.com/50'"
              width="40"
              height="40"
              round
              class="avatar"
            />
            <div class="user-info">
              <div class="username">{{ referee.nickname || referee.username }}</div>
              <div class="phone">{{ referee.phone || '未绑定手机号' }}</div>
            </div>
            <van-button 
              size="small" 
              round 
              plain 
              icon="phone-o"
              @click="contactReferee(referee)"
            />
          </div>
          <div class="item-footer">
            <div class="join-time">
              <van-icon name="clock-o" />
              {{ formatDate(referee.createdAt) }}
            </div>
            <van-button 
              size="small" 
              type="primary" 
              @click="viewRefereeDetail(referee)"
            >
              详情
            </van-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
      </van-list>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && referees.length === 0"
        image="search"
        description="暂无下级"
      />
    </div>

    <!-- 下级详情弹窗 -->
    <van-dialog
      v-model:show="showDetailDialog"
      :show-confirm-button="false"
      :show-cancel-button="false"
      class="detail-dialog"
    >
      <!-- 关闭按钮 -->
      <div class="dialog-header">
        <div class="dialog-title">下级详情</div>
        <van-icon name="cross" class="close-btn" @click="showDetailDialog = false" />
      </div>

      <!-- 用户信息 -->
      <div class="dialog-user">
        <van-image
          :src="selectedReferee?.avatarUrl || 'https://via.placeholder.com/60'"
          width="50"
          height="50"
          round
        />
        <div class="user-detail">
          <div class="user-name">{{ selectedReferee?.nickname || selectedReferee?.username }}</div>
          <div class="user-phone">{{ selectedReferee?.phone || '未绑定手机号' }}</div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-grid" v-if="orderStats.totalCount > 0">
        <div class="stat-card">
          <div class="stat-label">订单交易量</div>
          <div class="stat-value">{{ orderStats.totalCount }}</div>
          <div class="stat-unit">笔</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">订单总金额</div>
          <div class="stat-value amount">¥{{ orderStats.totalAmount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">佣金金额</div>
          <div class="stat-value commission">¥{{ orderStats.commissionAmount }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <van-empty
          image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          image-size="80"
          description="暂时还没有订单成交哦！"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReferees, getReferralStats, getRefereeOrderStats } from '@/api/auth'
import { showToast } from 'vant'

const router = useRouter()

const referees = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const activeLevel = ref('1')
const stats = ref({
  direct: 0,
  indirect: 0,
  total: 0
})
const showDetailDialog = ref(false)
const selectedReferee = ref(null)
const orderStats = ref({
  totalCount: 0,
  totalAmount: '0.00',
  commissionAmount: '0.00'
})

onMounted(async () => {
  await loadStats()
  await onLoad()
})

const loadStats = async () => {
  try {
    const res = await getReferralStats()
    const data = res.data.stats
    stats.value = {
      direct: data.directReferees || 0,
      indirect: data.indirectReferees || 0,
      total: data.totalReferees || 0
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const onLoad = async () => {
  try {
    const res = await getReferees({
      level: activeLevel.value,
      page: page.value,
      limit: 20
    })
    
    if (page.value === 1) {
      referees.value = res.data.list
    } else {
      referees.value = [...referees.value, ...res.data.list]
    }

    if (page.value >= res.data.pagination.totalPages) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error('加载下级列表失败:', error)
  } finally {
    loading.value = false
  }
}

const onLevelChange = () => {
  page.value = 1
  referees.value = []
  finished.value = false
  onLoad()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const contactReferee = (referee) => {
  if (referee.phone) {
    window.location.href = `tel:${referee.phone}`
  } else {
    showToast('该用户未绑定手机号')
  }
}

const viewRefereeDetail = async (referee) => {
  selectedReferee.value = referee
  await loadOrderStats(referee.id)
  showDetailDialog.value = true
}

const loadOrderStats = async (userId) => {
  try {
    const res = await getRefereeOrderStats(userId)
    orderStats.value = res.data.stats
  } catch (error) {
    console.error('加载订单统计失败:', error)
    orderStats.value = {
      totalCount: 0,
      totalAmount: '0.00',
      commissionAmount: '0.00'
    }
  }
}
</script>

<style scoped>
.referees-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

/* 统计卡片 */
.stats-section {
  padding: 12px;
}

.stats-card {
  background: linear-gradient(135deg, #1989fa 0%, #0e6fd6 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: #fff;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 8px;
}

/* 标签页区域 */
.tabs-section {
  background: #fff;
  margin-bottom: 12px;
}

/* 列表区域 */
.referee-list {
  padding: 0 12px;
}

.referee-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.item-index {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #1989fa 0%, #0e6fd6 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.phone {
  font-size: 12px;
  color: #999;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.join-time {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 详情弹窗样式 */
:deep(.detail-dialog) {
  border-radius: 16px !important;
  overflow: hidden;
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.dialog-user {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f7f8fa;
}

.user-detail {
  margin-left: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 13px;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px;
}

.stat-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-value.amount {
  color: #1989fa;
}

.stat-value.commission {
  color: #07c160;
}

.stat-unit {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.empty-state {
  padding: 40px 20px 60px;
}
</style>
