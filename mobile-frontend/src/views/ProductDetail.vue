<template>
  <div class="product-detail-page">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />

    <div v-if="product" class="detail-content">
      <!-- 商品图片 -->
      <van-image
        :src="getImageUrl(product.mainImage) || 'https://via.placeholder.com/400'"
        width="100%"
        fit="cover"
      />

      <!-- 商品信息 -->
      <div class="product-info">
        <div class="price-section">
          <span class="current-price">¥{{ product.currentPrice }}</span>
          <span class="original-price" v-if="product.originalPrice > product.currentPrice">
            ¥{{ product.originalPrice }}
          </span>
        </div>
        <div class="product-name">{{ product.name }}</div>
        <div class="product-description">{{ product.description }}</div>
        
        <!-- 佣金信息 -->
        <div class="commission-section">
          <van-icon name="gift" color="#ff9800" />
          <span class="commission-text">
            分销佣金：
            <span v-if="product.commissionType === 'percentage'">
              {{ product.commissionValue }}%
            </span>
            <span v-else>
              ¥{{ product.commissionValue }}
            </span>
          </span>
        </div>

        <!-- 库存 -->
        <div class="stock-section">
          <span>库存：{{ product.stock }}</span>
          <span>已售：{{ product.soldCount }}</span>
        </div>
      </div>

      <!-- 数量选择 -->
      <van-stepper
        v-model="quantity"
        label="数量"
        :max="product.stock"
        :min="1"
        integer
      />
    </div>

    <!-- 底部操作栏 -->
    <van-action-bar>
      <van-action-bar-icon icon="share-o" text="分享" @click="showShare" />
      <van-action-bar-button type="warning" text="立即购买" @click="buyNow" />
    </van-action-bar>

    <!-- 分享弹窗 -->
    <van-dialog
      v-model:show="showShareDialog"
      title="分享商品"
      show-cancel-button
      @confirm="shareProduct"
    >
      <div class="share-content">
        <p>分享给好友，TA 购买后您可获得佣金！</p>
        <div class="qr-placeholder">
          <van-icon name="qrcode" size="100" color="#1989fa" />
          <p>二维码将在此显示</p>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail, createOrder } from '@/api/product'
import { useUserStore } from '@/stores/user'
import { showToast, showDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const product = ref(null)
const quantity = ref(1)
const showShareDialog = ref(false)

onMounted(async () => {
  try {
    const res = await getProductDetail(route.params.id)
    product.value = res.data.product
  } catch (error) {
    console.error('加载商品详情失败:', error)
  }
})

const buyNow = async () => {
  try {
    await showDialog({
      title: '确认订单',
      message: `购买 ${product.value.name} x ${quantity.value}，总计 ¥${(product.value.currentPrice * quantity.value).toFixed(2)}`
    })

    // 创建订单
    await createOrder({
      items: [
        {
          productId: product.value.id,
          quantity: quantity.value
        }
      ],
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      paymentMethod: 'wechat'
    })

    showToast('订单创建成功')
    router.push('/orders')
  } catch (error) {
    if (error.message !== '取消') {
      console.error('创建订单失败:', error)
    }
  }
}

const showShare = () => {
  showShareDialog.value = true
}

const shareProduct = () => {
  showToast('分享功能开发中')
}

// 获取图片完整 URL
const getImageUrl = (url) => {
  if (!url) return ''
  // 如果已经是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  // 相对路径转换为完整 URL（通过 Vite 代理）
  return url
}
</script>

<style scoped>
.product-detail-page {
  padding-bottom: 60px;
  background: #f7f8fa;
  min-height: 100vh;
}

.detail-content {
  background: #fff;
  margin-bottom: 12px;
}

/* 商品图片 */
:deep(.van-image) {
  max-height: 400px;
}

.product-info {
  padding: 20px 16px;
}

.price-section {
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.current-price {
  font-size: 28px;
  color: #ff4757;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.original-price {
  font-size: 15px;
  color: #bbb;
  text-decoration: line-through;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

.product-description {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
  background: #f7f8fa;
  padding: 12px;
  border-radius: 8px;
}

/* 佣金区域 */
.commission-section {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.commission-text {
  margin-left: 8px;
  color: #ff9800;
  font-weight: 600;
  font-size: 14px;
}

.commission-text span {
  font-weight: 700;
  font-size: 16px;
}

/* 库存区域 */
.stock-section {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.stock-section span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 数量选择器 */
:deep(.van-stepper) {
  margin: 0 16px 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

:deep(.van-stepper__label) {
  font-weight: 500;
  color: #333;
}

/* 底部操作栏 */
:deep(.van-action-bar) {
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
}

:deep(.van-action-bar-button--warning) {
  background: linear-gradient(135deg, #ff6b81 0%, #ff4757 100%);
  border: none;
}

:deep(.van-action-bar-button--warning:active) {
  opacity: 0.9;
}

/* 分享弹窗 */
.share-content {
  padding: 24px 20px;
  text-align: center;
}

.share-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.qr-placeholder {
  margin-top: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f7f8fa 0%, #e8ecef 100%);
  border-radius: 12px;
}

/* 动画效果 */
.product-info {
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
