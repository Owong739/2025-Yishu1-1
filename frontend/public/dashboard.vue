<!-- App.vue -->
<template>
  <div id="app">
    <div class="top-bar">
      <div>
        <a href="/" class="btn-nav">🏠 Home</a>
        <button v-if="currentPage !== 'dashboard'" class="btn-nav" @click="goBack">
          ← Back
        </button>
        <span style="font-size: 18px; font-weight: bold;">Programme Tracking</span>
      </div>
      <div>
        User: <strong>{{ currentUserName }}</strong>
        <span
          class="status-badge"
          style="background: rgba(255,255,255,0.2); margin-left:10px;"
        >
          {{ currentUserRole }}
        </span>
      </div>
    </div>

    <div class="container">
      <!-- 页面 A: Dashboard 主视图 -->
      <div v-if="currentPage === 'dashboard'">
        <div class="metrics-container">
          <div class="card-box" style="flex:2; display:flex; gap:15px">
            <div class="metric-card">
              <small>OVERALL COMPLETION</small>
              <div class="val" style="color:var(--success)">{{ dynamicMetrics.completionRate }}%</div>
            </div>
            <div class="metric-card">
              <small>ACTIVE ISSUES</small>
              <div class="val" style="color:var(--warning)">{{ dynamicMetrics.activeIssues }}</div>
            </div>
            <div class="metric-card">
              <small>TOTAL ISSUES</small>
              <div class="val">{{ tasks.length }}</div>
            </div>
          </div>

          <div class="card-box" style="flex:1">
            <h4 style="margin:0 0 10px 0">Visual Analysis</h4>
            <div id="statusPieChart" style="height:180px;"></div>
          </div>
        </div>

        <div class="card-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px">
            <h2 style="margin:0">Global Task Board</h2>
            <button v-if="isPM || isBA" class="btn btn-primary" @click="openTaskEdit(null)">
              + Create Issue
            </button>
          </div>

          <div class="board-columns">
            <div
              v-for="col in ['todo', 'inProgress', 'completed']"
              :key="col"
              class="board-column"
              :style="{
                borderTopColor:
                  col==='todo' ? '#2ecc71' : (col==='inProgress' ? '#f1c40f' : '#1890ff')
              }"
            >
              <h4 style="text-transform:uppercase; color:#5e6c84; margin-left:5px">
                {{ col }} ({{ getTasksByStatus(col).length }})
              </h4>

              <div
                v-for="task in getTasksByStatus(col)"
                :key="task.id"
                class="task-card"
                :class="'priority-' + task.priority"
                @click="openTaskEdit(task)"
              >
                <div style="font-weight:bold; font-size:14px;">{{ task.name }}</div>
                <div style="margin-top:8px; font-size:11px; color:#666;">
                  👤 {{ task.assignee || 'Unassigned' }}
                </div>
                <div class="test-tag">{{ task.user_story ? 'test' : 'Backlog' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sprint Management -->
        <div class="card-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h2 style="margin:0">Sprint Management</h2>
          </div>

          <p style="color:#666; font-size:14px; margin-bottom:20px;">
            Organize and track your development cycles.
          </p>

          <div
            v-for="s in sprints"
            :key="s.id"
            class="card-box"
            style="display:flex; justify-content:space-between; align-items:center; padding:15px; border:1px solid #eee; margin-bottom:10px;"
          >
            <div>
              <strong>{{ s.name }}</strong><br />
              <small>📅 {{ formatDate(s.start_date) }} - {{ formatDate(s.deadline) }}</small>
            </div>

            <div>
              <span
                :class="['status-badge', s.status==='In progress' ? 'bg-ongoing' : '']"
              >
                {{ s.status }}
              </span>
            </div>

            <div style="display:flex; gap:10px">
              <button class="btn" style="background:#f4f5f7" @click="openSprintPage(s)">
                📊 View Board
              </button>
              <button
                class="btn"
                style="background:#f4f5f7"
                v-if="isPM"
                @click="openSprintEdit(s)"
              >
                ⚙️ Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 页面 B: Sprint 详情 -->
      <div v-if="currentPage === 'sprintDetail'">
        <div class="card-box" style="display:flex; justify-content:space-between; border-left:6px solid #0052cc">
          <div>
            <h2 style="margin:0">{{ currentSprint.name }} Dashboard</h2>
            <p>Timeline: {{ formatDate(currentSprint.start_date) }} to {{ formatDate(currentSprint.deadline) }}</p>
          </div>
          <div style="text-align:right">
            <div style="font-size:24px; font-weight:bold; color:var(--danger)">{{ countdownString }}</div>
            <small>Remaining</small>
          </div>
        </div>

        <div class="metrics-container">
          <div class="card-box" style="flex:1">
            <h4>Sprint Progress</h4>
            <div style="font-size:14px; margin-bottom:10px">
              Total Issues: <strong>{{ currentSprintTasks.length }}</strong>
            </div>
            <div style="font-size:14px; margin-bottom:10px">
              Done:
              <strong style="color:var(--success)">
                {{ currentSprintTasks.filter(t => t.status==='completed').length }}
              </strong>
            </div>

            <div style="width:100%; height:8px; background:#eee; border-radius:4px; overflow:hidden">
              <div
                :style="{
                  width: sprintProgress + '%',
                  height: '100%',
                  background: 'var(--success)'
                }"
              ></div>
            </div>
          </div>

          <div class="card-box" style="flex:2.5">
            <h4 style="margin:0 0 10px 0">Role Workload: Done (Blue) vs Pending (Yellow)</h4>
            <div id="burnDownChart" style="width:100%; height:250px;"></div>
          </div>
        </div>

        <div class="card-box">
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <tr style="background:#f4f5f7; border-bottom:2px solid #ddd; text-align:left">
              <th style="padding:10px">Title</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Status</th>
              <th v-if="isPM">Action</th>
            </tr>

            <tr
              v-for="t in currentSprintTasks"
              :key="t.id"
              style="border-bottom:1px solid #eee"
            >
              <td style="padding:10px; color:#0052cc; font-weight:bold; cursor:pointer" @click="openTaskEdit(t)">
                {{ t.name }}
              </td>
              <td>{{ t.assignee }}</td>
              <td>{{ t.priority }}</td>
              <td>{{ t.status }}</td>
              <td v-if="isPM">
                <button class="btn" style="color:var(--danger); font-size:12px;" @click="removeFromSprint(t)">
                  Remove
                </button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- 任务编辑器 -->
    <div class="modal-overlay" v-if="showTaskModal" @click.self="showTaskModal = false">
      <div class="jira-modal">
        <div class="modal-header">
          <div style="font-weight:bold">
            TASK-{{ taskForm.id || 'NEW' }} | {{ taskForm.name }}
          </div>
          <div>
            <button class="btn" @click="showTaskModal = false">Close</button>
            <button class="btn btn-primary" @click="saveTask" style="margin-left:10px">
              Save Changes
            </button>
          </div>
        </div>

        <div class="modal-body">
          <div style="flex:2">
            <div class="field-group">
              <label>Summary / Title</label>
              <input type="text" class="field-input" v-model="taskForm.name" :disabled="!isBA && !isPM" />
            </div>

            <div class="field-group">
              <label>Description</label>
              <textarea class="field-input" rows="3" v-model="taskForm.description" :disabled="!isBA && !isPM"></textarea>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px">
              <div class="field-group">
                <label>Code Link (Dev)</label>
                <input type="text" class="field-input" v-model="taskForm.code_url" :disabled="!isDev && !isPM" />
              </div>
              <div class="field-group">
                <label>Test Doc (Tester)</label>
                <input type="text" class="field-input" v-model="taskForm.test_case_url" :disabled="!isTester && !isPM" />
              </div>
            </div>
          </div>

          <div style="flex:1; background:#f9fafb; padding:15px; border-radius:4px">
            <div class="field-group">
              <label>Status</label>
              <select class="field-input" v-model="taskForm.status" :disabled="!isPM">
                <option value="todo">TO DO</option>
                <option value="inProgress">IN PROGRESS</option>
                <option value="completed">COMPLETED</option>
              </select>
            </div>

            <div class="field-group">
              <label>Assignee Role</label>
              <select class="field-input" v-model="taskForm.assignee" :disabled="!isPM">
                <option value="">-- Unassigned --</option>
                <option v-for="role in ['UAT user','Developer','Product Manager','Tester','Business Analyst']" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>

            <div class="field-group">
              <label>Priority</label>
              <select class="field-input" v-model="taskForm.priority" :disabled="!isBA && !isPM">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div class="field-group">
              <label>Sprint</label>
              <select class="field-input" v-model="taskForm.sprint_id" :disabled="!isPM">
                <option v-for="s in sprints" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sprint 编辑/创建弹窗 -->
    <div class="modal-overlay" v-if="showSprintModal" @click.self="showSprintModal = false">
      <div class="jira-modal" style="width:500px">
        <div class="modal-header">
          <h3>{{ sprintForm.id ? 'Edit Sprint' : 'Create New Sprint' }}</h3>
        </div>

        <div class="modal-body" style="display:block">
          <div class="field-group">
            <label>Sprint Name</label>
            <input type="text" class="field-input" v-model="sprintForm.name" />
          </div>

          <div class="field-group">
            <label>Status</label>
            <select class="field-input" v-model="sprintForm.status">
              <option value="todo">Plan</option>
              <option value="In progress">On-going</option>
              <option value="completed">Done</option>
            </select>
          </div>

          <div class="field-group">
            <label>Start Date</label>
            <input type="datetime-local" class="field-input" v-model="sprintForm.start_date" />
          </div>

          <div class="field-group">
            <label>Deadline</label>
            <input type="datetime-local" class="field-input" v-model="sprintForm.deadline" />
          </div>
        </div>

        <div class="modal-header" style="justify-content:flex-end;">
          <button class="btn" @click="showSprintModal = false" style="margin-right:10px">Cancel</button>
          <button class="btn btn-primary" @click="saveSprint">
            {{ sprintForm.id ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      currentPage: "dashboard",
      tasks: [],
      sprints: [],
      showPie: true,

      showTaskModal: false,
      showSprintModal: false,
      taskForm: {},
      sprintForm: {},

      currentUserRole: "",
      currentUserName: "",
      currentSprint: null,
      countdownString: "--",

      pieChartInstance: null,
      lineChartInstance: null,
      countdownTimer: null,
    };
  },
  computed: {
    isPM() {
      return this.currentUserRole === "Project Manager";
    },
    isBA() {
      return this.currentUserRole === "Business Analyst";
    },
    isDev() {
      return this.currentUserRole === "Developer";
    },
    isTester() {
      return this.currentUserRole === "Tester";
    },
    dynamicMetrics() {
      const done = this.tasks.filter((t) => t.status === "completed").length;
      return {
        completionRate: Math.round((done / (this.tasks.length || 1)) * 100),
        activeIssues: this.tasks.filter((t) => t.status !== "completed").length,
      };
    },
    currentSprintTasks() {
      return this.currentSprint ? this.tasks.filter((t) => t.sprint_id === this.currentSprint.id) : [];
    },
    sprintProgress() {
      if (!this.currentSprintTasks.length) return 0;
      return Math.round(
        (this.currentSprintTasks.filter((t) => t.status === "completed").length / this.currentSprintTasks.length) * 100
      );
    },
  },
  mounted() {
    // Keep your original localStorage approach
    const user = JSON.parse(localStorage.getItem("user") || '{"role":"Project Manager","name":"Lucas"}');
    this.currentUserRole = user.role;
    this.currentUserName = user.name;

    this.fetchData();
  },
  methods: {
    async fetchData() {
      const tRes = await fetch("http://localhost:3000/api/fyp/tasks");
      this.tasks = await tRes.json();

      const sRes = await fetch("http://localhost:3000/api/fyp/sprints");
      this.sprints = await sRes.json();

      this.$nextTick(() => {
        this.initPie();
      });
    },

    getTasksByStatus(s) {
      return this.tasks.filter((t) => t.status === s);
    },

    formatDate(d) {
      return d ? new Date(d).toLocaleDateString() : "N/A";
    },

    formatForInput(d) {
      return d ? new Date(d).toISOString().slice(0, 16) : "";
    },

    initPie() {
      const dom = document.getElementById("statusPieChart");
      if (!dom || typeof echarts === "undefined") return;

      if (this.pieChartInstance) this.pieChartInstance.dispose();
      const chart = echarts.init(dom);
      this.pieChartInstance = chart;

      chart.setOption({
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            data: [
              {
                value: this.tasks.filter((t) => t.status === "todo").length,
                name: "To Do",
                itemStyle: { color: "#52c41a" },
              },
              {
                value: this.tasks.filter((t) => t.status === "inProgress").length,
                name: "In Progress",
                itemStyle: { color: "#faad14" },
              },
              {
                value: this.tasks.filter((t) => t.status === "completed").length,
                name: "Completed",
                itemStyle: { color: "#1890ff" },
              },
            ],
          },
        ],
      });
    },

    initLineChart() {
      const dom = document.getElementById("burnDownChart");
      if (!dom || typeof echarts === "undefined") return;

      if (this.lineChartInstance) this.lineChartInstance.dispose();
      const chart = echarts.init(dom);
      this.lineChartInstance = chart;

      const stages = ["Analysis", "Development", "Testing"];

      const done = stages.map((s) => {
        return this.currentSprintTasks.filter((t) => {
          const isMatch =
            t.stage === s ||
            (t.assignee && t.assignee.toLowerCase().includes(s.toLowerCase().substring(0, 4)));

          return isMatch && t.status === "completed";
        }).length;
      });

      const pending = stages.map((s) => {
        return this.currentSprintTasks.filter((t) => {
          const isMatch =
            t.stage === s ||
            (t.assignee && t.assignee.toLowerCase().includes(s.toLowerCase().substring(0, 4)));

          return isMatch && t.status !== "completed";
        }).length;
      });

      chart.setOption({
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        legend: { data: ["Done", "Pending"], bottom: 0 },
        grid: { left: "20%", right: "10%", top: "10%", bottom: "15%" },
        xAxis: { type: "value", minInterval: 1 },
        yAxis: { type: "category", data: ["Analysis (BA)", "Development (Dev)", "Testing (QA)"] },
        series: [
          {
            name: "Done",
            type: "bar",
            data: done,
            itemStyle: { color: "#1890ff" },
            label: { show: true, position: "insideRight" },
          },
          {
            name: "Pending",
            type: "bar",
            data: pending,
            itemStyle: { color: "#faad14" },
            label: { show: true, position: "insideRight" },
          },
        ],
      });
    },

    openTaskEdit(task) {
      this.taskForm = task
        ? { ...task }
        : {
            name: "",
            status: "todo",
            priority: "Medium",
            sprint_id: this.currentSprint ? this.currentSprint.id : null,
            assignee: "",
          };

      this.showTaskModal = true;
    },

    async saveTask() {
      const url = this.taskForm.id
        ? `http://localhost:3000/api/fyp/tasks/${this.taskForm.id}`
        : `http://localhost:3000/api/fyp/tasks`;

      await fetch(url, {
        method: this.taskForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.taskForm),
      });

      this.showTaskModal = false;
      await this.fetchData();

      if (this.currentPage === "sprintDetail") {
        setTimeout(() => this.initLineChart(), 500);
      }
    },

    openSprintEdit(s) {
      if (s) {
        this.sprintForm = {
          ...s,
          start_date: this.formatForInput(s.start_date),
          deadline: this.formatForInput(s.deadline),
        };
      } else {
        this.sprintForm = { name: "", status: "todo", start_date: "", deadline: "" };
      }
      this.showSprintModal = true;
    },

    async saveSprint() {
      const method = this.sprintForm.id ? "PUT" : "POST";
      const url = this.sprintForm.id
        ? `http://localhost:3000/api/fyp/sprints/${this.sprintForm.id}`
        : `http://localhost:3000/api/fyp/sprints`;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.sprintForm),
      });

      this.showSprintModal = false;
      await this.fetchData();
    },

    async removeFromSprint(t) {
      if (!confirm("Remove from this sprint?")) return;

      t.sprint_id = null;
      await fetch(`http://localhost:3000/api/fyp/tasks/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });

      await this.fetchData();
      setTimeout(() => this.initLineChart(), 300);
    },

    goBack() {
      this.currentPage = "dashboard";
      this.fetchData();
    },

    openSprintPage(s) {
      this.currentPage = "sprintDetail";
      this.currentSprint = s;

      this.startCountdown();

      setTimeout(() => this.initLineChart(), 500);
    },

    startCountdown() {
      if (this.countdownTimer) clearInterval(this.countdownTimer);

      const update = () => {
        const diff = new Date(this.currentSprint.deadline) - new Date();
        if (diff < 0) {
          this.countdownString = "ENDED";
          return;
        }
        const d = Math.floor(diff / 86400000);
        this.countdownString = `${d}d ${Math.floor((diff % 86400000) / 3600000)}h`;
      };

      update();
      this.countdownTimer = setInterval(update, 60000);
    },
  },
  beforeUnmount() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.pieChartInstance) this.pieChartInstance.dispose();
    if (this.lineChartInstance) this.lineChartInstance.dispose();
  },
};
</script>

<style>
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
  font-family: -apple-system, sans-serif;
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

.metrics-container { display: flex; gap: 20px; margin-bottom: 20px; }
.metric-card { flex: 1; padding: 20px; background: #fafafa; border-radius: 6px; text-align: center; border: 1px solid #eee; }
.metric-card .val { font-size: 28px; font-weight: bold; color: var(--primary); margin-top: 5px; }

/* Kanban Style */
.board-columns { display: flex; gap: 20px; }
.board-column { flex: 1; background: #ebecf0; padding: 10px; border-radius: 8px; min-height: 450px; border-top: 4px solid #ccc; }
.task-card { background: white; padding: 12px; border-radius: 4px; box-shadow: 0 1px 2px rgba(9,30,66,0.2); margin-bottom: 10px; cursor: pointer; position: relative; border-left: 5px solid #ddd; }
.priority-High { border-left-color: var(--danger) !important; }
.priority-Medium { border-left-color: var(--warning) !important; }
.priority-Low { border-left-color: var(--success) !important; }
.test-tag { position: absolute; right: 10px; bottom: 10px; font-size: 10px; color: #1890ff; font-weight: bold; background: #e6f7ff; padding: 2px 4px; border-radius: 3px; }

/* Modal - Jira Style */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.jira-modal { background: white; width: 900px; max-height: 90vh; border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
.modal-body { display: flex; padding: 20px; gap: 25px; overflow-y: auto; }

.field-group { margin-bottom: 15px; }
.field-group label { display: block; font-size: 11px; font-weight: bold; color: #5e6c84; margin-bottom: 5px; text-transform: uppercase; }
.field-input { width: 100%; padding: 8px; border: 2px solid #dfe1e6; border-radius: 3px; font-size: 14px; box-sizing: border-box; }
.field-input:disabled { background: #f4f5f7; cursor: not-allowed; }

.btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; }
.btn-primary { background: #0052cc; color: white; }

.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.bg-ongoing { background: #e3fcef; color: #006644; }
</style>