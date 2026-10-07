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
  academicYear: String,
  mustChangePassword: { type: Boolean, default: false },
  notifications: { type: Boolean, default: true },
  weeklyDigest: { type: Boolean, default: true },
}, { timestamps: true })

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  abstract: String,
  problemStatement: String,
  solution: String,
  type: String,
  year: String,
  progress: { type: Number, default: 0 },
  color: String,
  mentor: String,
  members: [String],
  memberDetails: [{ name: String, email: String, batch: String, academicYear: String, department: String, rollNo: String }],
  tech: [String],
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

const guidanceSchema = new mongoose.Schema({
  project: String,
  message: { type: String, required: true },
  from: String,
  fromUserId: String,
  status: { type: String, default: 'Sent' },
}, { timestamps: true })

const requestSchema = new mongoose.Schema({
  project: String,
  from: String,
  fromUserId: String,
  to: String,
  invitee: Object,
  type: String,
  status: { type: String, default: 'pending' },
  taskId: String,
  taskTitle: String,
  proof: String,
}, { timestamps: true })

const feedbackSchema = new mongoose.Schema({
  requestId: String,
  project: String,
  from: String,
  type: String,
  status: String,
  message: String,
  userId: String,
}, { timestamps: true })

const messageSchema = new mongoose.Schema({
  channel: String,
  groupId: String,
  author: String,
  authorId: String,
  role: String,
  text: { type: String, required: true },
}, { timestamps: true })

const chatGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  project: { type: String, required: true },
  createdBy: { type: String, required: true },
  memberIds: [String],
}, { timestamps: true })

const knowledgeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: String,
  tag: String,
  owner: String,
  ownerId: String,
  year: String,
  description: String,
  link: String,
}, { timestamps: true })

const processSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  steps: [String],
  updatedBy: String,
}, { timestamps: true })

const academicYearSchema = new mongoose.Schema({
  year: { type: String, required: true, unique: true },
  createdBy: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema)
const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema)
const Guidance = mongoose.models.Guidance || mongoose.model('Guidance', guidanceSchema)
const Request = mongoose.models.Request || mongoose.model('Request', requestSchema)
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema)
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)
const ChatGroup = mongoose.models.ChatGroup || mongoose.model('ChatGroup', chatGroupSchema)
const Knowledge = mongoose.models.Knowledge || mongoose.model('Knowledge', knowledgeSchema)
const Process = mongoose.models.Process || mongoose.model('Process', processSchema)
const AcademicYear = mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema)

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  batch: user.batch,
  academicYear: user.academicYear || normalizeAcademicYear(user.batch),
  mustChangePassword: Boolean(user.mustChangePassword),
  notifications: user.notifications,
  weeklyDigest: user.weeklyDigest,
})

function normalizeAcademicYear(value) {
  const match = String(value || '').match(/\b(20\d{2})(?:\s*[-/–]\s*(?:20)?\d{2})?\b/)
  if (!match) return ''
  const startYear = Number(match[1])
  return `${startYear}-${startYear + 1}`
}

function isValidAcademicYear(value) {
  return /^20\d{2}-20\d{2}$/.test(String(value || ''))
    && Number(value.slice(5)) === Number(value.slice(0, 4)) + 1
}

function defaultAcademicYears() {
  const currentStart = new Date().getFullYear() - (new Date().getMonth() < 6 ? 1 : 0)
  const endYear = Math.max(2028, currentStart)
  return Array.from({ length: endYear - (currentStart - 6) + 1 }, (_, index) => {
    const startYear = currentStart - 6 + index
    return `${startYear}-${startYear + 1}`
  })
}

function sortAcademicYears(years) {
  return [...new Set(years)].sort((left, right) => Number(left.slice(0, 4)) - Number(right.slice(0, 4)))
}

app.get('/api/health', (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'degraded',
    backend: 'ok',
    database: databaseReady ? 'connected' : 'unavailable',
    message: databaseReady ? 'ProjectVault backend is running' : 'ProjectVault backend is running, but MongoDB is unavailable.',
  })
})

app.get('/api/academic-years', asyncRoute(async (_req, res) => {
  const savedYears = await AcademicYear.find({}).select('year -_id').lean()
  res.json(sortAcademicYears([...defaultAcademicYears(), ...savedYears.map(({ year }) => year)]))
}))

app.post('/api/academic-years', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ message: 'Only HOD users can add academic years.' })
  const year = String(req.body?.year || '').trim()
  if (!isValidAcademicYear(year)) return res.status(400).json({ message: 'Enter a valid academic year, such as 2029-2030.' })

  const existingYear = await AcademicYear.findOne({ year })
  if (existingYear || defaultAcademicYears().includes(year)) return res.status(409).json({ message: 'That academic year is already available.' })

  const createdYear = await AcademicYear.create({ year, createdBy: req.user.id })
  const savedYears = await AcademicYear.find({}).select('year -_id').lean()
  res.status(201).json({ year: createdYear.year, academicYears: sortAcademicYears([...defaultAcademicYears(), ...savedYears.map(({ year: savedYear }) => savedYear)]) })
}))

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { name, email, password, role, department, batch, academicYear, secret } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' })
  }
  if (!['student', 'mentor', 'hod'].includes(role || 'student')) return res.status(400).json({ message: 'Invalid role.' })
  if ((role || 'student') === 'student' && !isValidAcademicYear(academicYear)) return res.status(400).json({ message: 'Select a valid academic year.' })
  if (role === 'mentor' && secret !== process.env.MENTOR_SECRET) return res.status(403).json({ message: 'Invalid mentor secret code.' })
  if (role === 'hod' && secret !== process.env.HOD_SECRET) return res.status(403).json({ message: 'Invalid HOD secret code.' })

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
      batch: batch || academicYear,
      academicYear: (role || 'student') === 'student' ? academicYear : undefined,
    })

    const token = signToken(user)
    return res.status(201).json({ token, user: publicUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password, academicYear } = req.body || {}

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

    if (user.role === 'student') {
      if (!isValidAcademicYear(academicYear)) return res.status(400).json({ message: 'Select your academic year to continue.' })
      const storedYear = user.academicYear || normalizeAcademicYear(user.batch)
      if (!storedYear) return res.status(403).json({ message: 'Your academic year is not verified. Ask your department administrator to update your student profile.' })
      if (storedYear !== academicYear) return res.status(401).json({ message: 'The selected academic year does not match this student account.' })
    }

    const token = signToken(user)
    return res.json({ token, user: publicUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message })
  }
}))

app.put('/api/auth/password', requireAuth, asyncRoute(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' })
  }

  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found.' })
  if (!await comparePassword(currentPassword || '', user.password)) {
    return res.status(401).json({ message: 'Current password is incorrect.' })
  }

  user.password = await hashPassword(newPassword)
  user.mustChangePassword = false
  await user.save()
  res.json({ message: 'Password updated successfully.' })
}))

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    req.user = verifyToken(token)
    if (req.user.mustChangePassword && req.path !== '/api/auth/password') {
      return res.status(403).json({ message: 'Change your temporary password before continuing.', mustChangePassword: true })
    }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function isStudentProjectMember(project, user) {
  return (Array.isArray(project.members) && project.members.includes(user.name))
    || (project.memberDetails || []).some((member) => member.email?.toLowerCase() === user.email?.toLowerCase())
}

function projectAccessFilter(user) {
  if (user.role === 'hod') return {}
  if (user.role === 'mentor') return { mentor: user.name }
  return { $or: [{ members: user.name }, { 'memberDetails.email': user.email }] }
}

app.get('/api/users', requireAuth, asyncRoute(async (req, res) => {
  const requestedRole = ['student', 'mentor', 'hod'].includes(req.query.role) ? req.query.role : null
  if (req.user.role !== 'hod' && requestedRole !== 'mentor') return res.status(403).json({ message: 'Only HOD users can view department users.' })
  const users = await User.find(requestedRole ? { role: requestedRole } : {}).select('-password').sort({ role: 1, name: 1 })
  res.json(users.map(publicUser))
}))

app.get('/api/mentors', requireAuth, asyncRoute(async (_req, res) => {
  const mentors = await mongoose.connection.collection('mentors').find({}).sort({ name: 1 }).toArray()
  res.json(mentors)
}))

app.post('/api/users', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ message: 'Only HOD users can add department users.' })
  const { name, email, password, role, department, batch, academicYear } = req.body || {}
  if (!name?.trim() || !email?.trim() || !password || !['student', 'mentor', 'hod'].includes(role)) {
    return res.status(400).json({ message: 'Name, email, password, and a valid role are required.' })
  }
  if (role === 'student' && !isValidAcademicYear(academicYear)) return res.status(400).json({ message: 'Select a valid academic year.' })

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) return res.status(409).json({ message: 'A user with this email already exists.' })
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: await hashPassword(password), role, department, batch, academicYear: role === 'student' ? academicYear : undefined })
    res.status(201).json(publicUser(user))
  } catch (error) {
    res.status(500).json({ message: 'User creation failed', error: error.message })
  }
}))

app.delete('/api/users/:id', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ message: 'Only HOD users can remove students.' })
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid student ID.' })

  const student = await User.findById(req.params.id)
  if (!student) return res.status(404).json({ message: 'Student not found.' })
  if (student.role !== 'student') return res.status(400).json({ message: 'Only student accounts can be removed here.' })

  await Project.updateMany(
    {},
    {
      $pull: {
        members: student.name,
        memberDetails: { $or: [{ email: student.email }, { name: student.name }] },
      },
    },
  )
  await Request.deleteMany({ $or: [{ to: student.email }, { fromUserId: student._id.toString() }] })
  await ChatGroup.updateMany({ memberIds: student._id.toString() }, { $pull: { memberIds: student._id.toString() } })
  await User.findByIdAndDelete(student._id)

  res.status(204).end()
}))

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
      problemStatement: req.body.problemStatement,
      solution: req.body.solution,
      type: req.body.type || 'New project',
      year: req.body.year || new Date().getFullYear().toString(),
      progress: req.body.progress || 0,
      color: req.body.color || 'blue',
      mentor: req.body.mentor || 'Mentor to be requested',
      members: req.body.members || [],
      memberDetails: req.body.memberDetails || [],
      tech: req.body.tech || [],
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

app.put('/api/projects/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!['mentor', 'hod', 'student'].includes(req.user.role)) return res.status(403).json({ message: 'You cannot update projects.' })
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!project) return res.status(404).json({ message: 'Project not found' })
  res.json(project)
}))

app.delete('/api/projects/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!['mentor', 'hod'].includes(req.user.role)) return res.status(403).json({ message: 'Only mentors and HODs can delete projects.' })
  const project = await Project.findByIdAndDelete(req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })
  await Promise.all([
    Task.deleteMany({ project: project.name }),
    Request.deleteMany({ project: project.name }),
  ])
  res.status(204).end()
}))

app.get('/api/tasks', requireAuth, asyncRoute(async (req, res) => {
  let taskFilter = {}
  if (req.user.role === 'student') {
    const memberProjects = await Project.find({
      $or: [
        { members: req.user.name },
        { 'memberDetails.email': req.user.email },
      ],
    }).select('name')
    taskFilter = { project: { $in: memberProjects.map((project) => project.name) } }
  }

  const tasks = await Task.find(taskFilter).sort({ createdAt: -1 })
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

app.delete('/api/tasks/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!['mentor', 'hod'].includes(req.user.role)) return res.status(403).json({ message: 'Only mentors and HODs can delete tasks.' })
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task ID.' })
  const task = await Task.findByIdAndDelete(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found.' })
  await Request.deleteMany({ taskId: task._id.toString() })
  res.status(204).end()
}))

app.get('/api/guidance', requireAuth, asyncRoute(async (_req, res) => {
  res.json(await Guidance.find({}).sort({ createdAt: -1 }))
}))

app.post('/api/guidance', requireAuth, asyncRoute(async (req, res) => {
  const guidance = await Guidance.create({ ...req.body, from: req.user.name, fromUserId: req.user.id })
  res.status(201).json(guidance)
}))

app.get('/api/requests', requireAuth, asyncRoute(async (_req, res) => {
  res.json(await Request.find({ status: 'pending' }).sort({ createdAt: -1 }))
}))

app.post('/api/requests', requireAuth, asyncRoute(async (req, res) => {
  const request = await Request.create({ ...req.body, from: req.user.name, fromUserId: req.user.id })
  res.status(201).json(request)
}))

app.put('/api/requests/:id', requireAuth, asyncRoute(async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
  if (!request) return res.status(404).json({ message: 'Request not found' })
  const feedback = await Feedback.create({ requestId: request._id.toString(), project: request.project, from: request.from, type: request.type, status: request.status, message: req.body.message || '', userId: req.user.id })
  res.json({ request, feedback })
}))

app.get('/api/feedback', requireAuth, asyncRoute(async (_req, res) => {
  res.json(await Feedback.find({}).sort({ createdAt: -1 }))
}))

app.get('/api/messages', requireAuth, asyncRoute(async (req, res) => {
  const user = req.user
  const [projects, groups] = await Promise.all([
    Project.find(projectAccessFilter(user)).select('name'),
    ChatGroup.find({ memberIds: user.id }).select('_id'),
  ])
  const messageFilters = [{ channel: { $in: projects.map((project) => project.name) }, groupId: { $exists: false } }]
  if (groups.length) messageFilters.push({ groupId: { $in: groups.map((group) => group._id.toString()) } })
  res.json(await Message.find({ $or: messageFilters }).sort({ createdAt: 1 }))
}))

app.post('/api/messages', requireAuth, asyncRoute(async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) return res.status(400).json({ message: 'Message text is required.' })

  const groupId = typeof req.body.groupId === 'string' ? req.body.groupId : ''
  let channel
  if (groupId) {
    if (!mongoose.isValidObjectId(groupId)) return res.status(400).json({ message: 'Invalid chat group.' })
    const group = await ChatGroup.findById(groupId)
    if (!group || !group.memberIds.includes(req.user.id)) return res.status(403).json({ message: 'You are not a member of this chat group.' })
    channel = `student-group:${group._id}`
  } else {
    channel = typeof req.body.channel === 'string' ? req.body.channel.trim() : ''
    const project = await Project.findOne({ name: channel })
    if (!project) return res.status(404).json({ message: 'Project chat not found.' })
    const allowed = req.user.role === 'hod'
      || (req.user.role === 'mentor' && project.mentor === req.user.name)
      || (req.user.role === 'student' && isStudentProjectMember(project, req.user))
    if (!allowed) return res.status(403).json({ message: 'You cannot send messages to this project room.' })
  }

  const message = await Message.create({ channel, groupId: groupId || undefined, author: req.user.name, authorId: req.user.id, role: req.user.role, text })
  res.status(201).json(message)
}))

app.get('/api/chat-groups', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'student') return res.json([])
  const groups = await ChatGroup.find({ memberIds: req.user.id }).sort({ createdAt: -1 }).lean()
  res.json(groups.map(({ _id, name, project, memberIds }) => ({ _id, name, project, memberCount: memberIds.length })))
}))

app.post('/api/chat-groups', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can create student chat groups.' })
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const projectName = typeof req.body?.project === 'string' ? req.body.project.trim() : ''
  if (!name || !projectName) return res.status(400).json({ message: 'Group name and project are required.' })

  const project = await Project.findOne({ name: projectName })
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  if (!isStudentProjectMember(project, req.user)) return res.status(403).json({ message: 'You can only create a group for one of your project teams.' })

  const memberNames = (project.members || []).filter(Boolean)
  const memberEmails = (project.memberDetails || []).map((member) => member.email?.trim().toLowerCase()).filter(Boolean)
  const rosterFilters = []
  if (memberNames.length) rosterFilters.push({ name: { $in: memberNames } })
  if (memberEmails.length) rosterFilters.push({ email: { $in: memberEmails } })
  const students = rosterFilters.length
    ? await User.find({ role: 'student', $or: rosterFilters }).select('_id')
    : []
  const memberIds = [...new Set([...students.map((student) => student._id.toString()), req.user.id])]
  const group = await ChatGroup.create({ name, project: project.name, createdBy: req.user.id, memberIds })
  res.status(201).json({ _id: group._id, name: group.name, project: group.project, memberCount: memberIds.length })
}))

app.get('/api/knowledge', requireAuth, asyncRoute(async (_req, res) => {
  res.json(await Knowledge.find({}).sort({ createdAt: -1 }))
}))

app.post('/api/knowledge', requireAuth, asyncRoute(async (req, res) => {
  const item = await Knowledge.create({ ...req.body, owner: req.user.name, ownerId: req.user.id })
  res.status(201).json(item)
}))

app.get('/api/process', requireAuth, asyncRoute(async (_req, res) => {
  const process = await Process.findOne({ key: 'default' })
  res.json(process || { key: 'default', steps: [] })
}))

app.put('/api/process', requireAuth, asyncRoute(async (req, res) => {
  if (!['mentor', 'hod'].includes(req.user.role)) return res.status(403).json({ message: 'Only mentors and HODs can update the process.' })
  const process = await Process.findOneAndUpdate({ key: 'default' }, { key: 'default', steps: req.body.steps || [], updatedBy: req.user.id }, { new: true, upsert: true, runValidators: true })
  res.json(process)
}))

app.put('/api/me', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role === 'student' && req.body.academicYear && !isValidAcademicYear(req.body.academicYear)) return res.status(400).json({ message: 'Select a valid academic year.' })
  const updates = { name: req.body.name, email: req.body.email, department: req.body.department, batch: req.body.batch, notifications: req.body.notifications, weeklyDigest: req.body.weeklyDigest }
  if (req.user.role === 'student' && req.body.academicYear) {
    updates.academicYear = req.body.academicYear
    updates.batch = req.body.academicYear
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(publicUser(user))
}))

app.get('/api/reports', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role === 'hod') {
    return res.json(await Report.find({}).sort({ createdAt: -1 }))
  }

  const projectFilter = req.user.role === 'mentor'
    ? { mentor: req.user.name }
    : { $or: [{ members: req.user.name }, { 'memberDetails.email': req.user.email }] }
  const projects = await Project.find(projectFilter).select('name')
  const reports = await Report.find({ projectName: { $in: projects.map((project) => project.name) } }).sort({ createdAt: -1 })
  res.json(reports)
}))

app.post('/api/reports', requireAuth, asyncRoute(async (req, res) => {
  const { projectName, guidance, week } = req.body || {}
  if (!projectName?.trim()) return res.status(400).json({ message: 'Project name is required.' })

  const project = await Project.findOne({ name: projectName.trim() })
  if (!project) return res.status(404).json({ message: 'Project not found.' })

  const isProjectMember = (Array.isArray(project.members) && project.members.includes(req.user.name))
    || (project.memberDetails || []).some((member) => member.email?.toLowerCase() === req.user.email?.toLowerCase())
  const canAccessProject = req.user.role === 'hod'
    || (req.user.role === 'mentor' && project.mentor === req.user.name)
    || (req.user.role === 'student' && isProjectMember)
  if (!canAccessProject) return res.status(403).json({ message: 'You can only generate reports for your own project groups.' })

  try {
    const tasks = await Task.find({ project: project.name }).lean()
    const reportGuidance = Array.isArray(guidance)
      ? guidance.filter((item) => typeof item?.message === 'string').map((item) => ({ message: item.message.trim() }))
      : []
    const reportText = buildWeeklyReport({
      projectName: project.name,
      student: req.user.name,
      tasks,
      guidance: reportGuidance,
    })

    const report = await Report.create({
      projectName: project.name,
      student: req.user.name,
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

app.delete('/api/achievements/:id', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ message: 'Only HOD users can remove achievements.' })
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid achievement ID.' })
  const achievement = await Achievement.findByIdAndDelete(req.params.id)
  if (!achievement) return res.status(404).json({ message: 'Achievement not found.' })
  res.status(204).end()
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
