document.addEventListener('DOMContentLoaded', () => {
  // Initialize notification permissions
  initializeNotifications();
  
  // Initialize main application modules
  const authHandler = new AuthHandler();
  const modalHandler = new ModalHandler();
  const reservationHandler = new ReservationHandler();
});


 //Initialize browser notifications
 
function initializeNotifications() {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('🔐 Notification permission result:', permission);
    });
  } else {
    console.log('🔐 Notification already set:', Notification.permission);
  }
}


class NotificationManager {
  /**
   * @param {Object} reservation 
   */
  static scheduleReservationReminder(reservation) {
    Notification.requestPermission().then(permission => {
      console.log(' Notification permission result:', permission);
      
      if (permission !== 'granted') {
        console.warn(' Notification not granted. Reminder skipped.');
        return;
      }
      
      const { name, date, time } = reservation;
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const reminderTime = new Date(year, month - 1, day, hour, minute);
      
      reminderTime.setMinutes(reminderTime.getMinutes() - 3);
      
      const now = new Date();
      const delay = reminderTime - now;
      
      console.log(' Now:', now.toLocaleString());
      console.log(' Reminder Time:', reminderTime.toLocaleString());
      console.log(' Delay in ms:', delay);
      
      if (delay > 0) {
        console.log(' Scheduling reminder...');
        setTimeout(() => {
          console.log('Reminder fired!');
          
          NotificationManager.showReminderBanner(name);
          
          new Notification('⏰ Reservation Reminder', {
            body: `Hey ${name}, your reservation is in 3 minutes!`,
            icon: 'favicon.ico'
          });
        }, delay);
      } else {
        console.warn(' Reminder skipped. Delay was too short or negative:', delay);
      }
    });
  }
  
  /**
   * @param {string} name 
   */
  static showReminderBanner(name) {
    const banner = document.createElement('div');
    banner.innerText = '⏰ Reminder: Your reservation is in 3 minutes!';
    banner.style.position = 'fixed';
    banner.style.bottom = '20px';
    banner.style.left = '20px';
    banner.style.padding = '10px 20px';
    banner.style.backgroundColor = '#ffcc00';
    banner.style.color = '#000';
    banner.style.fontWeight = 'bold';
    banner.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    document.body.appendChild(banner);
  }
}

class AuthHandler {
  constructor() {
    this.initElements();
    this.initEventListeners();
    this.checkAuthStatus();
  }

  initElements() {
    this.loginButton = document.getElementById('loginSubmit');
    this.signupButton = document.getElementById('signupSubmit');
    this.logoutButton = document.getElementById('logoutButton');
    this.authModal = document.getElementById('authModal');
    this.backButtons = document.querySelectorAll('.backToHome');
    this.toggleFormsButtons = document.querySelectorAll('#toggleForms');
  }
  
  initEventListeners() {
    if (this.loginButton) {
      this.loginButton.addEventListener('click', this.handleLogin.bind(this));
    }
    
    if (this.signupButton) {
      this.signupButton.addEventListener('click', this.handleSignUp.bind(this));
    }
    
    if (this.logoutButton) {
      this.logoutButton.addEventListener('click', this.handleLogout.bind(this));
    }
    
    if (this.backButtons) {
      this.backButtons.forEach(button => {
        button.addEventListener('click', this.goHome.bind(this));
      });
    }
    
    if (this.toggleFormsButtons) {
      this.toggleFormsButtons.forEach(button => {
        button.addEventListener('click', this.toggleForms.bind(this));
      });
    }
  }
  
  checkAuthStatus() {
    const token = sessionStorage.getItem('token');
    if (this.authModal) {
      this.authModal.style.display = token ? 'none' : 'flex';
    }
  }
  
  /**
   * @param {Event} event 
   */
  async handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', username);
        alert('Login successful!');
        location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error connecting to server.');
    }
  }
  
  /**
   * @param {Event} event 
   */
  async handleSignUp(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Sign-up error:', error);
      alert('Error connecting to server.');
    }
  }
  
  /**
   * @param {Event} event 
   */
  handleLogout(event) {
    event.preventDefault();
    sessionStorage.removeItem('token');
    alert('Logged out successfully!');
    this.goHome();
  }
  

  toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
      if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
      }
    }
  }
  
  goHome() {
    window.location.href = 'homepage.html';
  }
}


 // Modal dialog management

class ModalHandler {
  constructor() {
    this.modal = document.getElementById('myModal');
    this.modalText = document.getElementById('modalText');
    this.closeButton = document.querySelector('.close');
    this.initEventListeners();
  }
  
 
    //Initialize event listeners
   
  initEventListeners() {  
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => this.showModal(card));
    });
     
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.closeModal());
    }
    

    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });
  }
  
  /**
   * Show the modal with text from card
   * @param {Element} card 
   */
  showModal(card) {
    if (this.modalText && this.modal) {
      this.modalText.textContent = card.getAttribute('data-modal-text');
      this.modal.style.display = 'block';
    }
  }
  
 
  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}


class ReservationHandler { 
   //Initialize reservation functionality   
  constructor() {
    this.initEventListeners();
    this.updateAvailability();
  }
  

  initEventListeners() {
    const reserveButton = document.getElementById('reserveButton');
    if (reserveButton) {
      reserveButton.addEventListener('click', this.submitReservation.bind(this));
    }
    
    const showReservationButton = document.getElementById('showReservation');
    if (showReservationButton) {
      showReservationButton.addEventListener('click', this.fetchLastReservation.bind(this));
    }
  }
  

  async updateAvailability() {
    try {
      const response = await fetch('http://localhost:5000/remaining-reservations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      console.log('Remaining spots fetched:', data.remaining);
      
      const availabilityDisplay = document.getElementById('remainingSpots');
      if (availabilityDisplay) {
        availabilityDisplay.innerText = `Remaining Reservations: ${data.remaining}`;
      }
    } catch (error) {
      console.error('Error fetching remaining reservations:', error);
      
      const availabilityDisplay = document.getElementById('remainingSpots');
      if (availabilityDisplay) {
        availabilityDisplay.innerText = 'Error loading availability';
      }
    }
  }
  
  /**
   * Submit a new reservation
   * @param {Event} event 
   */
  async submitReservation(event) {
    event.preventDefault();   
    // Check authentication
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to make a reservation.');
      return;
    }
    
  
    const reservationData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      guests: document.getElementById('guests').value
    };
    
    try {
      const response = await fetch('http://localhost:5000/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      alert(data.message);
      
      if (response.ok) {
        document.getElementById('reservationForm').reset();
        this.updateAvailability();
        
       
        NotificationManager.scheduleReservationReminder(reservationData);
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Failed to make a reservation.');
    }
  }
  
 
  async fetchLastReservation() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to view reservations.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/reservations', {
        method: 'GET',
        headers: { 'Authorization': token }
      });
      
      const reservations = await response.json();
      
      if (reservations.length > 0) {
        this.displayReservation(reservations[reservations.length - 1]);
      } else {
        alert('No reservations found.');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('Failed to load reservations.');
    }
  }
  
  /** 
   * @param {Object} reservation -
   */
  displayReservation(reservation) {
    const container = document.getElementById('reservationMessage');
    
    container.innerHTML = `
      <div class='reservation-popup'>
        <h3>Last Reservation Details</h3>
        <p><strong>Name:</strong> ${reservation.name}</p>
        <p><strong>Phone:</strong> ${reservation.phone}</p>
        <p><strong>Date:</strong> ${reservation.date}</p>
        <p><strong>Time:</strong> ${reservation.time}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <button id='closeReservation' class='close-button'>Close</button>
      </div>
    `;
    
    container.style.display = 'block';
    
   
    document.getElementById('closeReservation').addEventListener('click', () => {
      container.style.display = 'none';
    });
  }
}