DROP DATABASE IF EXISTS EcommerceDB;
CREATE DATABASE EcommerceDB;
USE EcommerceDB;

-- =====================================================
-- TABLES
-- =====================================================
CREATE TABLE Customer (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    Address TEXT,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE Seller (
    SellerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    BusinessName VARCHAR(100),
    Address TEXT,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE Product (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    SellerID INT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
    QuantityAvailable INT DEFAULT 0 CHECK (QuantityAvailable >= 0),
    Category VARCHAR(50),
    FOREIGN KEY (SellerID) REFERENCES Seller(SellerID)
);

CREATE TABLE Cart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active','Ordered') DEFAULT 'Active',
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE CartItem (
    CartItemID INT AUTO_INCREMENT PRIMARY KEY,
    CartID INT,
    ProductID INT,
    Quantity INT CHECK (Quantity > 0),
    FOREIGN KEY (CartID) REFERENCES Cart(CartID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE `Order` (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10,2),
    Status ENUM('Pending','Paid','Shipped','Delivered') DEFAULT 'Pending',
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    PriceAtPurchase DECIMAL(10,2) NOT NULL CHECK (PriceAtPurchase >= 0),
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Amount DECIMAL(10,2) CHECK (Amount >= 0),
    Method ENUM('Card','UPI','Cash') NOT NULL,
    Status ENUM('Success','Failed','Pending') DEFAULT 'Pending',
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_product_seller ON Product(SellerID);
CREATE INDEX idx_product_category ON Product(Category);
CREATE INDEX idx_order_customer ON `Order`(CustomerID, Status);
CREATE INDEX idx_od_order ON OrderDetails(OrderID);
CREATE INDEX idx_cartitem_cart ON CartItem(CartID);

-- =====================================================
-- FUNCTIONS
-- =====================================================
DELIMITER $$

-- FUNCTION-1: Calculate order subtotal
--     Returns total price of all items in an order (Quantity * PriceAtPurchase)
DROP FUNCTION IF EXISTS fn_order_subtotal$$

CREATE FUNCTION fn_order_subtotal(p_order_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_sub DECIMAL(10,2);
  SELECT IFNULL(SUM(Quantity * PriceAtPurchase), 0.00)
  INTO v_sub
  FROM OrderDetails
  WHERE OrderID = p_order_id;
  RETURN v_sub;
END$$

-- FUNCTION-2: Calculate order discount
--     Applies 5% discount if subtotal >= 5000.00
DROP FUNCTION IF EXISTS fn_order_discount$$

CREATE FUNCTION fn_order_discount(p_order_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_sub DECIMAL(10,2);
  DECLARE v_disc DECIMAL(10,2);
  SET v_sub = fn_order_subtotal(p_order_id);
  SET v_disc = CASE WHEN v_sub >= 5000.00 THEN ROUND(v_sub * 0.05, 2) ELSE 0.00 END;
  RETURN v_disc;
END$$

-- FUNCTION-3: Calculate final total (subtotal − discount)
--     Computes the final amount payable for an order
DROP FUNCTION IF EXISTS fn_order_total$$

CREATE FUNCTION fn_order_total(p_order_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  RETURN fn_order_subtotal(p_order_id) - fn_order_discount(p_order_id);
END$$

DELIMITER ;

-- =====================================================
-- PROCEDURES
-- =====================================================
DELIMITER $$

-- Procedure-1: Place a new order (moves items from cart order)
--     Creates a new order for a customer by moving items from CartItem to OrderDetails.
--     Calculates total using fn_order_total() and updates Cart status to 'Ordered'.
CREATE PROCEDURE sp_place_order(IN p_customer_id INT)
BEGIN
    DECLARE v_order_id INT;
    DECLARE v_total DECIMAL(10,2);
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_product_id INT;
    DECLARE v_quantity INT;
    DECLARE v_price DECIMAL(10,2);
    
    -- Cursor to read cart items
    DECLARE cart_cursor CURSOR FOR
        SELECT ci.ProductID, ci.Quantity, p.Price
        FROM CartItem ci
        JOIN Product p ON ci.ProductID = p.ProductID
        JOIN Cart c ON ci.CartID = c.CartID
        WHERE c.CustomerID = p_customer_id AND c.Status = 'Active';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Create new order
    INSERT INTO `Order` (CustomerID, Status)
    VALUES (p_customer_id, 'Pending');
    SET v_order_id = LAST_INSERT_ID();

    -- Process cart items one by one to avoid table conflict
    OPEN cart_cursor;
    read_loop: LOOP
        FETCH cart_cursor INTO v_product_id, v_quantity, v_price;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert order detail (trigger will reduce stock automatically)
        INSERT INTO OrderDetails (OrderID, ProductID, Quantity, PriceAtPurchase)
        VALUES (v_order_id, v_product_id, v_quantity, v_price);
    END LOOP;
    CLOSE cart_cursor;

    -- Calculate total
    SET v_total = fn_order_total(v_order_id);
    UPDATE `Order` SET TotalAmount = v_total WHERE OrderID = v_order_id;

    -- Mark cart as ordered
    UPDATE Cart SET Status = 'Ordered' WHERE CustomerID = p_customer_id AND Status = 'Active';

    SELECT v_order_id AS NewOrderID, v_total AS TotalAmount;
END$$

-- Procedure-2: Record a payment
--     Records a successful payment and updates the corresponding order’s status to 'Paid'.
CREATE PROCEDURE sp_make_payment(
    IN p_order_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_method ENUM('Card','UPI','Cash')
)
BEGIN
    INSERT INTO Payment (OrderID, Amount, Method, Status)
    VALUES (p_order_id, p_amount, p_method, 'Success');
END$$

-- =====================================================
-- TRIGGERS
-- =====================================================
DELIMITER $$

-- Trigger-1: Prevent ordering more than stock
--     Prevents insertion into CartItem if ordered quantity exceeds available stock.
CREATE TRIGGER prevent_over_update_cart
BEFORE UPDATE ON CartItem
FOR EACH ROW
BEGIN
    DECLARE stock INT;
    SELECT QuantityAvailable INTO stock FROM Product WHERE ProductID = NEW.ProductID;
    IF NEW.Quantity > stock THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for this product!';
    END IF;
END$$

-- Trigger-2: Auto-reduce product stock after order
--     Automatically decreases product stock after each successful OrderDetails insert.
CREATE TRIGGER reduce_quantity_after_order
AFTER INSERT ON OrderDetails
FOR EACH ROW
BEGIN
    UPDATE Product
    SET QuantityAvailable = QuantityAvailable - NEW.Quantity
    WHERE ProductID = NEW.ProductID;
END$$

-- Trigger-3: Update order status when payment succeeds
--     Automatically updates order status to 'Paid' when a payment record is inserted successfully.
CREATE TRIGGER update_order_status_after_payment
AFTER INSERT ON Payment
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Success' THEN
        UPDATE `Order`
        SET Status = 'Paid'
        WHERE OrderID = NEW.OrderID;
    END IF;
END$$
DELIMITER ;

-- =====================================================
-- SAMPLE DATA
-- =====================================================
-- SELLERS
INSERT INTO Seller (Name, Email, Phone, BusinessName, Address, Password) VALUES
('Ananya Mehta', 'ananya@sellhub.com', '9823456789', 'TechVerse', 'Bangalore', 'pass123'),
('Rohan Iyer', 'rohan@freshmart.com', '9812345678', 'FreshMart Organics', 'Pune', 'secure456'),
('Lila Rao', 'lila@flowers.com', '9257730501', 'FloraWorld', 'Mumbai', 'lila@789'),
('Arun Paul', 'arun@gadgetzone.com', '9789012345', 'GadgetZone', 'Delhi', 'tech888'),
('Nikita Saha', 'nikita@homecrafts.com', '9898765432', 'HomeCrafts', 'Hyderabad', 'crafty456');

-- CUSTOMERS
INSERT INTO Customer (Name, Email, Phone, Address, Password) VALUES
('Arjun Rao', 'arjunr@gmail.com', '9876501234', 'Bangalore', 'arjun@123'),
('Priya Nair', 'priyanair@gmail.com', '9867012345', 'Chennai', 'priya@456'),
('Kavita Menon', 'kavita.menon@gmail.com', '9898123456', 'Pune', 'kavita@789'),
('Rishi Patel', 'rishi.patel@gmail.com', '9123456789', 'Ahmedabad', 'rishi@234'),
('Sneha DSouza', 'sneha.dsouza@gmail.com', '9789012345', 'Kochi', 'sneha@567');

-- PRODUCTS
INSERT INTO Product (SellerID, Name, Description, Price, QuantityAvailable, Category) VALUES
(1, 'Bluetooth Speaker', 'Portable 10W speaker', 2499.00, 20, 'Electronics'),
(1, 'Wireless Keyboard', 'Ergonomic keyboard', 1999.00, 15, 'Electronics'),
(2, 'Almonds 500g', 'Premium California almonds', 599.00, 40, 'Groceries'),
(3, 'Rose Bouquet', 'Fresh roses (12 stems)', 1299.00, 25, 'Flowers'),
(4, 'Smartwatch', 'Fitness tracker smartwatch', 4999.00, 10, 'Electronics'),
(5, 'Ceramic Vase', 'Handcrafted home decor vase', 899.00, 18, 'Home Decor'),
(1, 'Gaming Headset', 'Surround sound headset', 6000.00, 10, 'Electronics');

-- CARTS
INSERT INTO Cart (CustomerID, Status) VALUES
(1, 'Active'),
(2, 'Active'),
(3, 'Ordered'),
(4, 'Active'),
(5, 'Ordered'),
(1, 'Ordered');

-- CART ITEMS
INSERT INTO CartItem (CartID, ProductID, Quantity) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 3, 2),
(3, 4, 1),
(4, 5, 1),
(5, 6, 2),
(6, 7, 1);

-- ORDERS
INSERT INTO `Order` (CustomerID, OrderDate, TotalAmount, Status) VALUES
(1, NOW(), 4498.00, 'Pending'),
(2, NOW(), 1198.00, 'Pending'),
(3, NOW(), 1299.00, 'Paid'),
(4, NOW(), 4999.00, 'Shipped'),
(5, NOW(), 1798.00, 'Delivered'),
(1, NOW(), 5700.00, 'Pending');

-- ORDER DETAILS
INSERT INTO OrderDetails (OrderID, ProductID, Quantity, PriceAtPurchase) VALUES
(1, 1, 1, 2499.00),
(1, 2, 1, 1999.00),
(2, 3, 2, 599.00),
(3, 4, 1, 1299.00),
(4, 5, 1, 4999.00),
(5, 6, 2, 899.00),
(6, 7, 1, 6000.00);

-- PAYMENTS
INSERT INTO Payment (OrderID, Amount, Method, Status) VALUES
(1, 4498.00, 'Card', 'Success'),
(2, 1198.00, 'UPI', 'Success'),
(3, 1299.00, 'Cash', 'Success'),
(4, 4999.00, 'Card', 'Pending'),
(5, 1798.00, 'UPI', 'Success'),
(6, 5700.00, 'Card', 'Success');