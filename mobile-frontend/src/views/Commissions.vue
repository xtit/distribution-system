<template>
  <div class="commissions-page">
    <van-nav-bar title="佣金记录" left-arrow @click-left="$router.back()" />

    <!-- 状态筛选 -->
    <van-tabs v-model:active="activeStatus" @change="onStatusChange">
      <van-tab name="" title="全部" />
      <van-tab name="pending" title="待结算" />
      <van-tab name="frozen" title="冻结中" />
      <van-tab name="confirmed" title="可提现" />
      <van-tab name="paid" title="已提现" />
    </van-tabs>

    <!-- 佣金列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="commission-list">
        <div v-for="commission in commissions" :key="commission.id" class="commission-item">
          <div class="commission-header">
            <span class="commission-no">{{ commission.commissionNo }}</span>
            <span :class="['commission-status', commission.status]">
              {{ getStatusText(commission.status) }}
            </span>
          </div>
          <div class="commission-body">
            <div class="product-info">
              <span class="product-name">{{ commission.product?.name || '商品' }}</span>
              <span class="order-no">订单：{{ commission.order?.orderNo }}</span>
            </div>
            <div class="commission-detail">
              <span>第{{ commission.level }}级分销</span>
              <span v-if="commission.commissionRate">佣金比例：{{ commission.commissionRate }}%</span>
            </div>
          </div>
          <div class="commission-footer">
            <span class="commission-date">{{ formatDate(commission.createdAt) }}</span>
            <span class="commission-amount">¥{{ commission.amount }}</span>
          </div>
        </div>
      </div>
    </van-list>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && commissions.length === 0"
      image="search"
      description="暂无佣金记录"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getCommissions } from '@/api/auth'

const commissions = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const activeStatus = ref('')

const onLoad = async () => {
  try {
    const res = await getCommissions({
      status: activeStatus.value,
      page: page.value,
      limit: 20
    })
    
    if (page.value === 1) {
      commissions.value = res.data.list
    } else {
      commissions.value = [...commissions.value, ...res.data.list]
    }

    if (page.value >= res.data.pagination.totalPages) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error('加载佣金记录失败:', error)
  } finally {
    loading.value = false
  }
}

const onStatusChange = () => {
  page.value = 1
  commissions.value = []
  finished.value = false
  onLoad()
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待结算',
    frozen: '冻结中',
    confirmed: '可提现',
    paid: '已提现',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.commissions-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.commission-list {
  padding: 10px;
}

.commission-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.commission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.commission-no {
  font-size: 12px;
  color: #999;
}

.commission-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.commission-status.pending {
  color: #ff9800;
  background: #fff3e0;
}

.commission-status.frozen {
  color: #ff5722;
  background: #fbe9e7;
}

.commission-status.confirmed {
  color: #1989fa;
  background: #e3f2fd;
}

.commission-status.paid {
  color: #4caf50;
  background: #e8f5e9;
}

.commission-body {
  margin-bottom: 12px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.order-no {
  font-size: 12px;
  color: #999;
}

.commission-detail {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.commission-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.commission-date {
  font-size: 12px;
  color: #999;
}

.commission-amount {
  font-size: 18px;
  color: #f44;
  font-weight: bold;
}
</style>
