<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('Developer'); // 預設選中 Developer
const errorMessage = ref('');
const router = useRouter();

// 定義你要求的 Roles 列表
const roles = [
  'Product Manager',
  'Business Analyst',
  'Developer',
  'Tester',
  'UAT User',
  'Product Owner'
];

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    });

    if (response.data.success) {
      alert('Registration successful! Please login.');
      router.push('/'); // 註冊成功後跳轉回登入頁
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Registration failed. Please try again.';
    }
    console.error(error);
  }
};
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Create Account</h2>
      
      <div class="input-group">
        <label>User Name</label>
        <input type="text" v-model="name" placeholder="Your Name" />
      </div>

      <div class="input-group">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="example@test.com" />
      </div>

      <div class="input-group">
        <label>Password</label>
        <input type="password" v-model="password" placeholder="Create a password" />
      </div>

      <div class="input-group">
        <label>Role</label>
        <select v-model="role">
          <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button @click="handleRegister" class="register-btn">Sign Up</button>
      
      <div class="login-link">
        Already have an account? <router-link to="/">Login here</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e9ecef;
}
.register-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 350px; /* 比登入框稍寬一點 */
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
  color: #2c3e50;
}
.input-group input, .input-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  font-family: inherit;
}
/* 讓 Select 選單看起來更現代一點 */
.input-group select {
  background-color: white;
  cursor: pointer;
}
.register-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db; /* 用藍色區分註冊按鈕 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}
.register-btn:hover {
  background-color: #2980b9;
}
.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.login-link {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}
.login-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}
.login-link a:hover {
  text-decoration: underline;
}
</style>