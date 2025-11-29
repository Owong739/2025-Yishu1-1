<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1>Project : food ordering</h1>
     
      
    </header>
    <button @click="openCreateModal" class="create-header-btn">+ Create New Task</button>
    <br><br>
  

      
        <!-- task -->
        <table class="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.title }}</td>
              <td><span :class="['status-badge', task.status.replace(' ', '')]">{{ task.status }}</span></td>
              <td>{{ task.priority }}</td>
              <td>{{ task.description }}</td>
              <td>{{ task.assignee }}</td>
              <td>{{ task.dueDate }}</td>
              <td><button @click="editTask(task)" class="edit-btn">Edit</button></td>
            </tr>
          </tbody>
        </table>

        <!-- Edit form -->
        <div class="form-section">
          <h2>{{ isEditing ? 'Edit Task ID: ' + currentTask.id : 'Home' }}</h2>
          <form @submit.prevent="saveTask">
            <div class="form-grid">
              <div><label>Title</label><input v-model="currentTask.title" type="text" required /></div>
              <div><label>Description</label><textarea v-model="currentTask.description" rows="4"></textarea></div>
              <div class="form-row">
                <div><label>Status</label>
                  <select v-model="currentTask.status">
                    <option>To Do</option><option>In Progress</option><option>Done</option>
                  </select>
                </div>
                <div><label>Priority</label>
                  <select v-model="currentTask.priority" :disabled="!isAdmin">
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div><label>Assign By</label>
                  <select v-model="currentTask.assignee" :disabled="!isAdmin">
                    <option>Sam</option><option>Tom</option><option>John</option><option>Lily</option>
                  </select>
                </div>
                <div><label>Due Date</label><input v-model="currentTask.dueDate" type="date" :disabled="!isAdmin" /></div>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
            </div>
          </form>
        </div>
      
    

    <!-- Modal：add task -->
    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Create New Task</h2>
            <button @click="closeCreateModal" class="close-btn">×</button>
          </div>
          <form @submit.prevent="confirmCreate">
            <div class="form-grid">
              <div><label>ID (auto)</label><input :value="newTask.id" disabled /></div>
              <div><label>Title <span class="required">*</span></label><input v-model="newTask.title" required /></div>
              <div><label>Description</label><textarea v-model="newTask.description" rows="4"></textarea></div>
              <div class="form-row">
                <div><label>Status</label>
                  <select v-model="newTask.status">
                    <option>To Do</option><option>In Progress</option><option>Done</option>
                  </select>
                </div>
                <div><label>Priority</label>
                  <select v-model="newTask.priority" :disabled="!isAdmin">
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div><label>Assignee</label>
                  <select v-model="newTask.assignee" :disabled="!isAdmin">
                    <option>Sam</option><option>Tom</option><option>John</option><option>Lily</option>
                  </select>
                </div>
                <div><label>Due Date</label><input v-model="newTask.dueDate" type="date" :disabled="!isAdmin" /></div>
              </div>
            </div>
            <div class="modal-actions">
              <button type="submit" class="confirm-btn">Confirm Create</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script src="./TaskManager.js"></script>
<style scoped src="./TaskManager.css"></style>