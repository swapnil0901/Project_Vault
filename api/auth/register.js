import { app } from '../../../server/index.js'
import { connectDB } from '../../../server/db.js'

let databaseConnection

export default async function handler(req, res) {
  databaseConnection ||= connectDB().catch((error) => {
    databaseConnection = undefined
    throw error
  })

  try {
    await databaseConnection
    return app(req, res)
  } catch (error) {
    console.error('ProjectVault register serverless startup failed:', error.message)
    return res.status(503).json({ message: 'Database or backend service is temporarily unavailable.' })
  }
}
