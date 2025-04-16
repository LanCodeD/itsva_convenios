import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 150, // Ajusta este valor según tus necesidades
  queueLimit: 0,
});

export async function connectDB() {
  return pool.getConnection();
}
