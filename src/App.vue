<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LoginForm from './components/LoginForm.vue';
import Dashboard from './components/Dashboard.vue';

const isLoggedIn = ref(false);
const user = ref(null);

onMounted(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    isLoggedIn.value = true;
    // ในโปรเจกต์จริง อาจจะมีการเรียก API เพื่อ verify token ที่นี่
  }
});

function handleLoginSuccess(data: any) {
  isLoggedIn.value = true;
  user.value = data;
}

function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  isLoggedIn.value = false;
  user.value = null;
}
</script>

<template>
  <div v-if="!isLoggedIn">
    <LoginForm @login-success="handleLoginSuccess" />
  </div>
  <div v-else>
    <Dashboard @logout="handleLogout" />
  </div>
</template>

<style>
/* ลบสไตล์เก่าของ logged-in-container ออกไปเพราะไม่ได้ใช้แล้ว */
</style>
