import { ref, reactive } from 'vue'

export default {
  setup() {
    const isAdmin = ref(true)  // 改 false 就變成 staff 只能改 status

    const tasks = ref([
      { id: '001', title: 'Home page, after login', status: 'To Do', priority: 'High',
        description: 'system home page, after login', assignee: 'Tom', dueDate: '2025-12-20' }
    ])

    const isEditing = ref(false)
    const currentTask = reactive({
      id: '', title: '', description: '', status: 'To Do',
      priority: 'Medium', assignee: 'Sam', dueDate: ''
    })

    // Modal 相關
    const showCreateModal = ref(false)
    const newTask = reactive({
      id: '', title: '', description: '', status: 'To Do',
      priority: 'Medium', assignee: 'Sam', dueDate: ''
    })

    const openCreateModal = () => {
      const nextId = String(tasks.value.length + 1).padStart(3, '0')
      Object.assign(newTask, {
        id: nextId,
        title: '', description: '', status: 'To Do',
        priority: 'Medium', assignee: 'Sam', dueDate: ''
      })
      showCreateModal.value = true
    }

    const closeCreateModal = () => {
      showCreateModal.value = false
    }

    const confirmCreate = () => {
      tasks.value.push({ ...newTask })
      alert('Task created successfully!')
      closeCreateModal()
    }

    const editTask = (task) => {
      Object.assign(currentTask, { ...task })
      isEditing.value = true
    }

    const saveTask = () => {
      const idx = tasks.value.findIndex(t => t.id === currentTask.id)
      if (idx !== -1) tasks.value[idx] = { ...currentTask }
      alert('Task updated!')
    }

    return {
      isAdmin, tasks, isEditing, currentTask,
      editTask, saveTask,
      showCreateModal, openCreateModal, closeCreateModal, confirmCreate, newTask
    }
  }
}