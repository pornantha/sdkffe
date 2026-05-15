<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LoginForm from './components/LoginForm.vue';

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
  <div v-else class="logged-in-container">
    <h1>Welcome!</h1>
    <p>You are successfully logged in.</p>
    <button @click="handleLogout" class="logout-button">Logout</button>
  </div>
</template>

<style>
.logged-in-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.logout-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #ff3333;
}
</style>
