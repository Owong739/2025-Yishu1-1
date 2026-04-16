<template>
  <div>
    <!-- Top Bar -->
    <div class="top-bar">
      <div style="display: flex; align-items: center; gap: 15px">
        <a href="/" class="btn-nav">🏠 Home</a>
        <button v-if="currentPage !== 'dashboard'" class="btn-nav" @click="goBack">← Back</button>
        <span style="font-size: 18px; font-weight: bold">Programme Tracking</span>

        <!-- 專案選擇器 -->
        <div style="margin-left: 20px; display: flex; align-items: center; gap: 10px">
          <label style="font-size: 14px; color: #fff">Project:</label>
          <select 
            v-model="selectedProjectName" 
            @change="fetchData" 
            style="padding: 5px 10px; border-radius: 4px; border: none; font-size: 14px; cursor: pointer"
          >
            <option value="">-- All Projects --</option>
            <option v-for="p in allProjects" :key="p.id" :value="p.name">
              {{ p.name }}
            </option>
          </select>
        </div>
      </div>
      <div>
        User: <strong>{{ currentUserName }}</strong>
        <span class="status-badge" style="background: rgba(255,255,255,0.2); margin-left: 10px">
          {{ currentUserRole }}
        </span>
      </div>
    </div>

    <div class="container">
      <!-- Dashboard 主頁 -->
      <div v-if="currentPage === 'dashboard'">
        <!-- Metrics + Pie Chart -->
        <div class="metrics-container">
          <div class="card-box" style="flex: 2; display: flex; gap: 15px">
            <div class="metric-card">
              <small>OVERALL COMPLETION</small>
              <div class="val" style="color: var(--success)">{{ dynamicMetrics.completionRate }}%</div>
            </div>
            <div class="metric-card">
              <small>ACTIVE ISSUES</small>
              <div class="val" style="color: var(--warning)">{{ dynamicMetrics.activeIssues }}</div>
            </div>
            <div class="metric-card">
              <small>TOTAL ISSUES</small>
              <div class="val">{{ tasks.length }}</div>
            </div>
          </div>

          <div class="card-box" style="flex: 1">
            <h4 style="margin: 0 0 10px 0">Visual Analysis</h4>
            <div id="statusPieChart" style="height: 180px"></div>
          </div>
        </div>

        <!-- Global Task Board -->
        <div class="card-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h2 style="margin: 0">Tasks: {{ selectedProjectName || 'All' }}</h2>
            <button v-if="isPM || isBA" class="btn btn-primary" @click="openTaskEdit(null)">
              + Create Issue
            </button>
          </div>
          <div class="board-columns" style="overflow-x: auto; display: flex; gap: 15px;">
            <div v-for="col in ['Backlog', 'Dev', 'SIT', 'UAT', 'Done']" :key="col"
                class="board-column"
                :style="{ 
                  minWidth: '250px',
                  borderTopColor: col === 'Done' ? '#1890ff' : col === 'Backlog' ? '#95a5a6' : '#f1c40f' 
                }">
              <h4 style="text-transform: uppercase; color: #5e6c84; margin-left: 5px">
                {{ col }} ({{ getTasksByStatus(col).length }})
              </h4>
              
              <div v-for="task in getTasksByStatus(col)" :key="task.id"
                  class="task-card"
                  :class="'priority-' + task.priority"
                  @click="openTaskEdit(task)">
                <div style="font-weight: bold; font-size: 14px">{{ task.title }}</div> 
                <div style="margin-top: 8px; font-size: 11px; color: #666">
                  👤 {{ task.assignee || 'Unassigned' }}
                </div>
                <div class="test-tag">{{ task.userStory ? 'User Story' : 'Backlog' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sprint Management -->
        <!-- 找到 Sprint Management 區塊 -->
        <div class="card-box">
          <h2 style="margin: 0 0 10px 0">Sprint Management</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px">
            Organize and track your development cycles for <strong>{{ selectedProjectName || 'All Projects' }}</strong>.
          </p>

          <!-- 修改這裡：使用 displaySprints 代替 sprints -->
          <div v-for="s in displaySprints" :key="s.id" class="card-box"
              style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #eee; margin-bottom: 10px">
            <div>
              <strong>{{ s.name }}</strong><br>
              <small>📅 {{ formatDate(s.start_date) }} - {{ formatDate(s.deadline) }}</small>
            </div>
            <div>
              <!-- 狀態標籤顏色適配 -->
              <span 
                class="status-badge"
                :style="{ 
                  backgroundColor: s.status === 'IN PROGRESS' ? '#e3fcef' : s.status === 'DONE' ? '#e6f7ff' : '#f4f5f7',
                  color: s.status === 'IN PROGRESS' ? '#006644' : s.status === 'DONE' ? '#0052cc' : '#5e6c84',
                  border: s.status === 'IN PROGRESS' ? '1px solid #006644' : 'none'
                }"
              >
                {{ s.status }}
              </span>
            </div>
            <div style="display: flex; gap: 10px">
              <button class="btn" style="background: #f4f5f7" @click="openSprintPage(s)">📊 View Board</button>
              <button v-if="isPM" class="btn" style="background: #f4f5f7" @click="openSprintEdit(s)">⚙️ Edit</button>
            </div>
          </div>
          
          <!-- 如果沒選專案且沒數據時的提示 -->
          <div v-if="displaySprints.length === 0" style="text-align: center; color: #999; padding: 20px;">
            No sprints defined for this project.
          </div>
        </div>
      </div>

      <!-- Sprint Detail Page  -->
      <div v-if="currentPage === 'sprintDetail'">
        <!-- 頂部標題與倒計時 -->
        <div class="card-box" style="display: flex; justify-content: space-between; border-left: 6px solid #0052cc">
          <div>
            <h2 style="margin: 0">{{ currentSprint?.name }} Dashboard</h2>
            <p>Timeline: {{ formatDate(currentSprint?.start_date) }} to {{ formatDate(currentSprint?.deadline) }}</p>
          </div>
          <div style="text-align: right">
            <div style="font-size: 24px; font-weight: bold; color: var(--danger)">{{ countdownString }}</div>
            <small>Remaining</small>
          </div>
        </div>

        <div class="metrics-container">
          <!-- 左側：Sprint 進度條 -->
          <div class="card-box" style="flex: 1">
            <h4>Sprint Progress</h4>
            <div style="font-size: 14px; margin-bottom: 10px">Total Issues: <strong>{{ currentSprintTasks.length }}</strong></div>
            <div style="font-size: 14px; margin-bottom: 10px">
              Done: <strong style="color: var(--success)">{{ doneCount }}</strong>
            </div>
            <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden">
              <div :style="{ width: sprintProgress + '%', height: '100%', background: 'var(--success)' }"></div>
            </div>
          </div>

          <!-- 右側：工作量統計圖 (Role Workload) -->
          <div class="card-box" style="flex: 2.5">
            <h4 style="margin: 0 0 10px 0">Role Workload: Done (Blue) vs Pending (Yellow)</h4>
            <div id="burnDownChart" style="width: 100%; height: 250px"></div>
          </div>
        </div>

        <!-- 下方：任務明細表格 -->
        <div class="card-box">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px">
            <thead>
              <tr style="background: #f4f5f7; border-bottom: 2px solid #ddd; text-align: left">
                <th style="padding: 10px">Title</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th v-if="isPM">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in currentSprintTasks" :key="t.id" style="border-bottom: 1px solid #eee">
                <td style="padding: 10px; color: #0052cc; font-weight: bold; cursor: pointer" @click="openTaskEdit(t)">
                  {{ t.title }}
                </td>
                <td>{{ t.assignee || 'Unassigned' }}</td>
                <td>{{ t.priority }}</td>
                <td>
                  <span :class="['status-badge', t.status === 'Done' ? 'bg-ongoing' : '']" 
                        style="font-size: 10px; padding: 2px 8px">
                    {{ t.status }}
                  </span>
                </td>
                <td v-if="isPM">
                  <button class="btn" style="color: var(--danger); font-size: 12px" @click="removeFromSprint(t)">Remove</button>
                </td>
              </tr>
              <tr v-if="currentSprintTasks.length === 0">
                <td colspan="5" style="text-align: center; padding: 20px; color: #999">No tasks in this sprint.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    <!-- Modals (Task Edit) -->
    <div class="modal-overlay" v-if="showTaskModal" @click.self="showTaskModal = false">
      <div class="jira-modal">
        <div class="modal-header">
          <div style="font-weight: bold">TASK-{{ taskForm.id || 'NEW' }} | {{ taskForm.title }}</div>
          <div>
            <button class="btn" @click="showTaskModal = false">Close</button>
            <button class="btn btn-primary" @click="saveTask" style="margin-left: 10px">Save Changes</button>
          </div>
        </div>
        <div class="modal-body">
          <div style="flex: 2">
            <div class="field-group">
              <label>Summary / Title</label>
              <input type="text" class="field-input" v-model="taskForm.title" :disabled="!isBA && !isPM">
            </div>
            <div class="field-group">
              <label>User Story</label>
              <textarea class="field-input" rows="3" v-model="taskForm.userStory" :disabled="!isBA && !isPM"></textarea>
            </div>
            <div class="field-group">
              <label>Project Name (Required)</label>
              <input type="text" class="field-input" v-model="taskForm.project" :disabled="!isPM">
            </div>
          </div>
          <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 4px">
            <div class="field-group">
              <label>Status</label>
              <select class="field-input" v-model="taskForm.status">
                <option value="Backlog">Backlog</option>
                <option value="Dev">Dev</option>
                <option value="SIT">SIT</option>
                <option value="UAT">UAT</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div class="field-group">
              <label>Assignee Role</label>
              <select class="field-input" v-model="taskForm.role">
                <option v-for="r in ['UAT User','Developer','Project Manager','Tester','Business Analyst']" :value="r">{{r}}</option>
              </select>
            </div>
            <div class="field-group">
              <label>Priority</label>
              <select class="field-input" v-model="taskForm.priority">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'

// ==================== Data ====================
const currentPage = ref('dashboard')
const tasks = ref([])
const sprints = ref([])
const allProjects = ref([])
const selectedProjectName = ref('')

const showTaskModal = ref(false)
const showSprintModal = ref(false)
const taskForm = ref({})
const sprintForm = ref({})
const currentUserRole = ref('')
const currentUserName = ref('')
const currentSprint = ref(null)
const countdownString = ref('--')

// ==================== Computed ====================
const isPM = computed(() => currentUserRole.value === 'Project Manager')
const isBA = computed(() => currentUserRole.value === 'Business Analyst')
const isDev = computed(() => currentUserRole.value === 'Developer')
const isTester = computed(() => currentUserRole.value === 'Tester')

const dynamicMetrics = computed(() => {
  const total = tasks.value.length;
  const doneCount = tasks.value.filter(t => t.status === 'Done').length;
  const activeCount = total - doneCount;

  return {
    completionRate: total ? Math.round((doneCount / total) * 100) : 0,
    activeIssues: activeCount
  }
})

const currentSprintTasks = computed(() => 
  currentSprint.value ? tasks.value.filter(t => t.sprint === currentSprint.value.id) : []
)

const sprintProgress = computed(() => {
  if (!currentSprintTasks.value.length) return 0
  const done = currentSprintTasks.value.filter(t => t.status === 'completed').length
  return Math.round((done / currentSprintTasks.value.length) * 100)
})

const doneCount = computed(() => 
  currentSprintTasks.value.filter(t => t.status === 'completed').length
)

// ==================== Methods ====================
const fetchData = async () => {
  try {
    // 1. 從 localStorage 獲取當前用戶資訊
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    // 2. 構建 Task 請求 URL
    let taskUrl = 'http://localhost:3000/api/tasks';
    if (selectedProjectName.value) {
      taskUrl += `?project=${encodeURIComponent(selectedProjectName.value)}`;
    }

    // 3. 【重點】構建 Project 請求 URL，帶上權限參數
    const projectUrl = `http://localhost:3000/api/projects?userId=${user.id}&role=${user.role}&userName=${user.name}`;

    const [tRes, sRes, pRes] = await Promise.all([
      fetch(taskUrl),
      fetch('http://localhost:3000/api/fyp/sprints'),
      fetch(projectUrl) // 使用帶參數的 URL
    ]);

    const taskJson = await tRes.json();
    tasks.value = taskJson.data || [];

    const sprintJson = await sRes.json();
    sprints.value = Array.isArray(sprintJson) ? sprintJson : (sprintJson.data || []);

    const projJson = await pRes.json();
    // 獲取後端傳回的 data 陣列
    allProjects.value = projJson.data || [];

    nextTick(() => {
      initPie();
      if (currentPage.value === 'sprintDetail') initLineChart();
    });
  } catch (err) {
    console.error('Fetch data failed:', err);
  }
};

const getTasksByStatus = (status) => {
  // status 傳入參數將改為: 'Backlog', 'Dev', 'SIT', 'UAT', 'Done'
  return tasks.value.filter(t => t.status === status);
}
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A'

const formatForInput = (d) => d ? new Date(d).toISOString().slice(0, 16) : ''

const initPie = () => {
  const dom = document.getElementById('statusPieChart')
  if (!dom) return
  
  const statusList = ['Backlog', 'Dev', 'SIT', 'UAT', 'Done'];
  const colors = ['#95a5a6', '#e67e22', '#f1c40f', '#9b59b6', '#1890ff']; // 灰, 橙, 黃, 紫, 藍

  const chartData = statusList.map((status, index) => ({
    value: getTasksByStatus(status).length,
    name: status,
    itemStyle: { color: colors[index] }
  }));

  echarts.init(dom).setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: chartData
    }]
  })
}

const initLineChart = () => {
  const dom = document.getElementById('burnDownChart')
  if (!dom) return
  const chart = echarts.init(dom)

  const stages = ['Analysis', 'Development', 'Testing']
  const done = stages.map(s => 
    currentSprintTasks.value.filter(t => 
      (t.role === s || (t.assignee && t.assignee.toLowerCase().includes(s.toLowerCase().substring(0, 4)))) &&
      t.status === 'completed'
    ).length
  )
  const pending = stages.map(s => 
    currentSprintTasks.value.filter(t => 
      (t.role === s || (t.assignee && t.assignee.toLowerCase().includes(s.toLowerCase().substring(0, 4)))) &&
      t.status !== 'completed'
    ).length
  )

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Done', 'Pending'], bottom: 0 },
    grid: { left: '20%', right: '10%', top: '10%', bottom: '15%' },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: ['Analysis (BA)', 'Development (Dev)', 'Testing (QA)'] },
    series: [
      { name: 'Done', type: 'bar', data: done, itemStyle: { color: '#1890ff' }, label: { show: true, position: 'insideRight' } },
      { name: 'Pending', type: 'bar', data: pending, itemStyle: { color: '#faad14' }, label: { show: true, position: 'insideRight' } }
    ]
  })
}

const openTaskEdit = (task) => {
  taskForm.value = task ? { ...task } : { 
    title: '', status: 'To Do', priority: 'Medium', 
    project: selectedProjectName.value || 'Default Project' 
  }
  showTaskModal.value = true
}

const saveTask = async () => {
  const url = taskForm.value.id ? `http://localhost:3000/api/tasks/${taskForm.value.id}` : `http://localhost:3000/api/tasks`
  await fetch(url, {
    method: taskForm.value.id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskForm.value)
  })
  showTaskModal.value = false
  fetchData()
}

const openSprintEdit = (s) => {
  if (s) {
    sprintForm.value = { 
      ...s, 
      start_date: formatForInput(s.start_date), 
      deadline: formatForInput(s.deadline) 
    }
  } else {
    sprintForm.value = { name: '', status: 'todo', start_date: '', deadline: '' }
  }
  showSprintModal.value = true
}

const saveSprint = async () => {
  const method = sprintForm.value.id ? 'PUT' : 'POST'
  const url = sprintForm.value.id 
    ? `http://localhost:3000/api/fyp/sprints/${sprintForm.value.id}` 
    : `http://localhost:3000/api/fyp/sprints`
  
  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sprintForm.value)
  })
  
  showSprintModal.value = false
  await fetchData()
}

const removeFromSprint = async (t) => {
  if (!confirm("Remove from this sprint?")) return
  t.sprint = null
  await fetch(`http://localhost:3000/api/tasks/${t.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(t)
  })
  await fetchData()
  if (currentPage.value === 'sprintDetail') setTimeout(initLineChart, 300)
}

const goBack = () => { currentPage.value = 'dashboard'; fetchData() }

const openSprintPage = (s) => {
  currentPage.value = 'sprintDetail'
  currentSprint.value = s
  startCountdown()
  setTimeout(initLineChart, 500)
}

const startCountdown = () => {
  const update = () => {
    if (!currentSprint.value?.deadline) return
    const diff = new Date(currentSprint.value.deadline) - new Date()
    if (diff < 0) {
      countdownString.value = "ENDED"
      return
    }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    countdownString.value = `${d}d ${h}h`
  }
  update()
  setInterval(update, 60000)
}

const displaySprints = computed(() => {
  // 1. 如果沒選專案，顯示資料庫裡原始的內容
  if (!selectedProjectName.value) return sprints.value;

  const proj = allProjects.value.find(p => p.name === selectedProjectName.value);
  if (!proj || !proj.start_date || !proj.end_date) return [];

  const count = proj.sprint_count || 1;
  const projectStart = new Date(proj.start_date);
  const projectEnd = new Date(proj.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 只比較日期，不比較時間

  // 計算專案總天數和每個 Sprint 的平均天數
  const totalDays = Math.floor((projectEnd - projectStart) / (1000 * 60 * 60 * 24));
  const daysPerSprint = Math.floor(totalDays / count);

  const result = [];

  for (let i = 1; i <= count; i++) {
    // 計算該 Sprint 的開始與結束日期
    const sStart = new Date(projectStart);
    sStart.setDate(projectStart.getDate() + (i - 1) * daysPerSprint);
    
    const sEnd = new Date(sStart);
    // 最後一個 Sprint 確保對齊專案結束日
    if (i === count) {
      sEnd.setTime(projectEnd.getTime());
    } else {
      sEnd.setDate(sStart.getDate() + daysPerSprint - 1);
    }

    // 判斷狀態邏輯
    let calculatedStatus = '';
    const checkStart = new Date(sStart);
    checkStart.setHours(0,0,0,0);
    const checkEnd = new Date(sEnd);
    checkEnd.setHours(23,59,59,999);

    if (today < checkStart) {
      calculatedStatus = 'PLANNED';
    } else if (today > checkEnd) {
      calculatedStatus = 'DONE';
    } else {
      calculatedStatus = 'IN PROGRESS';
    }

    result.push({
      id: `auto-${proj.id}-${i}`,
      name: `Sprint ${i}`,
      start_date: sStart,
      deadline: sEnd,
      status: calculatedStatus
    });
  }

  return result;
});

// ==================== Mounted ====================
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{"role":"Project Manager","name":"Admin User"}')
  currentUserRole.value = user.role
  currentUserName.value = user.name
  fetchData()
})
</script>

<style scoped>
/* 保持你的原有 CSS ... */
:root {
  --primary: #2c3e50;
  --success: #2ecc71;
  --warning: #f1c40f;
  --danger: #e74c3c;
  --bg-body: #f4f5f7;
  --border: #dfe1e6;
}

body {
  background-color: var(--bg-body);
  color: #172b4d;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.top-bar {
  background-color: var(--primary);
  color: white;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-nav {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
  text-decoration: none;
  font-size: 13px;
  margin-right: 10px;
}

.container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}

.card-box {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.metrics-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  flex: 1;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #eee;
}

.metric-card .val {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary);
  margin-top: 5px;
}

.board-columns {
  display: flex;
  gap: 20px;
}

.board-column {
  flex: 1;
  background: #ebecf0;
  padding: 10px;
  border-radius: 8px;
  min-height: 450px;
  border-top: 4px solid #ccc;
}

.task-card {
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(9,30,66,0.2);
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
  border-left: 5px solid #ddd;
}

.priority-High { border-left-color: var(--danger) !important; }
.priority-Medium { border-left-color: var(--warning) !important; }
.priority-Low { border-left-color: var(--success) !important; }

.test-tag {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 10px;
  color: #1890ff;
  font-weight: bold;
  background: #e6f7ff;
  padding: 2px 4px;
  border-radius: 3px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.jira-modal {
  background: white;
  width: 900px;
  max-height: 90vh;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  display: flex;
  padding: 20px;
  gap: 25px;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 15px;
}

.field-group label {
  display: block;
  font-size: 11px;
  font-weight: bold;
  color: #5e6c84;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.field-input {
  width: 100%;
  padding: 8px;
  border: 2px solid #dfe1e6;
  border-radius: 3px;
  font-size: 14px;
  box-sizing: border-box;
}

.field-input:disabled {
  background: #f4f5f7;
  cursor: not-allowed;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background: #0052cc;
  color: white;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

.bg-ongoing {
  background: #e3fcef;
  color: #006644;
}
</style>