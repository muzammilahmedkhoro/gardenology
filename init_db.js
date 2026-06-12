require('dotenv').config();
const mysql = require('mysql2/promise');

const categoriesSeed = [
  { id: "plants", name: "Plants", icon: "🌿", desc: "Indoor, outdoor, flowering and air-purifying plants.", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80" },
  { id: "fertilizers", name: "Fertilizers", icon: "🧪", desc: "Organic nutrients, liquid feeds and plant boosters.", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80" },
  { id: "soil", name: "Soil", icon: "🪴", desc: "Potting mix, compost, cocopeat and seed starter soil.", image: "https://images.unsplash.com/photo-1611311232518-62cc1158926f?auto=format&fit=crop&w=1000&q=80" },
  { id: "decor", name: "Home Decoration", icon: "🏡", desc: "Planters, stands, hanging pots and garden decor.", image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=80" },
  { id: "kits", name: "Starter Kits", icon: "🎁", desc: "Beginner kits for herbs, balcony gardens and indoor plants.", image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=80" },
  { id: "pest", name: "Pest Control", icon: "🐛", desc: "Neem spray, traps and safe plant protection products.", image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1000&q=80" },
  { id: "tools", name: "Gardening Tools", icon: "🧤", desc: "Pruners, gloves, trowels, watering cans and tool sets.", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80" },
  { id: "digital", name: "Digital Products", icon: "📘", desc: "E-books, care calendars, printable guides and courses.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80" }
];

const productsSeed = [
  { id: 1, name: "Monstera Deliciosa", category: "plants", price: 2499, image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1000&q=80", desc: "Statement indoor plant with bold tropical leaves." },
  { id: 2, name: "Snake Plant", category: "plants", price: 1499, image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=1000&q=80", desc: "Low-maintenance air-purifying plant for beginners." },
  { id: 3, name: "Organic Liquid Fertilizer", category: "fertilizers", price: 899, image: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=1000&q=80", desc: "Nutrient-rich feed for healthy plant growth." },
  { id: 4, name: "Premium Potting Soil", category: "soil", price: 699, image: "https://images.unsplash.com/photo-1639759032532-c7f288e9ef4c?auto=format&fit=crop&w=1000&q=80", desc: "Balanced soil mix for indoor and balcony plants." },
  { id: 5, name: "Ceramic Planter Set", category: "decor", price: 2199, image: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&w=1000&q=80", desc: "Minimal planter set for modern home decoration." },
  { id: 6, name: "Herb Garden Starter Kit", category: "kits", price: 2999, image: "https://images.unsplash.com/photo-1524593166156-312f362cada0?auto=format&fit=crop&w=1000&q=80", desc: "Grow basil, mint and coriander at home." },
  { id: 7, name: "Neem Pest Spray", category: "pest", price: 799, image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=1000&q=80", desc: "Plant-safe pest control for leaves and soil." },
  { id: 8, name: "Gardening Tool Set", category: "tools", price: 3499, image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1000&q=80", desc: "Pruner, trowel, gloves and hand rake." },
  { id: 9, name: "Plant Care E-book", category: "digital", price: 499, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80", desc: "Digital care guide for indoor plants." },
  { id: 10, name: "Balcony Garden Blueprint", category: "digital", price: 999, image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=80", desc: "Printable setup plan for small balcony gardens." },
  { id: 11, name: "Cactus Mini Set", category: "plants", price: 1299, image: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&w=1000&q=80", desc: "Cute mini cactus collection for desks and shelves." },
  { id: 12, name: "Watering Can", category: "tools", price: 1199, image: "https://images.unsplash.com/photo-1581578017423-042e335bd49f?auto=format&fit=crop&w=1000&q=80", desc: "Stylish watering can for indoor gardening." }
];

async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '1234';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const dbName = process.env.DB_NAME || 'gardenology';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, port });
  } catch (err) {
    console.error('Database connection failed! Please check your credentials in .env and verify MySQL is running.');
    console.error(err.message);
    process.exit(1);
  }

  try {
    // 1. Create database
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // 2. Reconnect with database selected
    connection = await mysql.createConnection({ host, user, password, port, database: dbName });

    // 3. Create categories table
    console.log('Creating "categories" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        \`desc\` TEXT,
        image VARCHAR(255)
      )
    `);

    // 4. Create products table
    console.log('Creating "products" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        image VARCHAR(255),
        \`desc\` TEXT,
        FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // 5. Create seller_applications table
    console.log('Creating "seller_applications" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seller_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        brand_name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Create contact_submissions table
    console.log('Creating "contact_submissions" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Create orders table
    console.log('Creating "orders" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        total_price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Create order_items table
    console.log('Creating "order_items" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        qty INT NOT NULL,
        price INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // 9. Seed categories
    const [categoriesCount] = await connection.query('SELECT COUNT(*) AS count FROM categories');
    if (categoriesCount[0].count === 0) {
      console.log('Seeding categories...');
      for (const cat of categoriesSeed) {
        await connection.query(
          'INSERT INTO categories (id, name, icon, \`desc\`, image) VALUES (?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.icon, cat.desc, cat.image]
        );
      }
      console.log('Categories seeded.');
    } else {
      console.log('Categories table is already populated.');
    }

    // 10. Seed products
    const [productsCount] = await connection.query('SELECT COUNT(*) AS count FROM products');
    if (productsCount[0].count === 0) {
      console.log('Seeding products...');
      for (const prod of productsSeed) {
        await connection.query(
          'INSERT INTO products (id, name, category, price, image, \`desc\`) VALUES (?, ?, ?, ?, ?, ?)',
          [prod.id, prod.name, prod.category, prod.price, prod.image, prod.desc]
        );
      }
      console.log('Products seeded.');
    } else {
      console.log('Products table is already populated.');
    }

    console.log('MySQL Database Initialization and Seeding Completed Successfully! 🎉');
  } catch (err) {
    console.error('An error occurred during database initialization:');
    console.error(err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
