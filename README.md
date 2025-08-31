
# Restaurant Management System

A full-stack web application built with Node.js, Express, and HTML/CSS/JavaScript to manage restaurant operations. It includes modules for admin login, order processing, reservations, inventory tracking, and email notifications.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Documentation](#documentation)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

---

## Introduction

This system is designed to streamline restaurant operations. It allows administrators to:
- Manage food orders and reservations
- Track and update inventory
- Authenticate using JWT
- Store and retrieve data via both JSON and MySQL

---

## Features

- Admin login with JWT authentication
- Password encryption with bcrypt
- Manage orders and inventory via JSON or MySQL
- Reservation handling
- Nodemailer integration for emails
- MySQL and MSSQL support
- Frontend with HTML and vanilla JS

---

## Installation

### Prerequisites

- Node.js (v16 or above)
- npm (Node Package Manager)
- MySQL Server (optional, for DB support)

### Setup Steps

1. **Clone or extract the project**
   ```
   git clone <repo_url>
   cd restaurant_management_system
   ```

2. **Install dependencies**
   ```
   npm install
   ```

---

## Usage

### 1. Start the Server

```bash
node admin_routes.js
```

### 2. Access the Frontend

Open any of the following in your browser:

- `homepage.HTML`
- `admin_dashboard.html`
- `Order.html`
- `reservations.html`

These provide interfaces for reservations, order handling, and inventory management.

---

## Configuration

- **Database**: Connection settings are defined in `admin_routes.js`
  ```js
  DB: {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: '',
    DATABASE: 'RestaurantDB'
  }
  ```

- **JWT Secret & Expiry**:
  ```js
  JWT: {
    SECRET: 'admin_secret',
    EXPIRY: '2h'
  }
  ```

- **Data Files**:
  - `admins.json`
  - `orders.json`
  - `reservations.json`
  - `inventory.json`

---

## Dependencies

Declared in `package.json`:

- `express`
- `bcrypt`, `bcryptjs`
- `jsonwebtoken`
- `mysql2`, `mssql`
- `cors`
- `nodemailer`

Install with:

```bash
npm install
```

---

## Documentation

- Source code organized at project root
- Data files and logic are commented
- Configuration hardcoded in `admin_routes.js`

---

## Examples

- **Login**: Admin login generates a JWT token
- **Order**: JSON-based cart/order flow from `Order.html`
- **Inventory**: Adjust items via `inventory.json` or UI
- **Reservations**: Add/view reservations via `reservations.html`

---

## Troubleshooting

| Problem                  | Solution                                                                 |
|--------------------------|--------------------------------------------------------------------------|
| Server not running       | Ensure Node.js is installed. Use `node admin_routes.js`.                |
| Cannot connect to DB     | Verify MySQL service is running and credentials are correct             |
| JSON not updating        | Check file permissions for `.json` files                                 |
| Email not sending        | Ensure correct Nodemailer setup and internet connection                 |

---

## Contributors

- Developed by project author(s)
- Reviewed and packaged via automated documentation tools

---

## License

This project is free to use and modify for academic or educational purposes.
