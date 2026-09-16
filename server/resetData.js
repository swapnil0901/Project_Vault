import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './db.js'

dotenv.config()

try {
  await connectDB()
  const collections = Object.values(mongoose.connection.collections)
  await Promise.all(collections.map((collection) => collection.deleteMany({})))
  console.log('Database cleared. Add real users, projects, and tasks through the application.')
} finally {
  await mongoose.disconnect()
}
