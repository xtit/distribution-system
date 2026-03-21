<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="分销商城" right-text="个人中心" @click-right="goToProfile" />

    <!-- 搜索栏 -->
    <van-search v-model="searchText" placeholder="搜索商品" shape="round" />

    <!-- 商品列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="product-list">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-item"
          @click="goToProduct(product.id)"
        >
          <van-image
            :src="getImageUrl(product.mainImage) || 'https://via.placeholder.com/200'"
            width="100"
            height="100"
            fit="cover"
            round
          />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-desc">{{ product.description }}</div>
            <div class="product-price">
              <span class="current-price">¥{{ product.currentPrice }}</span>
              <span class="original-price" v-if="product.originalPrice > product.currentPrice">
                ¥{{ product.originalPrice }}
              </span>
            </div>
            <div class="product-commission" v-if="product.commissionType === 'percentage'">
              佣金：{{ product.commissionValue }}%
            </div>
            <div class="product-commission" v-else>
              佣金：¥{{ product.commissionValue }}
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
import { getProducts } from '@/api/product'

const router = useRouter()

const searchText = ref('')
const products = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const activeTab = ref(0) // 首页

const onLoad = async () => {
  try {
    const res = await getProducts({
      page: page.value,
      limit: 10
    })
    
    if (page.value === 1) {
      products.value = res.data.list
    } else {
      products.value = [...products.value, ...res.data.list]
    }

    if (page.value >= res.data.pagination.totalPages) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const goToProfile = () => {
  router.push('/profile')
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

const onTabChange = (index) => {
  if (index === 1) {
    router.push('/orders')
  } else if (index === 2) {
    router.push('/profile')
  }
}
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
  background: linear-gradient(180deg, #f7f8fa 0%, #fff 100%);
  min-height: 100vh;
}

/* 搜索栏美化 */
:deep(.van-search) {
  background: transparent !important;
  padding: 10px 15px;
}

.product-list {
  padding: 0 10px 10px;
}

.product-item {
  display: flex;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.product-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

/* 商品图片 */
:deep(.van-image) {
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin: 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.product-price {
  margin: 8px 0 6px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  color: #ff4757;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.original-price {
  font-size: 13px;
  color: #bbb;
  text-decoration: line-through;
}

.product-commission {
  font-size: 11px;
  color: #ff9800;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  padding: 4px 8px;
  border-radius: 6px;
  align-self: flex-start;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.product-commission::before {
  content: '💰';
  font-size: 12px;
}

/* 加载更多 */
:deep(.van-list__finished-text) {
  color: #999;
  font-size: 13px;
  padding: 16px 0;
}
</style>
