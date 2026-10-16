import { app } from '../../server/index.js'
import { connectDB } from '../../server/db.js'

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
    console.error('AI API startup failed:', error.message)
    req.projectVaultDatabaseUnavailable = true
    return app(req, res)
  }
}
