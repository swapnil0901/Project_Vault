import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './db.js'

dotenv.config()

const projects = [
  { name: 'Smart HealthNet', type: 'AI HealthTech', year: '2026', abstract: 'Explainable health risk monitoring for clinics.', progress: 72, color: 'coral', members: [], mentor: 'To be assigned' },
  { name: 'Campus Connect', type: 'EdTech', year: '2026', abstract: 'A peer learning and campus resource network.', progress: 48, color: 'blue', members: [], mentor: 'To be assigned' },
  { name: 'EcoTrack', type: 'Climate IoT', year: '2026', abstract: 'Low-cost energy monitoring for sustainable campuses.', progress: 31, color: 'yellow', members: [], mentor: 'To be assigned' },
  { name: 'SafeRoute', type: 'Smart City', year: '2026', abstract: 'Safer route planning using community mobility data.', progress: 18, color: 'green', members: [], mentor: 'To be assigned' },
  { name: 'StudySphere', type: 'Learning Platform', year: '2026', abstract: 'Structured study groups and shared academic resources.', progress: 12, color: 'purple', members: [], mentor: 'To be assigned' },
]

const tasks = [
  { title: 'Finalize system architecture', project: 'Smart HealthNet', due: '2026-09-12', priority: 'High', done: false },
  { title: 'Review literature survey', project: 'Campus Connect', due: '2026-09-14', priority: 'Medium', done: false },
  { title: 'Define sensor metrics', project: 'EcoTrack', due: '2026-09-18', priority: 'Medium', done: false },
  { title: 'Map route safety inputs', project: 'SafeRoute', due: '2026-09-20', priority: 'Low', done: false },
  { title: 'Prepare usability interviews', project: 'StudySphere', due: '2026-09-22', priority: 'High', done: false },
]

try {
  await connectDB()
  const collections = Object.values(mongoose.connection.collections)
  await Promise.all(collections.map((collection) => collection.deleteMany({})))
  await mongoose.connection.collection('projects').insertMany(projects)
  await mongoose.connection.collection('tasks').insertMany(tasks)
  console.log('Database reset complete: 5 projects and 5 tasks remain.')
} finally {
  await mongoose.disconnect()
}
