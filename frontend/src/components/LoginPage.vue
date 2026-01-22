<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      email: email.value,
      password: password.value
    });

    if (response.data.success) {
      const user = response.data.user;

      // 存 token 和 role
      localStorage.setItem('token', 'dummy-token-' + user.id);
      localStorage.setItem('userRole', user.role.trim());
      localStorage.setItem('user', JSON.stringify(user));

      console.log('登入成功，userRole:', user.role);

      // 根據角色自動跳到個人 Profile
      const rolePath = user.role.toLowerCase().replace(' ', '-');
      router.push(`/profile/${rolePath}`);
    }
  } catch (error) {
    errorMessage.value = 'Login failed. Please check your credentials.';
    console.error(error);
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Agile Dashboard Login</h2>
      <div class="input-group">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="admin@test.com" />
      </div>
      <div class="input-group">
        <label>Password</label>
        <input type="password" v-model="password" placeholder="123" />
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button @click="handleLogin">Login</button>
      <div class="register-link">
        New user? <router-link to="/register">Create an account</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e9ecef;
}
.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 300px;
  text-align: center;
}
.input-group {
  margin-bottom: 1rem;
  text-align: left;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.input-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* 確保 padding 不會撐大寬度 */
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #3aa876;
}

.error {
  color: red;
  font-size: 0.9rem;
}

.register-link {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>