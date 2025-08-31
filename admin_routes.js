const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const router = express.Router();


const CONFIG = {
  FILES: {
    ADMIN: 'admins.json',
    RESERVATION: 'reservations.json',
    ORDER: 'orders.json',
    INVENTORY: 'inventory.json'
  },
  // authentication
  JWT: {
    SECRET: 'admin_secret',
    EXPIRY: '2h'
  },
  // database
  DB: {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: '',
    DATABASE: 'RestaurantDB'
  }
};

// database Connection
const db = mysql.createConnection({
  host: CONFIG.DB.HOST,
  user: CONFIG.DB.USER,
  password: CONFIG.DB.PASSWORD,
  database: CONFIG.DB.DATABASE
});

db.connect(err => {
  if (err) {
    console.error('❌ Staff DB connection error:', err);
  } else {
    console.log('✅ Staff DB connected!');
  }
});


/**
 * read and parse JSON file
 * @param {string} path 
 * @returns {Array} 
 */
function readFile(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${path}:`, error);
    return [];
  }
}

/**
 * write data to JSON file
 * @param {string} path 
 * @param {Object} data 
 */
function writeFile(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${path}:`, error);
    throw error;
  }
}

/**
 * generate a unique ID with prefix
 * @param {string} prefix 
 * @returns {string} 
 */
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}


/**
 * verify admin authentication token
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
function authAdmin(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }
  
  jwt.verify(token, CONFIG.JWT.SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid Token' });
    }
    
    req.admin = admin;
    next();
  });
}

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    const admins = readFile(CONFIG.FILES.ADMIN);
    
    if (admins.some(a => a.username === username)) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    admins.push({ username, password: hash });
    writeFile(CONFIG.FILES.ADMIN, admins);
    
    res.json({ message: 'Admin signup successful!' });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});


 //admin login

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    const admins = readFile(CONFIG.FILES.ADMIN);
    const admin = admins.find(a => a.username === username);
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const token = jwt.sign({ username }, CONFIG.JWT.SECRET, { expiresIn: CONFIG.JWT.EXPIRY });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


 //get all reservations

router.get('/reservations', authAdmin, (req, res) => {
  try {
    const reservations = readFile(CONFIG.FILES.RESERVATION);
    res.json(reservations);
  } catch (error) {
    console.error('Fetch reservations error:', error);
    res.status(500).json({ message: 'Failed to fetch reservations' });
  }
});




 //get all orders

router.get('/orders', authAdmin, (req, res) => {
  try {
    const orders = readFile(CONFIG.FILES.ORDER);
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});


 //create new order

router.post('/orders', authAdmin, (req, res) => {
  const { table_number, items, special_request } = req.body;
  
  if (!table_number || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid order data.' });
  }
  
  try {
    const orders = readFile(CONFIG.FILES.ORDER);
    const orderId = generateId('ORD');
    
    const newOrder = {
      order_id: orderId,
      table_number,
      items,
      special_request,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeFile(CONFIG.FILES.ORDER, orders);
    
    res.json({ message: 'Order submitted!', order: newOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});



 //Get all inventory items

router.get('/inventory', authAdmin, (req, res) => {
  try {
    const items = readFile(CONFIG.FILES.INVENTORY);
    res.json(items);
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});


 //create new inventory item

router.post('/inventory', authAdmin, (req, res) => {
  const { item_name, quantity, reorder_level, supplier } = req.body;
  
  if (!item_name || quantity == null || reorder_level == null) {
    return res.status(400).json({ message: 'Missing required inventory fields.' });
  }
  
  try {
    const items = readFile(CONFIG.FILES.INVENTORY);
    const newItem = {
      item_id: generateId('INV'),
      item_name,
      quantity,
      reorder_level,
      supplier: supplier || ''
    };
    
    items.push(newItem);
    writeFile(CONFIG.FILES.INVENTORY, items);
    
    res.json({ message: 'Inventory item added!', item: newItem });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ message: 'Failed to create inventory item' });
  }
});


 //update inventory item

router.put('/inventory/:id', authAdmin, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  try {
    const items = readFile(CONFIG.FILES.INVENTORY);
    const index = items.findIndex(i => i.item_id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    items[index].quantity = quantity;
    writeFile(CONFIG.FILES.INVENTORY, items);
    
    res.json({ message: 'Inventory item updated!' });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Failed to update inventory item' });
  }
});


 //delete inventory item

router.delete('/inventory/:id', authAdmin, (req, res) => {
  const { id } = req.params;
  
  try {
    let items = readFile(CONFIG.FILES.INVENTORY);
    const index = items.findIndex(i => i.item_id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    items.splice(index, 1);
    writeFile(CONFIG.FILES.INVENTORY, items);
    
    res.json({ message: 'Inventory item deleted.' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ message: 'Failed to delete inventory item' });
  }
});



 //Get all staff schedules

router.get('/staff', authAdmin, (req, res) => {
  db.query('SELECT * FROM StaffSchedules', (err, results) => {
    if (err) {
      console.error('❌ SQL SELECT Error:', err);
      return res.status(500).json({ message: 'Failed to fetch staff.' });
    }
    
    res.json(results);
  });
});


 //Create new staff schedule

router.post('/staff', authAdmin, (req, res) => {
  const { name, position, shift_time, hours_worked } = req.body;
  
  if (!name || !position || !shift_time || hours_worked == null) {
    return res.status(400).json({ message: 'Missing staff fields.' });
  }
  
  const sql = 'INSERT INTO StaffSchedules (name, position, shift_time, hours_worked) VALUES (?, ?, ?, ?)';
  const values = [name, position, shift_time, hours_worked];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ SQL INSERT Error:', err);
      return res.status(500).json({ message: 'Failed to add staff.' });
    }
    
    res.json({ message: 'Staff schedule added!' });
  });
});


 //Delete staff schedule

router.delete('/staff/:id', authAdmin, (req, res) => {
  const staffId = req.params.id;
  
  db.query('DELETE FROM StaffSchedules WHERE id = ?', [staffId], (err, result) => {
    if (err) {
      console.error('❌ SQL DELETE Error:', err);
      return res.status(500).json({ message: 'Failed to delete staff.' });
    }
    
    res.json({ message: 'Staff deleted successfully!' });
  });
});


 //Update staff schedule

router.put('/staff/:id', authAdmin, (req, res) => {
  const staffId = req.params.id;
  const { shift_time, hours_worked } = req.body;
  
  const sql = 'UPDATE StaffSchedules SET shift_time = ?, hours_worked = ? WHERE id = ?';
  
  db.query(sql, [shift_time, hours_worked, staffId], (err, result) => {
    if (err) {
      console.error('❌ SQL UPDATE Error:', err);
      return res.status(500).json({ message: 'Failed to update staff.' });
    }
    
    res.json({ message: 'Staff updated successfully!' });
  });
});



 //Submit staff request

router.post('/submit-request', (req, res) => {
  const {
    staff_id,
    request_type,
    requested_date,
    shift_change_from,
    shift_change_to,
    reason
  } = req.body;
  
  const sql = `
    INSERT INTO staff_requests 
    (staff_id, request_type, requested_date, shift_change_from, shift_change_to, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    staff_id, 
    request_type, 
    requested_date, 
    shift_change_from || null, 
    shift_change_to || null, 
    reason
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error inserting request:', err);
      return res.status(500).send('Error submitting request.');
    }
    
    res.send('✅ Request submitted.');
  });
});

// Get all staff requests
 
router.get('/staff-requests', (req, res) => {
  db.query('SELECT * FROM staff_requests ORDER BY submission_date DESC', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching requests:', err);
      return res.status(500).send('Error.');
    }
    
    res.json(rows);
  });
});

//Update request status

router.post('/update-request-status', (req, res) => {
  const { request_id, status } = req.body;
  
  if (!request_id || !status) {
    return res.status(400).send('Missing required fields.');
  }
  
  const sql = 'UPDATE staff_requests SET status = ? WHERE request_id = ?';
  
  db.query(sql, [status, request_id], (err, result) => {
    if (err) {
      console.error('❌ Update failed:', err);
      return res.status(500).send('Update failed.');
    }
    
    res.send('✅ Status updated.');
  });
});

module.exports = router;