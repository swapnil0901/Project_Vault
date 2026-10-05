import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { hashPassword } from './auth.js'
import { connectDB } from './db.js'

dotenv.config()

const department = 'Computer Science & Engineering'
const slugify = (name) => name
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '.')
  .replace(/^\.|\.$/g, '')

function academicYearFor(member, project) {
  const value = member.academicYear || member.batch || project.year || ''
  const match = String(value).match(/\b(20\d{2})\s*[-/–]\s*(20)?(\d{2})\b/)
  if (!match) return ''
  const start = Number(match[1])
  const end = Number(`${match[2] || String(start).slice(0, 2)}${match[3]}`)
  return end === start + 1 ? `${start}-${end}` : ''
}

try {
  await connectDB()
  const db = mongoose.connection.db
  const now = new Date()
  const [mentorProfiles, projectRecords, existingAccounts] = await Promise.all([
    db.collection('mentors').find({}).toArray(),
    db.collection('projects').find({}).toArray(),
    db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray(),
  ])

  const plannedAccounts = new Map()
  for (const mentor of mentorProfiles) {
    if (mentor.name) plannedAccounts.set(`mentor:${mentor.name.toLowerCase()}`, { name: mentor.name, role: 'mentor', academicYear: '' })
  }

  const studentProjects = new Map()
  for (const project of projectRecords) {
    for (const member of project.memberDetails || []) {
      if (!member.name) continue
      const key = member.name.trim().toLowerCase()
      const entry = studentProjects.get(key) || { name: member.name.trim(), academicYear: '', projects: [] }
      entry.academicYear ||= academicYearFor(member, project)
      entry.projects.push({ projectName: project.name, academicYear: academicYearFor(member, project) })
      studentProjects.set(key, entry)
    }
    for (const name of project.members || []) {
      if (!name?.trim()) continue
      const key = name.trim().toLowerCase()
      const entry = studentProjects.get(key) || { name: name.trim(), academicYear: '', projects: [] }
      entry.academicYear ||= academicYearFor({}, project)
      if (!entry.projects.some((item) => item.projectName === project.name)) entry.projects.push({ projectName: project.name, academicYear: academicYearFor({}, project) })
      studentProjects.set(key, entry)
    }
  }

  for (const [key, student] of studentProjects) {
    plannedAccounts.set(`student:${key}`, { ...student, role: 'student' })
  }

  const accountsByEmail = new Map(existingAccounts.map((account) => [account.email.toLowerCase(), account]))
  const accountsByRoleAndName = new Map(existingAccounts.map((account) => [`${account.role}:${account.name.trim().toLowerCase()}`, account]))
  let createdMentors = 0
  let createdStudents = 0
  let skippedExisting = 0

  for (const account of plannedAccounts.values()) {
    const existingByName = accountsByRoleAndName.get(`${account.role}:${account.name.trim().toLowerCase()}`)
    if (existingByName) {
      skippedExisting += 1
      if (account.role === 'student') {
        await db.collection('projects').updateMany(
          { name: { $in: account.projects.map((project) => project.projectName) }, 'memberDetails.name': account.name },
          { $set: { 'memberDetails.$[member].email': existingByName.email, 'memberDetails.$[member].academicYear': account.academicYear } },
          { arrayFilters: [{ 'member.name': account.name }] },
        )
      }
      continue
    }

    const email = `${slugify(account.name)}@projectvault.local`
    const existingByEmail = accountsByEmail.get(email)
    if (existingByEmail) {
      skippedExisting += 1
      continue
    }

    const temporaryPassword = account.role === 'mentor' ? 'abc123' : `${account.name}123`
    const document = {
      name: account.name,
      email,
      password: await hashPassword(temporaryPassword),
      role: account.role,
      department,
      batch: account.academicYear,
      academicYear: account.academicYear || undefined,
      mustChangePassword: true,
      notifications: true,
      weeklyDigest: true,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('users').insertOne(document)
    accountsByEmail.set(email, document)
    accountsByRoleAndName.set(`${account.role}:${account.name.trim().toLowerCase()}`, document)
    if (account.role === 'mentor') createdMentors += 1
    else createdStudents += 1

    if (account.role === 'student') {
      for (const membership of account.projects) {
        await db.collection('projects').updateOne(
          { name: membership.projectName, 'memberDetails.name': account.name },
          { $set: { 'memberDetails.$.email': email, 'memberDetails.$.academicYear': membership.academicYear || account.academicYear } },
        )
      }
    }
  }

  console.log(JSON.stringify({ createdMentors, createdStudents, skippedExisting, totalAccounts: await db.collection('users').countDocuments() }))
} catch (error) {
  console.error('Roster account provisioning failed:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}