import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import { signToken, hashPassword, comparePassword, verifyToken } from './auth.js'
import { buildWeeklyReport, buildProjectSummary } from './reportService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter(Boolean)
  .map((origin) => origin.startsWith('http') ? origin : `https://${origin}`)
const allowedOrigins = [...new Set([...configuredOrigins, ...vercelOrigins])]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS origin is not allowed: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor', 'hod'], default: 'student' },
  department: String,
  batch: String,
}, { timestamps: true })

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  abstract: String,
  type: String,
  year: String,
  progress: { type: Number, default: 0 },
  color: String,
  mentor: String,
  members: [String],
  github: String,
  drive: String,
  deployed: String,
  image: String,
  gallery: [String],
  completed: { type: Boolean, default: false },
}, { timestamps: true })

const taskSchema = new mongoose.Schema({
  title: String,
  project: String,
  due: String,
  priority: { type: String, default: 'Medium' },
  done: { type: Boolean, default: false },
  proof: String,
  approved: { type: Boolean, default: false },
  completedAt: String,
  userId: String,
}, { timestamps: true })

const reportSchema = new mongoose.Schema({
  projectName: String,
  student: String,
  content: String,
  week: String,
  createdBy: String,
}, { timestamps: true })

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  detail: String,
  tag: String,
  year: String,
  createdBy: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema)
const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema)

app.get('/api/health', (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'degraded',
    backend: 'ok',
    database: databaseReady ? 'connected' : 'unavailable',
    message: databaseReady ? 'ProjectVault backend is running' : 'ProjectVault backend is running, but MongoDB is unavailable.',
  })
})

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { name, email, password, role, department, batch } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' })
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' })
    }

    const hashedPassword = await hashPassword(password)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      department,
      batch,
    })

    const token = signToken(user)
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const token = signToken(user)
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message })
  }
}))

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

app.get('/api/projects', requireAuth, asyncRoute(async (_req, res) => {
  const projects = await Project.find({}).sort({ createdAt: -1 })
  res.json(projects)
}))

app.post('/api/projects', requireAuth, asyncRoute(async (req, res) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      abstract: req.body.abstract || req.body.description,
      type: req.body.type || 'New project',
      year: req.body.year || new Date().getFullYear().toString(),
      progress: req.body.progress || 0,
      color: req.body.color || 'blue',
      mentor: req.body.mentor || 'Mentor to be requested',
      members: req.body.members || [],
      github: req.body.github,
      drive: req.body.drive,
      deployed: req.body.deployed,
      image: req.body.image,
      gallery: req.body.gallery || [],
      completed: req.body.completed || false,
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: 'Project creation failed', error: error.message })
  }
}))

app.get('/api/tasks', requireAuth, asyncRoute(async (_req, res) => {
  const tasks = await Task.find({}).sort({ createdAt: -1 })
  res.json(tasks)
}))

app.get('/api/overview-summary', requireAuth, asyncRoute(async (_req, res) => {
  const [activeMentors, activeProjects, tasksDue] = await Promise.all([
    User.countDocuments({ role: 'mentor' }),
    Project.countDocuments({ completed: { $ne: true } }),
    Task.countDocuments({ done: { $ne: true } }),
  ])

  res.json({ activeMentors, activeProjects, groupsCovered: activeProjects, tasksDue })
}))

app.post('/api/tasks', requireAuth, asyncRoute(async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user.id })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Task creation failed', error: error.message })
  }
}))

app.put('/api/tasks/:id', requireAuth, asyncRoute(async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Task update failed', error: error.message })
  }
}))

app.get('/api/reports', requireAuth, asyncRoute(async (_req, res) => {
  const reports = await Report.find({}).sort({ createdAt: -1 })
  res.json(reports)
}))

app.post('/api/reports', requireAuth, asyncRoute(async (req, res) => {
  const { projectName, student, tasks, guidance, week } = req.body || {}

  try {
    const reportText = buildWeeklyReport({
      projectName,
      student,
      tasks,
      guidance,
    })

    const report = await Report.create({
      projectName,
      student,
      content: reportText,
      week: week || 'Current week',
      createdBy: req.user.id,
    })

    res.status(201).json({ report, content: reportText })
  } catch (error) {
    res.status(500).json({ message: 'Report generation failed', error: error.message })
  }
}))

app.get('/api/summary/:projectName', requireAuth, asyncRoute(async (req, res) => {
  const { projectName } = req.params
  const project = await Project.findOne({ name: projectName })
  const tasks = await Task.find({ project: projectName })

  const summary = buildProjectSummary({
    projectName,
    progress: project?.progress || 0,
    taskCount: tasks.length,
    completedCount: tasks.filter((task) => task.done).length,
  })

  res.json({ summary })
}))

app.get('/api/achievements', requireAuth, asyncRoute(async (_req, res) => {
  const achievements = await Achievement.find({}).sort({ createdAt: -1 })
  res.json(achievements)
}))

app.post('/api/achievements', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ message: 'Only HOD users can publish achievements.' })
  if (!req.body?.title?.trim()) return res.status(400).json({ message: 'Achievement title is required.' })
  const achievement = await Achievement.create({ ...req.body, createdBy: req.user.id })
  res.status(201).json(achievement)
}))

app.post('/api/ai/project-advice', requireAuth, asyncRoute(async (req, res) => {
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ message: 'AI integration is not configured. Add OPENAI_API_KEY to the server environment.' })
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are an academic project advisor. Give concise, practical guidance.' }, { role: 'user', content: req.body?.prompt || '' }], temperature: 0.3 }),
  })
  const payload = await response.json()
  if (!response.ok) return res.status(response.status).json({ message: payload?.error?.message || 'AI request failed.' })
  res.json({ answer: payload.choices?.[0]?.message?.content || 'No advice returned.' })
}))

app.get('/api/github/repository', requireAuth, asyncRoute(async (req, res) => {
  const repositoryUrl = String(req.query.url || '')
  const match = repositoryUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/)
  if (!match) return res.status(400).json({ message: 'Provide a public GitHub repository URL.' })
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const response = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`, { headers })
  const payload = await response.json()
  if (!response.ok) return res.status(response.status).json({ message: payload?.message || 'GitHub request failed.' })
  res.json({ name: payload.name, description: payload.description, language: payload.language, stars: payload.stargazers_count, forks: payload.forks_count, openIssues: payload.open_issues_count, updatedAt: payload.updated_at, url: payload.html_url })
}))

app.use((error, _req, res, _next) => {
  console.error('API request failed:', error.message)
  if (res.headersSent) return
  res.status(503).json({ message: 'Database or backend service is temporarily unavailable.' })
})

const startServer = async () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProjectVault backend running on http://localhost:${PORT}`)
  })

  server.on('error', (error) => {
    console.error('ProjectVault backend failed to start:', error.message)
    process.exitCode = 1
  })

  const connectWithRetry = async () => {
    try {
      await connectDB()
    } catch (error) {
      console.error('MongoDB is unavailable; retrying in 30 seconds:', error.message)
      setTimeout(connectWithRetry, 30000)
    }
  }

  await connectWithRetry()
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('ProjectVault backend startup failed:', error.message)
    process.exitCode = 1
  })
}

export { app }
