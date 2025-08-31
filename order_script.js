document.addEventListener('DOMContentLoaded', () => {
  const orderManager = new OrderManager();
  orderManager.initialize();
});

class OrderManager {
  constructor() {
    this.cart = [];
    this.menuItems = [];
    this.apiBaseUrl = 'http://localhost:5000';
  }

 
   //Initialize the order manager and load data
  
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    this.fetchMenuItems();
  }

  // Menu category tables
  cacheElements() {
    this.categoryTables = {
      'Appetizer': document.getElementById('appetizersTable'),
      'Meat': document.getElementById('meatTable'),
      'Vegan': document.getElementById('veganTable'),
      'Salad': document.getElementById('saladTable'),
      'Wine': document.getElementById('wineTable'),
      'Soft Drink': document.getElementById('softTable')
    };

    
    this.orderList = document.getElementById('orderList');
    this.orderTotal = document.getElementById('orderTotal');
    this.placeOrderBtn = document.getElementById('placeOrder');
  }


  setupEventListeners() {
    if (this.placeOrderBtn) {
      this.placeOrderBtn.addEventListener('click', () => this.placeOrder());
    }
  }


  fetchMenuItems() {
    fetch(`${this.apiBaseUrl}/menu`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch menu');
        }
        return response.json();
      })
      .then(data => {
        this.menuItems = data;
        this.renderMenuItems();
      })
      .catch(error => {
        console.error('Error loading menu:', error);
        this.showError('Failed to load menu items. Please try again later.');
      });
  }

  
    //menu items into category tables
   
  renderMenuItems() {
    if (!this.menuItems || !this.menuItems.length) {
      return;
    }

    this.menuItems.forEach(item => {
      this.addItemToTable(item);
    });

    this.setupCartListeners();
  }

  /**
   * add an item to its corresponding category table
   * @param {Object} item 
   */
  addItemToTable(item) {
    const table = this.categoryTables[item.category];
    if (!table) {
      return;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.description}</td>
      <td>${this.formatCurrency(item.price)}</td>
      <td>
        <button class="add-to-cart" 
                data-name="${item.name}" 
                data-price="${item.price}">
          Add
        </button>
      </td>
    `;
    
    table.appendChild(row);
  }

  setupCartListeners() {
    const buttons = document.querySelectorAll('.add-to-cart');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        
        if (name && !isNaN(price)) {
          this.addToCart(name, price);
        }
      });
    });
  }


  /**
   * Add an item to the cart
   * @param {string} name 
   * @param {number} price 
   */
  addToCart(name, price) {
    const existing = this.cart.find(item => item.name === name);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ 
        name, 
        price, 
        quantity: 1 
      });
    }

    this.updateCartDisplay();
  }

  /**
   * @param {string} name 
   */
  incrementItem(name) {
    const item = this.cart.find(item => item.name === name);
    
    if (item) {
      item.quantity += 1;
      this.updateCartDisplay();
    }
  }

  /**
   * @param {string} name 
   */
  decrementItem(name) {
    const item = this.cart.find(item => item.name === name);
    
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.updateCartDisplay();
    }
  }

  /**
   * @param {string} name 
   */
  removeItem(name) {
    this.cart = this.cart.filter(item => item.name !== name);
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    if (!this.orderList) {
      return;
    }

    this.orderList.innerHTML = '';
    
    if (this.cart.length === 0) {
      this.orderList.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
      this.updateTotalDisplay(0);
      return;
    }

    let total = 0;

    this.cart.forEach(item => {
      const subtotal = item.quantity * item.price;
      total += subtotal;

      const li = this.createCartItemElement(item, subtotal);
      this.orderList.appendChild(li);
    });

    this.updateTotalDisplay(total);
  }

  /**
   * @param {Object} item 
   * @param {number} subtotal 
   * @returns {HTMLElement} 
   */
  createCartItemElement(item, subtotal) {
    const li = document.createElement('li');
    
    li.innerHTML = `
      <span>${item.name}</span>
      <button class="decrement">−</button>
      <span> x${item.quantity} </span>
      <button class="increment">+</button>
      <span>${this.formatCurrency(subtotal)}</span>
      <button class="remove-item">🗑️</button>
    `;

    // Add event listeners
    const decrementBtn = li.querySelector('.decrement');
    const incrementBtn = li.querySelector('.increment');
    const removeBtn = li.querySelector('.remove-item');
    
    decrementBtn.addEventListener('click', () => this.decrementItem(item.name));
    incrementBtn.addEventListener('click', () => this.incrementItem(item.name));
    removeBtn.addEventListener('click', () => this.removeItem(item.name));
    
    return li;
  }

  /**
   * Update the total price display
   * @param {number} total 
   */
  updateTotalDisplay(total) {
    if (this.orderTotal) {
      this.orderTotal.textContent = this.formatCurrency(total);
    }
  }

  placeOrder() {
    if (this.cart.length === 0) {
      this.showError('Your cart is empty.');
      return;
    }

    const username = sessionStorage.getItem('username') || 'Guest';
    
    const orderPayload = {
      username: username,
      items: this.cart
    };

    console.log('📦 Sending order to backend:', JSON.stringify(orderPayload, null, 2));

    this.submitOrder(orderPayload);
  }

  /**
   * Submit the order to the server
   * @param {Object} orderData 
   */
  submitOrder(orderData) {
    fetch(`${this.apiBaseUrl}/save-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Order submission failed');
      }
      return response.json();
    })
    .then(data => {
      this.showSuccess(data.message || 'Order placed successfully!');
      this.clearCart();
    })
    .catch(error => {
      console.error('❌ Order Error:', error);
      this.showError('Failed to place order. Please try again.');
    });
  }

 
  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
  }


  /**
   * Format a number as currency
   * @param {number} amount 
   * @returns {string} 
   */
  formatCurrency(amount) {
    return `€${parseFloat(amount).toFixed(2)}`;
  }

  /**
   * Show a success message
   * @param {string} message 
   */
  showSuccess(message) {
    alert(message);
  }

  /**
   * Show an error message
   * @param {string} message 
   */
  showError(message) {
    alert(message);
  }
}