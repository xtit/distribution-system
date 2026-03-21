<template>
  <div class="order-page">
    <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" />
    <div class="order-content">
      <van-cell-group inset>
        <van-cell title="商品信息">
          <template #default>
            <div v-for="item in orderItems" :key="item.productId" class="order-item">
              <span>{{ item.productName }} x {{ item.quantity }}</span>
              <span>¥{{ item.subtotal }}</span>
            </div>
          </template>
        </van-cell>

        <van-cell title="收货地址" is-link @click="showAddressPicker = true">
          <template #right-icon>
            <span class="address-text">{{ addressText || '请选择收货地址' }}</span>
            <van-icon name="arrow" />
          </template>
        </van-cell>

        <van-cell title="订单金额">
          <template #right-icon>
            <span class="total-amount">¥{{ totalAmount }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="submit-section">
        <van-button block type="primary" @click="submitOrder">
          提交订单
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createOrder } from '@/api/product'
import { showToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderItems = ref(JSON.parse(route.query.items || '[]'))
const addressText = ref('')
const showAddressPicker = ref(false)

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
})

const submitOrder = async () => {
  if (!addressText.value) {
    showToast('请选择收货地址')
    return
  }

  try {
    await createOrder({
      items: orderItems.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      receiverName: '测试用户',
      receiverPhone: '13800000000',
      receiverAddress: addressText.value,
      paymentMethod: 'wechat'
    })
    showToast('订单创建成功')
    router.push('/orders')
  } catch (error) {
    console.error('创建订单失败:', error)
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.order-content {
  padding: 10px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.address-text {
  color: #999;
}

.total-amount {
  color: #f44;
  font-weight: bold;
  font-size: 16px;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: #fff;
}
</style>
