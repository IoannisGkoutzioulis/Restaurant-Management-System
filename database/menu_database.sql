CREATE DATABASE IF NOT EXISTS RestaurantDB;
USE RestaurantDB;

CREATE TABLE MenuItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50),
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(5,2)
);

-- Appetizers
INSERT INTO MenuItems (category, name, description, price) VALUES
('Appetizer', 'Stuffed Portobello Mushrooms', 'Filled with spinach, sun-dried tomato, and vegan cheese.', 7.50),
('Appetizer', 'Spicy Tuna Tartare', 'Fresh tuna cubes with avocado and crispy wonton chips.', 9.00),
('Appetizer', 'Mini Crab Cakes', 'Served with lemon aioli.', 8.50),
('Appetizer', 'Truffle Parmesan Fries', 'Crispy fries tossed in truffle oil and Parmesan.', 6.00),
('Appetizer', 'Bruschetta Trio', 'Classic tomato, mushroom pesto, and white bean spread.', 6.50);

-- Meat Dishes
INSERT INTO MenuItems (category, name, description, price) VALUES
('Meat', 'Braised Short Rib with Truffle Mashed Potatoes', 'Slow-braised short rib over truffle mashed potatoes.', 16.50),
('Meat', 'Grilled Lamb Chops with Mint Chimichurri', 'Juicy lamb with mint chimichurri and potatoes.', 18.00),
('Meat', 'Pistachio-Crusted Chicken with Honey Mustard Glaze', 'Chicken breast with a pistachio crust and glaze.', 15.00),
('Meat', 'Signature Urban Burger', 'Gourmet burger with truffle aioli and fries.', 13.50),
('Meat', 'Duck Breast with Cherry Port Sauce', 'Pan-seared duck breast with cherry port sauce.', 17.50),
('Meat', 'Beef Tenderloin Medallions with Garlic Herb Butter', 'Beef medallions with herb butter.', 19.00);

-- Vegan
INSERT INTO MenuItems (category, name, description, price) VALUES
('Vegan', 'Wild Mushroom Risotto', 'Arborio rice, mushrooms, and truffle oil.', 13.00),
('Vegan', 'Chickpea and Spinach Curry', 'Served with basmati rice.', 11.00),
('Vegan', 'Stuffed Bell Peppers', 'With quinoa, black beans, and avocado.', 10.50),
('Vegan', 'Zucchini Noodles with Vegan Pesto', 'Fresh zucchini noodles with pesto.', 11.50);

-- Salads
INSERT INTO MenuItems (category, name, description, price) VALUES
('Salad', 'Urban Caesar Salad', 'Romaine with herb croutons and Parmesan.', 9.00),
('Salad', 'Beetroot & Goat Cheese Salad', 'Arugula, beets, goat cheese, and walnuts.', 10.00),
('Salad', 'Greek Village Salad', 'Classic Greek with feta and olives.', 8.50),
('Salad', 'Kale and Quinoa Power Salad', 'Kale, quinoa, and lemon vinaigrette.', 10.50),
('Salad', 'Caprese Salad', 'Tomatoes, mozzarella, basil.', 9.50),
('Salad', 'Asian Slaw Salad', 'Shredded cabbage with sesame dressing.', 8.00);

-- Wines
INSERT INTO MenuItems (category, name, description, price) VALUES
('Wine', 'Sauvignon Blanc', 'White wine – crisp and fresh.', 6.00),
('Wine', 'Chardonnay', 'White wine – buttery and smooth.', 6.50),
('Wine', 'Merlot', 'Red wine – soft and rich.', 6.50),
('Wine', 'Cabernet Sauvignon', 'Red wine – bold and structured.', 7.00),
('Wine', 'Provence Rosé', 'Rosé wine – dry and fruity.', 6.00);

-- Soft Drinks
INSERT INTO MenuItems (category, name, description, price) VALUES
('Soft Drink', 'Coca-Cola', 'Classic soda.', 2.50),
('Soft Drink', 'Diet Coke', 'Sugar-free cola.', 2.50),
('Soft Drink', 'Sprite', 'Lemon-lime soda.', 2.50),
('Soft Drink', 'Fanta', 'Orange-flavored soda.', 2.50),
('Soft Drink', 'Sparkling Water', 'Carbonated water.', 2.00),
('Soft Drink', 'Still Water', 'Bottled still water.', 2.00);


CREATE TABLE Orders (
  id INT PRIMARY KEY AUTO_INCREMENT ,
  username VARCHAR(100),       -- optional, if tied to login
  item_name VARCHAR(100),
  quantity INT,
  item_price DECIMAL(5,2),
  total_price DECIMAL(6,2),
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE StaffSchedules (
  id INT PRIMARY KEY  AUTO_INCREMENT,
  name VARCHAR(100),
  position VARCHAR(100),
  shift_time VARCHAR(50),
  hours_worked INT
);
INSERT INTO StaffSchedules (name, position, shift_time, hours_worked)
VALUES ('Maria', 'Chef', '09:00 - 17:00', 8),
       ('Yannis', 'Waiter', '17:00 - 23:00', 6),
       ('Nikos', 'Bartender', '16:00 - 00:00', 8);

select *from orders;