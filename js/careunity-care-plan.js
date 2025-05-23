// CareUnity Care Plan Management
class CarePlanManager {
  constructor(db) {
    this.db = db;
    this.init();
  }
  
  async init() {
    // Initialize care plan related event listeners
    this.setupEventListeners();
    console.log('Care Plan Manager initialized');
  }
  
  setupEventListeners() {    // Add new care plan button
    const addCarePlanBtn = document.getElementById('open-care-plan-modal');
    if (addCarePlanBtn) {
      addCarePlanBtn.addEventListener('click', () => this.showAddCarePlanModal());
    }
    
    // Close modal buttons
    document.querySelectorAll('#care-plan-modal .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.hideAddCarePlanModal());
    });
    
    // Save care plan button
    const saveCarePlanBtn = document.getElementById('save-care-plan-btn');
    if (saveCarePlanBtn) {
      saveCarePlanBtn.addEventListener('click', () => this.saveCarePlan());
    }
    
    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.addTaskField());
    }
  }
  
  showAddCarePlanModal() {
    const modal = document.getElementById('care-plan-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }
  
  hideAddCarePlanModal() {
    const modal = document.getElementById('care-plan-modal');
    if (modal) {
      modal.classList.add('hidden');
      
      // Reset the form
      const form = document.getElementById('care-plan-form');
      if (form) {
        form.reset();
      }
      
      // Clear any dynamically added task fields
      const tasksList = document.getElementById('plan-tasks');
      if (tasksList) {
        // Keep only the first task field
        const taskFields = tasksList.querySelectorAll('.task-field');
        for (let i = 1; i < taskFields.length; i++) {
          taskFields[i].remove();
        }
      }
    }
  }
  
  addTaskField() {
    const tasksList = document.getElementById('plan-tasks');
    if (tasksList) {
      const taskCount = tasksList.querySelectorAll('.task-field').length;
      const newTaskField = document.createElement('div');
      newTaskField.className = 'task-field mb-2 flex';
      newTaskField.innerHTML = `
        <input type="text" name="task${taskCount + 1}" class="flex-grow border border-gray-300 rounded-md p-2" placeholder="Enter task...">
        <button type="button" class="remove-task-btn ml-2 text-red-500 p-2">
          <span class="material-icons">remove_circle</span>
        </button>
      `;
      
      // Add event listener to the remove button
      const removeBtn = newTaskField.querySelector('.remove-task-btn');
      removeBtn.addEventListener('click', () => {
        newTaskField.remove();
      });
      
      tasksList.appendChild(newTaskField);
    }
  }
  
  async saveCarePlan() {
    try {
      // Get form data
      const name = document.getElementById('plan-name').value;
      const serviceUser = document.getElementById('plan-service-user').value;
      
      // Validate the form
      if (!name || !serviceUser) {
        this.showError('Please fill in all required fields');
        return;
      }
      
      // Get tasks
      const taskInputs = document.querySelectorAll('#plan-tasks input[type="text"]');
      const tasks = Array.from(taskInputs).map(input => input.value).filter(task => task.trim() !== '');
      
      if (tasks.length === 0) {
        this.showError('Please add at least one task');
        return;
      }
      
      // Create care plan object
      const carePlan = {
        id: 'cp_' + Date.now(),
        name: name,
        serviceUserId: serviceUser,
        status: 'active',
        tasks: tasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to database if available
      if (this.db) {
        await this.db.put('carePlans', carePlan);
        console.log('Care plan saved to database:', carePlan);
      } else {
        // Fallback to localStorage if no database
        const carePlans = JSON.parse(localStorage.getItem('carePlans') || '[]');
        carePlans.push(carePlan);
        localStorage.setItem('carePlans', JSON.stringify(carePlans));
        console.log('Care plan saved to localStorage:', carePlan);
      }
      
      // Hide modal
      this.hideAddCarePlanModal();
      
      // Show success message
      this.showSuccess('Care plan created successfully');
      
      // Refresh care plans list
      this.loadCarePlans();
    } catch (error) {
      console.error('Error saving care plan:', error);
      this.showError('Failed to save care plan');
    }
  }
  
  showError(message) {
    if (window.CareUnity && window.CareUnity.notificationManager) {
      window.CareUnity.notificationManager.addNotification({
        title: 'Error',
        message: message,
        icon: 'error'
      });
    } else {
      alert(message);
    }
  }
  
  showSuccess(message) {
    if (window.CareUnity && window.CareUnity.notificationManager) {
      window.CareUnity.notificationManager.addNotification({
        title: 'Success',
        message: message,
        icon: 'check_circle'
      });
    } else {
      alert(message);
    }
  }
  
  async loadCarePlans() {
    try {
      // This is where you would load care plans from the database
      // and update the UI accordingly
      
      // For now, just log a message
      console.log('Loading care plans...');
      
      // Force a refresh of the UI by triggering the refreshUI function
      if (window.refreshUI) {
        await window.refreshUI();
      }
    } catch (error) {
      console.error('Error loading care plans:', error);
    }
  }
}

// Make the class available globally
window.CareUnity = window.CareUnity || {};
window.CareUnity.CarePlanManager = CarePlanManager;
