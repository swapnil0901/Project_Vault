import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL

  if (!uri) {
    throw new Error(
      'MongoDB connection string is missing. Add MONGODB_URI to the Vercel environment variables.'
    )
  }

  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
      })

      await mongoose.connection.db.admin().ping()

      console.log('MongoDB connected successfully')
      return mongoose.connection
    } catch (error) {
      lastError = error

      console.error(
        `MongoDB connection attempt ${attempt}/3 failed:`,
        error.message
      )

      await mongoose.disconnect().catch(() => {})

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  throw lastError
}