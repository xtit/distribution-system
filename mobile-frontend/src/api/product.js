import request from './request'

// 获取商品列表
export function getProducts(params) {
  return request.get('/products', { params })
}

// 获取商品详情
export function getProductDetail(id) {
  return request.get(`/products/${id}`)
}

// 创建订单
export function createOrder(data) {
  return request.post('/products/orders', data)
}

// 获取订单列表
export function getOrders(params) {
  return request.get('/products/orders', { params })
}

// 确认支付
export function confirmPayment(orderId, data) {
  return request.post(`/products/orders/${orderId}/payment`, data)
}

// 确认收货
export function confirmReceive(orderId) {
  return request.post(`/products/orders/${orderId}/confirm-receive`)
}
