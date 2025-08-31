class AdminDashboard {
  static API_BASE_URL = 'http://localhost:5000/admin';
  static LOGIN_PAGE = 'homepage.html';
  
  
   //Initialize the dashboard and event listeners
   
  constructor() {
    this.token = sessionStorage.getItem('adminToken');
    
    // Authentication check
    if (!this.token) {
      alert('Access denied. Admin login required.');
      window.location.href = AdminDashboard.LOGIN_PAGE;
      return;
    }

    this.initializeEventListeners();
    this.loadAllData();
  }

 
  initializeEventListeners() {
    // Main dashboard controls
    document.getElementById('adminLogout').addEventListener('click', this.logout.bind(this));
    
    // Form submissions
    this.initializeFormListeners();
  }

  initializeFormListeners() {
    const forms = {
      'orderForm': this.submitOrder.bind(this),
      'inventoryForm': this.submitInventoryItem.bind(this),
      'staffForm': this.submitStaffSchedule.bind(this)
    };

    Object.entries(forms).forEach(([formId, handler]) => {
      const form = document.getElementById(formId);
      if (form) {
        form.addEventListener('submit', handler);
      }
    });
  }

  loadAllData() {
    this.fetchReservations();
    this.fetchOrders();
    this.fetchInventory();
    this.fetchStaff();
  }

  logout() {
    sessionStorage.removeItem('adminToken');
    alert('Logged out.');
    window.location.href = AdminDashboard.LOGIN_PAGE;
  }

  /**
   * @param {string} endpoint 
   * @param {Object} options 
   * @returns {Promise<Object>} 
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${AdminDashboard.API_BASE_URL}${endpoint}`;
    const headers = { 
      Authorization: this.token,
      ...(options.headers || {})
    };
    
    try {
      const response = await fetch(url, { ...options, headers });
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }


  async fetchReservations() {
    try {
      const data = await this.apiRequest('/reservations');
      const container = document.getElementById('adminReservationsList');
      
      if (!data.length) {
        container.innerHTML = 'No reservations found.';
        return;
      }
      
      container.innerHTML = '<ul>' + data.map(reservation => `
        <li>
          <strong>${reservation.name}</strong> | ${reservation.date} | ${reservation.reservation_id} | 
          ${reservation.time} | Guests: ${reservation.guests}
        </li>`).join('') + '</ul>';
    } catch (error) {
      console.error('❌ Reservation Fetch Error:', error);
    }
  }


  /**
   * @param {Event} e 
   */
  async submitOrder(e) {
    e.preventDefault();
    
    const tableNumber = document.getElementById('tableNumber').value;
    const items = document.getElementById('itemsOrdered').value.split(',').map(i => i.trim());
    const quantities = document.getElementById('quantities').value.split(',').map(q => parseInt(q.trim()));
    const specialRequest = document.getElementById('specialRequest').value;

    if (items.length !== quantities.length) {
      alert('Items and quantities must match.');
      return;
    }

    const orderItems = items.map((item, index) => ({
      item_name: item,
      quantity: quantities[index]
    }));

    const body = {
      table_number: tableNumber,
      items: orderItems,
      special_request: specialRequest
    };

    try {
      const data = await this.apiRequest('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      alert(data.message);
      this.fetchOrders();
      document.getElementById('orderForm').reset();
    } catch (error) {
      console.error('❌ Order Submit Error:', error);
      alert('Failed to submit order.');
    }
  }


  async fetchOrders() {
    try {
      const data = await this.apiRequest('/orders');
      const container = document.getElementById('liveOrderList');
      
      if (!data.length) {
        container.innerHTML = 'No orders found.';
        return;
      }
      
      container.innerHTML = data.map(order => `
        <li>
          <strong>Table ${order.table_number}</strong><br>
          ${order.items.map(i => `${i.item_name} x${i.quantity}`).join(', ')}<br>
          <em>${order.special_request || ''}</em><br>
          Status: ${order.status || 'Pending'}
        </li>`).join('');
    } catch (error) {
      console.error('❌ Order Fetch Error:', error);
    }
  }


  /**
   * Submit a new inventory item
   * @param {Event} e 
   */
  async submitInventoryItem(e) {
    e.preventDefault();
    
    // Collect form data
    const name = document.getElementById('itemName').value;
    const quantity = parseInt(document.getElementById('itemQty').value);
    const reorder_level = parseInt(document.getElementById('reorderLevel').value);
    const supplier = document.getElementById('supplier').value;

    const item = { item_name: name, quantity, reorder_level, supplier };

    try {
      const data = await this.apiRequest('/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      
      alert(data.message);
      document.getElementById('inventoryForm').reset();
      this.fetchInventory();
    } catch (error) {
      console.error('❌ Inventory Submit Error:', error);
      alert('Failed to add item.');
    }
  }


  async fetchInventory() {
    try {
      const data = await this.apiRequest('/inventory');
      const container = document.getElementById('inventoryList');
      
      if (!data.length) {
        container.innerHTML = 'Inventory empty.';
        return;
      }
      
      container.innerHTML = data.map(item => `
        <li>
          <strong>${item.item_name}</strong>: ${item.quantity} units
          ${item.quantity <= item.reorder_level ? '<span style="color:red;"> (Low Stock)</span>' : ''}<br>
          Supplier: ${item.supplier || 'N/A'}<br>
          <button onclick="adminDashboard.editInventory('${item.item_id}')">Edit</button>
          <button onclick="adminDashboard.deleteInventory('${item.item_id}')">Delete</button>
        </li>`).join('');
    } catch (error) {
      console.error('❌ Inventory Fetch Error:', error);
    }
  }

  /**
   * Edit an inventory item
   * @param {string} itemId 
   */
  async editInventory(itemId) {
    const newQty = prompt('Enter new quantity:');
    if (newQty === null) return;
    
    try {
      const data = await this.apiRequest(`/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseInt(newQty) })
      });
      
      alert(data.message);
      this.fetchInventory();
    } catch (error) {
      console.error('❌ Edit Inventory Error:', error);
      alert('Failed to update item.');
    }
  }

  /**
   * Delete an inventory item
   * @param {string} itemId 
   */
  async deleteInventory(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const data = await this.apiRequest(`/inventory/${itemId}`, {
        method: 'DELETE'
      });
      
      alert(data.message);
      this.fetchInventory();
    } catch (error) {
      console.error('❌ Delete Inventory Error:', error);
      alert('Failed to delete item.');
    }
  }


  /**
   * Submit a new staff schedule
   * @param {Event} e 
   */
  async submitStaffSchedule(e) {
    e.preventDefault();
    
    console.log('📤 Submitting staff schedule...');
    
    // Collect form data
    const name = document.getElementById('staffName').value;
    const position = document.getElementById('staffPosition').value;
    const shift_time = document.getElementById('staffShift').value;
    const hours_worked = parseInt(document.getElementById('staffHours').value);

    const newStaff = { name, position, shift_time, hours_worked };

    try {
      const data = await this.apiRequest('/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      
      alert(data.message);
      document.getElementById('staffForm').reset();
      this.fetchStaff();
    } catch (error) {
      console.error('❌ Staff Submit Error:', error);
      alert('Failed to add staff schedule.');
    }
  }

  /**
   * Fetch and display staff schedules
   */
  async fetchStaff() {
    console.log('📡 Fetching staff with token:', this.token);
    
    try {
      const data = await this.apiRequest('/staff');
      console.log('📦 Staff data:', data);
      
      const container = document.getElementById('staffList');
      
      if (!data.length) {
        container.innerHTML = '<tr><td colspan="4">No staff schedules found.</td></tr>';
        return;
      }
      
      container.innerHTML = data.map(staff => `
        <tr>
          <td>${staff.name}</td>
          <td>${staff.position}</td>
          <td>${staff.shift_time}</td>
          <td>${staff.hours_worked}</td>
          <td>
            <button onclick="adminDashboard.editStaff(${staff.id})">✏️</button>
            <button onclick="adminDashboard.deleteStaff(${staff.id})">🗑️</button>
          </td>
        </tr>`).join('');
    } catch (error) {
      console.error('❌ Staff Fetch Error:', error);
    }
  }

  /**
   * Delete a staff schedule
   * @param {number} id 
   */
  async deleteStaff(id) {
    if (!confirm('Delete this staff schedule?')) return;
    
    try {
      const data = await this.apiRequest(`/staff/${id}`, {
        method: 'DELETE'
      });
      
      alert(data.message);
      this.fetchStaff();
    } catch (error) {
      console.error('❌ Staff Delete Error:', error);
      alert('Failed to delete staff.');
    }
  }

  /**
   * Edit a staff schedule
   * @param {number} id 
   */
  async editStaff(id) {
    const newShift = prompt('Enter new shift time:');
    const newHours = prompt('Enter updated hours worked:');
    
    if (!newShift || !newHours) return;
    
    try {
      const data = await this.apiRequest(`/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shift_time: newShift, 
          hours_worked: parseInt(newHours) 
        })
      });
      
      alert(data.message);
      this.fetchStaff();
    } catch (error) {
      console.error('❌ Staff Edit Error:', error);
      alert('Failed to edit staff schedule.');
    }
  }
}


function initializeRequestForm() {
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(requestForm);
      const body = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('http://localhost:5000/admin/submit-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('adminToken')
          },
          body: JSON.stringify(body)
        });

        const text = await res.text();
        alert(text);
        requestForm.reset();
      } catch (err) {
        console.error('❌ Request Submit Error:', err);
        alert('Failed to submit request.');
      }
    });
  }
}


const adminDashboard = new AdminDashboard();
initializeRequestForm();

document.addEventListener('DOMContentLoaded', () => {

});