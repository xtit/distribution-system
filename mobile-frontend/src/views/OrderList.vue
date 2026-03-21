<template>
  <div class="order-list-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.back()" />

    <!-- 订单状态筛选 -->
    <van-tabs v-model:active="activeStatus" @change="onStatusChange">
      <van-tab name="" title="全部" />
      <van-tab name="pending" title="待支付" />
      <van-tab name="paid" title="待发货" />
      <van-tab name="shipped" title="待收货" />
      <van-tab name="completed" title="已完成" />
    </van-tabs>

    <!-- 订单列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <!-- 订单头部 -->
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span :class="['order-status', order.status]">
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <!-- 订单商品 -->
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-product">
              <van-image
                :src="item.product?.mainImage || 'https://via.placeholder.com/80'"
                width="80"
                height="80"
                fit="cover"
                round
              />
              <div class="product-info">
                <div class="product-name">{{ item.productName }}</div>
                <div class="product-spec">
                  ¥{{ item.unitPrice }} × {{ item.quantity }}
                </div>
              </div>
            </div>
          </div>

          <!-- 物流信息 -->
          <div v-if="order.status === 'shipped' && order.trackingNo" class="shipping-info">
            <div class="shipping-label">
              <van-icon name="logistics" /> 快递：{{ order.shippingCompany }}
            </div>
            <div class="shipping-no">运单号：{{ order.trackingNo }}</div>
            <div class="shipping-time">
              <van-icon name="clock-o" /> 发货时间：{{ formatDateTime(order.shippedAt) }}
            </div>
          </div>

          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-total">
              合计：<span class="total-amount">¥{{ order.actualAmount }}</span>
            </div>
            <div class="order-actions">
              <van-button
                v-if="order.status === 'pending'"
                size="small"
                plain
                @click="cancelOrder(order.id)"
              >
                取消订单
              </van-button>
              <van-button
                v-if="order.status === 'pending'"
                size="small"
                type="primary"
                @click="payOrder(order.id)"
              >
                立即支付
              </van-button>
              <van-button
                v-if="order.status === 'shipped'"
                size="small"
                type="primary"
                @click="confirmReceive(order.id)"
              >
                确认收货
              </van-button>
              <van-button
                v-if="order.status === 'completed'"
                size="small"
                plain
                disabled
              >
                已收货（佣金冻结中）
              </van-button>
              <van-button
                v-if="order.status === 'paid'"
                size="small"
                plain
                disabled
              >
                待发货
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </van-list>

    <!-- 底部标签栏 -->
    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getOrders, confirmPayment, confirmReceive as confirmReceiveAPI } from '@/api/product'
import { showToast, showDialog } from 'vant'

const router = useRouter()

const orders = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const activeStatus = ref('')
const activeTab = ref(1)

const onLoad = async () => {
  try {
    const res = await getOrders({
      status: activeStatus.value,
      page: page.value,
      limit: 10
    })
    
    if (page.value === 1) {
      orders.value = res.data.list
    } else {
      orders.value = [...orders.value, ...res.data.list]
    }

    if (page.value >= res.data.pagination.totalPages) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

const onStatusChange = () => {
  page.value = 1
  orders.value = []
  finished.value = false
  onLoad()
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const payOrder = async (orderId) => {
  try {
    await showDialog({
      title: '确认支付',
      message: '确认支付该订单吗？'
    })
    await confirmPayment(orderId, { paymentMethod: 'wechat' })
    showToast('支付成功')
    onLoad()
  } catch (error) {
    if (error.message !== '取消') {
      console.error('支付失败:', error)
    }
  }
}

const confirmReceive = async (orderId) => {
  try {
    await showDialog({
      title: '确认收货',
      message: '确认已收到商品吗？确认收货后订单将标记为已完成，佣金将进入 15 天冻结期。'
    })
    
    // 调用后端 API
    await confirmReceiveAPI(orderId)
    
    showToast('确认收货成功')
    // 重新加载订单列表
    onLoad()
  } catch (error) {
    if (error.message !== '取消') {
      console.error('确认收货失败:', error)
      showToast('确认收货失败：' + error.message)
    }
  }
}

const cancelOrder = async (orderId) => {
  try {
    await showDialog({
      title: '取消订单',
      message: '确定要取消该订单吗？'
    })
    showToast('订单已取消')
    onLoad()
  } catch (error) {
    if (error.message !== '取消') {
      console.error('取消订单失败:', error)
    }
  }
}

const onTabChange = (index) => {
  if (index === 0) {
    router.push('/')
  } else if (index === 2) {
    router.push('/profile')
  }
}
</script>

<style scoped>
.order-list-page {
  padding-bottom: 60px;
  background: #f7f8fa;
}

.order-list {
  padding: 10px;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  font-size: 12px;
  color: #999;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.order-status.pending {
  color: #ff9800;
  background: #fff3e0;
}

.order-status.paid,
.order-status.shipped {
  color: #1989fa;
  background: #e3f2fd;
}

.order-status.completed {
  color: #4caf50;
  background: #e8f5e9;
}

.shipping-info {
  padding: 12px;
  background: #f7f8fa;
  margin: 0 12px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.shipping-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  font-weight: 500;
}

.shipping-no {
  margin-bottom: 4px;
  font-family: monospace;
}

.shipping-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.order-items {
  padding: 12px;
}

.order-product {
  display: flex;
  margin-bottom: 12px;
}

.order-product:last-child {
  margin-bottom: 0;
}

.product-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.product-spec {
  font-size: 12px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
}

.order-total {
  font-size: 14px;
  color: #333;
}

.total-amount {
  font-size: 16px;
  color: #f44;
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: 8px;
}
</style>
