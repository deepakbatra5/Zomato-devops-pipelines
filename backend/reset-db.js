// Simple database reset script - no dependencies needed
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/zomato_db'
});

async function resetDatabase() {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Drop all tables
    await pool.query('DROP TABLE IF EXISTS "OrderItems" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "Orders" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "MenuItems" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "Restaurants" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "Users" CASCADE');
    
    console.log('✅ All tables dropped successfully');
    console.log('\n🎉 Database reset complete! Restart the server to reseed with fresh data including images.');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
