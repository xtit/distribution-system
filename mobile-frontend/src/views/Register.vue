<template>
  <div class="register-page">
    <div class="logo">
      <van-icon name="shopping-cart-o" size="60" color="#1989fa" />
      <h1>注册账号</h1>
    </div>

    <van-form @submit="onSubmit">
      <van-field
        v-model="username"
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        :rules="[{ required: true, message: '请填写用户名' }]"
      />
      <van-field
        v-model="password"
        type="password"
        name="password"
        label="密码"
        placeholder="请输入密码"
        :rules="[
          { required: true, message: '请填写密码' },
          { pattern: /^.{6,}$/, message: '密码至少 6 位' }
        ]"
      />
      <van-field
        v-model="confirmPassword"
        type="password"
        name="confirmPassword"
        label="确认密码"
        placeholder="请再次输入密码"
        :rules="[
          { required: true, message: '请确认密码' },
          { validator: validatePassword, message: '两次密码不一致' }
        ]"
      />
      <van-field
        v-model="nickname"
        name="nickname"
        label="昵称"
        placeholder="请输入昵称"
      />
      <van-field
        v-model="phone"
        name="phone"
        label="手机号"
        type="tel"
        placeholder="请输入手机号"
        :rules="[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"
      />
      <van-field
        v-model="referralCode"
        name="referralCode"
        label="推荐码"
        placeholder="如有推荐码请填写（可选）"
      />
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
    </van-form>

    <div class="links">
      <router-link to="/login">已有账号？立即登录</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const phone = ref('')
const referralCode = ref(route.query.ref || '')
const loading = ref(false)

const validatePassword = (value) => value === password.value

const onSubmit = async () => {
  loading.value = true
  try {
    await userStore.register({
      username: username.value,
      password: password.value,
      nickname: nickname.value,
      phone: phone.value,
      referralCode: referralCode.value
    })
    showToast('注册成功')
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  padding: 40px 20px;
  min-height: 100vh;
  background: #fff;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo h1 {
  font-size: 24px;
  color: #333;
  margin-top: 16px;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.links a {
  color: #1989fa;
  text-decoration: none;
}
</style>
