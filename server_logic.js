const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');


class Server {
 
  static PORT = 5000;
  static JWT_SECRET = 'your_secret_key'; 
  static MAX_RESERVATIONS = 15;
  
 
  static RESERVATION_FILE = 'reservations.json';
  static USER_FILE = 'users.json';
  
 
    //Initialize the server
   
  constructor() {
    this.app = express();
    this.initDatabase();
    this.setupMiddleware();
    this.setupRoutes();
    this.startServer();
  }
  
 
  initDatabase() {
    this.dbConfig = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'RestaurantDB',
      port: 3306
    };
    
    this.db = mysql.createConnection(this.dbConfig);
    
    this.db.connect((err) => {
      if (err) {
        console.error('❌ Database connection failed:', err);
      } else {
        console.log('✅ Connected to MariaDB!');
      }
    });
  }
  
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
  }
  
  
   // Set up API routes
  
  setupRoutes() {
    // Auth routes
    this.app.post('/signup', this.handleSignUp.bind(this));
    this.app.post('/login', this.handleLogin.bind(this));
    
    // Reservation routes
    this.app.post('/reserve', this.authenticateToken.bind(this), this.handleReservation.bind(this));
    this.app.get('/reservations', this.authenticateToken.bind(this), this.getReservations.bind(this));
    this.app.get('/remaining-reservations', this.getRemainingReservations.bind(this));
    
    // Menu and order routes
    this.app.get('/menu', this.getMenu.bind(this));
    this.app.post('/save-order', this.saveOrder.bind(this));
    
    // Admin routes
    const adminRoutes = require('./admin_routes');
    this.app.use('/admin', adminRoutes);
  }
  
 
  startServer() {
    this.app.listen(Server.PORT, () => {
      console.log(`🚀 Server running on port ${Server.PORT}`);
    });
  }
  
  /**
   * 
   * @param {string} filePath 
   * @returns {Array} 
   */
  readFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }
  
  /**
   * Write data to a JSON file
   * @param {string} filePath 
   * @param {Object} data 
   */
  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error writing to ${filePath}:`, error);
    }
  }
  
  /**
   * Authenticate JWT token middleware
   * @param {Object} req 
   * @param {Object} res 
   * @param {Function} next 
   */
  authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(401).json({ message: 'Access Denied' });
    }
    
    jwt.verify(token, Server.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid Token' });
      }
      
      req.user = user;
      next();
    });
  }
  
  /**
   * Handle user signup
   * @param {Object} req 
   * @param {Object} res 
   */
  async handleSignUp(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    try {
      let users = this.readFile(Server.USER_FILE);
      
      if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists!' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      users.push({ username, password: hashedPassword });
      
      this.writeFile(Server.USER_FILE, users);
      
      res.json({ message: 'Sign-up successful! You can now log in.' });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
  
  /**
   * Handle user login
   * @param {Object} req 
   * @param {Object} res 
   */
  async handleLogin(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    try {
      const users = this.readFile(Server.USER_FILE);
      const user = users.find(user => user.username === username);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      const token = jwt.sign({ username }, Server.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful!', token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
  
  /**
   * Handle reservation creation
   * @param {Object} req 
   * @param {Object} res 
   */
  handleReservation(req, res) {
    const { name, phone, date, time, guests } = req.body;
    
    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    try {
      let reservations = this.readFile(Server.RESERVATION_FILE);
      
      if (reservations.length >= Server.MAX_RESERVATIONS) {
        return res.status(400).json({ message: 'No more reservations available for today.' });
      }
      
      const reservationId = `RSV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const newReservation = {
        reservation_id: reservationId,
        name,
        phone,
        date,
        time,
        guests
      };
      
      reservations.push(newReservation);
      this.writeFile(Server.RESERVATION_FILE, reservations);
      
      res.json({ 
        message: 'Reservation successful!', 
        remaining: Server.MAX_RESERVATIONS - reservations.length 
      });
    } catch (error) {
      console.error('Reservation error:', error);
      res.status(500).json({ message: 'Server error during reservation' });
    }
  }
  
  /**
   * Get user reservations
   * @param {Object} req 
   * @param {Object} res 
   */
  getReservations(req, res) {
    try {
      const reservations = this.readFile(Server.RESERVATION_FILE);
      res.json(reservations);
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({ message: 'Error retrieving reservations' });
    }
  }
  
  /**
   * Get remaining reservation slots
   * @param {Object} req 
   * @param {Object} res 
   */
  getRemainingReservations(req, res) {
    try {
      const reservations = this.readFile(Server.RESERVATION_FILE);
      const remaining = Math.max(0, Server.MAX_RESERVATIONS - reservations.length);
      res.json({ remaining });
    } catch (error) {
      console.error('Get remaining reservations error:', error);
      res.status(500).json({ message: 'Error retrieving reservation availability' });
    }
  }
  
  /**
   * Get menu items
   * @param {Object} req 
   * @param {Object} res 
   */
  getMenu(req, res) {
    this.db.query('SELECT * FROM MenuItems', (err, results) => {
      if (err) {
        console.error('Menu fetch error:', err);
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    });
  }
  
  /**
   * Save order to database
   * @param {Object} req 
   * @param {Object} res 
   */
  saveOrder(req, res) {
    const { username, items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data.' });
    }
    
    try {
      const values = items.map(item => [
        username || 'Guest',
        item.name,
        item.quantity,
        item.price,
        (item.quantity * item.price)
      ]);
      
      const sql = 'INSERT INTO Orders (username, item_name, quantity, item_price, total_price) VALUES ?';
      
      this.db.query(sql, [values], (err, result) => {
        if (err) {
          console.error('SQL Insert Error:', err.message);
          return res.status(500).json({ error: err.message });
        }
        
        console.log('Order saved:', result.affectedRows, 'rows inserted.');
        res.json({ message: 'Order saved!' });
      });
      
      console.log('Final insert values:', values);
    } catch (error) {
      console.error('Save order error:', error);
      res.status(500).json({ message: 'Server error saving order' });
    }
  }
}

// Initialize the server
new Server();