function RoleOverview({ role, onOpen }) {
  const mentor = role === 'mentor'
  const summary = window.__projectvaultOverviewSummary || {}
  const projects = window.__projectvaultOverviewProjects || []
  const tasks = window.__projectvaultOverviewTasks || []
  const activeProjects = projects.filter((project) => !project.completed)
  const groups = mentor ? activeProjects.filter((project) => project.mentor === window.__projectvaultOverviewUser?.name || project.mentor === 'To be assigned') : activeProjects
  const dueTasks = mentor ? tasks.filter((task) => !task.done && groups.some((project) => project.name === task.project)).length : Number(summary.tasksDue || tasks.filter((task) => !task.done).length)
  const countDue = (name) => tasks.filter((task) => task.project === name && !task.done).length

  return <section className={`role-overview role-overview-${role}`}><div className="role-hero"><div><p className="eyebrow">{mentor ? 'Mentor command center' : 'HOD command center'}</p><h2>{mentor ? 'Your groups, moving forward.' : 'Department progress, in one view.'}</h2><p>{mentor ? 'Review group momentum, assign the next task, and keep every team supported.' : 'Track mentors, working groups, achievements, and academic outcomes across the department.'}</p></div><span className="status-pill healthy"><span /> Live workspace</span></div><div className="role-metrics"><MetricCard icon={Users} label={mentor ? 'Working groups' : 'Active mentors'} value={String(mentor ? groups.length : Number(summary.activeMentors || 0)).padStart(2, '0')} delta={mentor ? `${groups.reduce((total, project) => total + (Array.isArray(project.members) ? project.members.length : 0), 0)} students` : `${Number(summary.groupsCovered || activeProjects.length)} groups covered`} tone="green" /><MetricCard icon={FolderKanban} label="Active projects" value={String(mentor ? groups.length : Number(summary.activeProjects || activeProjects.length)).padStart(2, '0')} delta="Across current cycle" tone="coral" /><MetricCard icon={Check} label="Tasks due" value={String(dueTasks).padStart(2, '0')} delta="Needs attention" tone="blue" /></div><div className="role-columns"><div className="panel role-group-panel"><div className="section-heading"><div><p className="eyebrow">{mentor ? 'Assigned groups' : 'Department groups'}</p><h3>Working groups</h3></div><button className="text-button" onClick={() => onOpen('My Groups')}>View all <ArrowUpRight size={14} /></button></div>{groups.slice(0, 3).map((project) => <RoleGroup key={project.id || project.name} name={project.name} mentor={project.mentor || 'To be assigned'} progress={`${Number(project.progress || 0)}%`} tasks={`${countDue(project.name)} tasks due`} />)}</div><div className="panel role-action-panel"><p className="eyebrow">Next actions</p><h3>{mentor ? 'Keep teams unblocked' : 'Department watchlist'}</h3><button className="action-row" onClick={() => onOpen('Task Schedule')}><Check size={16} /><span>Schedule and assign tasks</span><ArrowUpRight size={14} /></button><button className="action-row" onClick={() => onOpen('Reports')}><FileText size={16} /><span>Review weekly reports</span><ArrowUpRight size={14} /></button><button className="action-row" onClick={() => onOpen('Analytics')}><Gauge size={16} /><span>Open progress analytics</span><ArrowUpRight size={14} /></button></div></div></section>
}

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, ArrowRight, ArrowUpRight, Bell, BookOpen, Check, CircleHelp, Eye, EyeOff, FileText, FolderKanban,
  Award, CalendarDays, Gauge, GitBranch, GraduationCap, LayoutDashboard, LockKeyhole, LogIn, Menu, MessageCircle,
  MoreHorizontal, Moon, Plus, Search, Send, Settings, ShieldCheck, Sparkles, Sun, Target, Users, Video, X,
} from 'lucide-react'
import { buildRoleNavigation, calculateProjectProgress, getTaskApprovalStatus, resolveProjectImage, getCertificateItems, calculateSimilarityScore } from './projectLogic.js'
import './styles.css'

const seedProjects = [
  { id: 'healthnet', name: 'Smart HealthNet', type: 'AI · HealthTech', year: 'Final year · 2024', abstract: 'An intelligent health monitoring platform that helps clinics identify risk patterns earlier through explainable machine learning.', problemStatement: 'Clinics need a faster way to detect patient risk patterns and support preventive care using health data and explainable AI.', solution: 'Smart HealthNet uses patient records, sensor data, and explainable machine learning models to identify risk patterns early and guide clinical decisions.', tech: ['Python', 'FastAPI', 'OpenCV', 'MongoDB'], progress: 72, color: 'coral', members: ['Arjun Nair', 'Riya Shah'], mentor: 'Dr. Meera Patel', github: 'https://github.com/', drive: 'https://drive.google.com/', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1538108149393-fbbd81895973?auto=format&fit=crop&w=1200&q=80'] },
  { id: 'campus', name: 'Campus Connect', type: 'EdTech · Mobile', year: 'Third year · 2025', abstract: 'A peer learning network that connects students with study groups, campus events, and trusted academic resources.', problemStatement: 'Students find it difficult to discover peer study groups, campus events, and trusted academic resources in one place.', solution: 'Campus Connect provides a student-focused network for learning groups, event discovery, and collaborative academic support using a mobile-first interface.', tech: ['React Native', 'Node.js', 'MongoDB', 'Socket.IO'], progress: 48, color: 'blue', members: ['Neha Joshi', 'Aman Kumar'], mentor: 'Prof. K. Rao', github: 'https://github.com/', drive: 'https://drive.google.com/', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'] },
  { id: 'ecotrack', name: 'EcoTrack', type: 'Climate · IoT', year: 'Final year · 2024', abstract: 'A low-cost sensor network for monitoring campus energy use and turning environmental data into practical action.', problemStatement: 'Campuses lack a simple way to monitor energy and sustainability patterns across facilities and convert data into actionable steps.', solution: 'EcoTrack uses low-cost IoT sensors and analytics to monitor campus energy use and show practical sustainability recommendations to students and staff.', tech: ['Arduino', 'Python', 'MQTT', 'React'], progress: 31, color: 'yellow', members: ['Meera Das', 'Vikram Singh'], mentor: 'Dr. Anil Thomas', github: 'https://github.com/', drive: 'https://drive.google.com/', image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'] },
]
const initialTasks = [
  { title: 'Finalize system architecture', project: 'Smart HealthNet', due: 'Today', priority: 'High', done: false },
  { title: 'Review literature survey', project: 'Campus Connect', due: 'Tomorrow', priority: 'Medium', done: false },
  { title: 'Upload sprint 04 report', project: 'Smart HealthNet', due: 'Aug 28', priority: 'High', done: false },
]
const roles = { student: { label: 'Student', icon: GraduationCap, detail: 'Discover projects, find collaborators, and request guidance.' }, mentor: { label: 'Mentor', icon: Users, detail: 'Guide teams, review progress, and access project resources.' }, hod: { label: 'HOD', icon: ShieldCheck, detail: 'Oversee departments, projects, and academic outcomes.' } }
const portalNavigation = {
  student: [
    ['Overview', LayoutDashboard], ['All Projects', FolderKanban], ['My Projects', FolderKanban], ['Tasks', Check], ['Reports', FileText], ['AI Center', Sparkles], ['Project Chat', MessageCircle], ['Project Process', ArrowRight], ['Notifications', Bell],
  ],
  mentor: [
    ['Overview', LayoutDashboard], ['My Projects', FolderKanban], ['Mentor Workspace', Users], ['Task Schedule', Check], ['Reports', FileText], ['AI Center', Sparkles], ['Project Chat', MessageCircle], ['Project Process', ArrowRight], ['Analytics', Gauge], ['Project Similarity', Sparkles], ['Notifications', Bell],
  ],
  hod: [
    ['Overview', LayoutDashboard], ['All Projects', FolderKanban], ['Mentors & Groups', ShieldCheck], ['Students', GraduationCap], ['Teams', Users], ['Project Monitoring', Gauge], ['Reports', FileText], ['Project Similarity', Sparkles], ['Alumni', Users], ['Achievements', Award], ['Project Chat', MessageCircle], ['Notifications', Bell],
  ],
}
const normalizeProjects = (stored) => stored.map((project) => ({ ...(seedProjects.find((seed) => seed.name === project.name) || {}), ...project, abstract: project.abstract || seedProjects.find((seed) => seed.name === project.name)?.abstract || project.description || 'Project abstract to be added.', year: project.year || 'Academic project', mentor: project.mentor || 'To be assigned' }))
const defaultProcess = ['Idea and problem definition', 'Proposal and team formation', 'Mentor assignment', 'Literature survey', 'System design', 'Implementation sprints', 'Testing and documentation', 'Final review and presentation']
const seedKnowledge = [
  { id: 'k1', title: 'Smart HealthNet final report', type: 'Project report', tag: 'HealthTech', owner: 'Arjun Nair', year: '2024', description: 'Architecture, evaluation results, and lessons from an explainable health monitoring platform.', link: 'https://drive.google.com/' },
  { id: 'k2', title: 'Computer vision literature survey', type: 'Research paper', tag: 'AI Research', owner: 'Riya Shah', year: '2024', description: 'A curated survey of detection and classification approaches for academic projects.', link: 'https://drive.google.com/' },
  { id: 'k3', title: 'IoT project starter kit', type: 'Tutorial', tag: 'IoT', owner: 'ProjectVault Faculty', year: '2025', description: 'Sensor selection, MQTT setup, data modelling, and testing guidance for student teams.', link: 'https://github.com/' },
  { id: 'k4', title: 'Campus Connect presentation', type: 'Presentation', tag: 'EdTech', owner: 'Neha Joshi', year: '2025', description: 'The problem statement, user research, product decisions, and outcomes from Campus Connect.', link: 'https://drive.google.com/' },
  { id: 'k5', title: 'Project documentation checklist', type: 'Template', tag: 'Process', owner: 'Academic Office', year: '2026', description: 'A practical checklist for proposals, weekly reports, testing evidence, and final submission.', link: 'https://drive.google.com/' },
  { id: 'k6', title: 'Responsible AI project guide', type: 'Guide', tag: 'AI Research', owner: 'Research Cell', year: '2026', description: 'Privacy, evaluation, explainability, and citation practices for student AI work.', link: 'https://drive.google.com/' },
]

const projectMentors = ['Dr. Meera Patel', 'Prof. K. Rao', 'Dr. Anil Thomas', 'Dr. Neha Sinha', 'Prof. Raghav Menon', 'Dr. Priya Nair']
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const pointsToLocalHost = configuredApiUrl?.includes('localhost') || configuredApiUrl?.includes('127.0.0.1')
const API_URL = configuredApiUrl && (isLocalHost || !pointsToLocalHost) ? configuredApiUrl : (isLocalHost ? 'http://localhost:5000' : '')

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('projectvault-token')
  const headers = { ...(options.headers || {}) }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch (_error) {
    throw new Error('Network problem: the ProjectVault server is unreachable. Start the backend and try again.')
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || 'Request failed'
    throw new Error(message)
  }

  return payload
}

function ProjectWizard({ form, setForm, editing, onClose, onSubmit }) {
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateMember = (index, field, value) => setForm((current) => ({ ...current, members: current.members.map((member, memberIndex) => memberIndex === index ? { ...member, [field]: value } : member) }))

  return <div className="modal-backdrop" onClick={onClose}><form className="composer-modal project-wizard" onSubmit={onSubmit} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Project workspace</p><h2>{editing ? 'Edit project' : 'Create a project'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close project wizard"><X size={18} /></button></div><div className="wizard-section"><p className="eyebrow">01 · Project details</p><label>Project title<input autoFocus required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Smart HealthNet" /></label><label>About the project<textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Abstract and overview" rows="3" /></label><label>Problem statement<textarea value={form.problemStatement} onChange={(event) => update('problemStatement', event.target.value)} placeholder="Describe the real problem this project is solving..." rows="3" /></label><label>Solution approach<textarea value={form.solution} onChange={(event) => update('solution', event.target.value)} placeholder="Explain the proposed solution, method, or technology..." rows="3" /></label><label>Project image URL<input type="url" value={form.image} onChange={(event) => update('image', event.target.value)} placeholder="https://images.unsplash.com/..." /></label><div className="wizard-two-column"><label>GitHub source code<input type="url" value={form.github} onChange={(event) => update('github', event.target.value)} placeholder="https://github.com/..." /></label><label>Google Drive documentation<input type="url" value={form.drive} onChange={(event) => update('drive', event.target.value)} placeholder="https://drive.google.com/..." /></label></div></div><div className="wizard-section"><p className="eyebrow">02 · Invite student members</p><p className="wizard-help">Add each student’s name, email, batch, and department. A pending join request will appear in their account.</p>{form.members.map((member, index) => <div className="member-invite-row" key={index}><strong>Member {index + 1}</strong><input value={member.name} onChange={(event) => updateMember(index, 'name', event.target.value)} placeholder="Student name" /><input type="email" value={member.email} onChange={(event) => updateMember(index, 'email', event.target.value)} placeholder="Student email" /><input value={member.batch} onChange={(event) => updateMember(index, 'batch', event.target.value)} placeholder="Batch / year" /><input value={member.department} onChange={(event) => updateMember(index, 'department', event.target.value)} placeholder="Department" /></div>)}</div><div className="wizard-section"><p className="eyebrow">03 · Request a mentor</p><p className="wizard-help">Choose a mentor to send a supervision request. They can accept or reject it from Mentor Workspace.</p><label>Mentor<select value={form.mentor} onChange={(event) => update('mentor', event.target.value)}><option value="">Select a mentor</option>{projectMentors.map((mentor) => <option key={mentor} value={mentor}>{mentor}</option>)}</select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Check size={16} /> {editing ? 'Save project' : 'Create project and send requests'}</button></div></form></div>
}

function App() {
  const [screen, setScreen] = useState(() => (localStorage.getItem('projectvault-token') || localStorage.getItem('projectvault-user')) ? 'app' : 'launch')
  const [theme, setTheme] = useState(() => localStorage.getItem('projectvault-theme') || 'light')
  const [authMode, setAuthMode] = useState('login')
  const [role, setRole] = useState('student')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('projectvault-user') || 'null'))
  const [activePage, setActivePage] = useState('Overview')
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('projectvault-tasks') || JSON.stringify(initialTasks)))
  const [mobileNav, setMobileNav] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const [showProjectWizard, setShowProjectWizard] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [projectForm, setProjectForm] = useState({ name: '', description: '', problemStatement: '', solution: '', github: '', drive: '', deployed: '', image: '', members: [{ name: '', email: '', batch: '', department: '' }, { name: '', email: '', batch: '', department: '' }, { name: '', email: '', batch: '', department: '' }], mentor: '' })
  const [guidance, setGuidance] = useState(() => JSON.parse(localStorage.getItem('projectvault-guidance') || '[]'))
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('projectvault-requests') || JSON.stringify([
    { id: 1, project: 'Smart HealthNet', from: 'Aman Kumar', type: 'collaboration', status: 'pending' },
    { id: 2, project: 'Campus Connect', from: 'Dr. Meera Patel', type: 'mentor', status: 'pending' },
  ])))
  const [requestFeedback, setRequestFeedback] = useState(() => JSON.parse(localStorage.getItem('projectvault-request-feedback') || '[]'))
  const [toast, setToast] = useState('')
  const [authError, setAuthError] = useState('')
  const [proofTask, setProofTask] = useState(null)
  const [showRoleTool, setShowRoleTool] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [processSteps, setProcessSteps] = useState(() => JSON.parse(localStorage.getItem('projectvault-process') || JSON.stringify(defaultProcess)))
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('projectvault-messages') || JSON.stringify([{ id: 1, channel: 'smart-healthnet', author: 'Riya Shah', role: 'Student', text: 'Has everyone reviewed the API contract?', time: '10:42 AM' }, { id: 2, channel: 'mentor-room', author: 'Dr. Meera Patel', role: 'Mentor', text: 'I left feedback on the milestone. Let us discuss it here.', time: 'Yesterday' }])).map((message) => ({ ...message, channel: message.channel || 'smart-healthnet' })))
  const [knowledge, setKnowledge] = useState(() => JSON.parse(localStorage.getItem('projectvault-knowledge') || JSON.stringify(seedKnowledge)))
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('projectvault-settings') || JSON.stringify({ department: 'Computer Science', batch: '2024 · Final year', notifications: true, weeklyDigest: true })))
  const [achievements, setAchievements] = useState(() => JSON.parse(localStorage.getItem('projectvault-achievements') || JSON.stringify([
    { title: 'Best HealthTech project', year: '2025', detail: 'Smart HealthNet won the institutional showcase.', tag: 'HealthTech' },
    { title: 'Innovation showcase finalist', year: '2024', detail: 'Campus Connect reached the final round.', tag: 'Innovation' },
  ])))
  const [overviewSummary, setOverviewSummary] = useState({ activeMentors: 0, activeProjects: 0, groupsCovered: 0, tasksDue: 0 })
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('projectvault-theme', theme)
  }, [theme])

  useEffect(() => {
    if (screen !== 'app' || !localStorage.getItem('projectvault-token')) return

    let cancelled = false
    setDataLoading(true)
    Promise.all([apiRequest('/api/projects'), apiRequest('/api/tasks'), apiRequest('/api/achievements'), apiRequest('/api/overview-summary')])
      .then(([remoteProjects, remoteTasks, remoteAchievements, remoteOverviewSummary]) => {
        if (cancelled) return
        setTasks(remoteTasks)
        setOverviewSummary(remoteOverviewSummary)
        setProjects(normalizeProjects(remoteProjects).map((project) => {
          const projectTasks = remoteTasks.filter((task) => task.project === project.name)
          return projectTasks.length ? { ...project, progress: calculateProjectProgress(projectTasks) } : project
        }))
        setAchievements(remoteAchievements)
      })
      .catch((error) => {
        if (!cancelled) {
          setToast(error.message || 'Could not load workspace data.')
          setTimeout(() => setToast(''), 3200)
        }
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false)
      })

    return () => { cancelled = true }
  }, [screen])

  const completeTask = (index) => {
    const task = tasks[index]
    if (task?._id) {
      updateTaskStatus(task._id, { done: false, proof: '', approved: false })
      return
    }
    setTasks((current) => {
      const nextTasks = current.map((task, taskIndex) => taskIndex === index ? { ...task, done: false, proof: '', approvalPending: false, approved: false, feedback: '' } : task)
      localStorage.setItem('projectvault-tasks', JSON.stringify(nextTasks))
      return nextTasks
    })
  }

  const submitTaskProof = (event) => {
    event.preventDefault()
    const proof = event.currentTarget.proof.value.trim()
    const task = tasks[proofTask.index]
    const updatedTasks = tasks.map((item, index) => index === proofTask.index ? { ...item, proof, approvalPending: true, approved: false, feedback: '' } : item)
    const request = { id: `task-${Date.now()}`, taskId: task._id || task.id, taskTitle: task.title, project: task.project, from: user?.name || 'Student', type: 'task-completion', status: 'pending', proof }
    if (task?._id) apiRequest(`/api/tasks/${task._id}`, { method: 'PUT', body: JSON.stringify({ proof, approved: false }) }).catch((error) => setToast(error.message || 'Could not save task proof.'))
    setTasks(updatedTasks)
    setRequests([request, ...requests])
    localStorage.setItem('projectvault-tasks', JSON.stringify(updatedTasks))
    localStorage.setItem('projectvault-requests', JSON.stringify([request, ...requests]))
    setProofTask(null)
    setToast('Proof sent to mentor for approval')
    setTimeout(() => setToast(''), 2400)
  }

  const createProject = (event) => {
    event.preventDefault()
    if (!projectForm.name.trim()) return
    const safeImage = projectForm.image.trim() || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
    const invitedMembers = projectForm.members.filter((member) => member.name.trim() || member.email.trim()).map((member) => ({ ...member, name: member.name.trim(), email: member.email.trim(), batch: member.batch.trim(), department: member.department.trim() }))
    const existingProject = editingProjectId ? projects.find((project) => project.id === editingProjectId) : null
    const memberNames = existingProject?.members?.length ? existingProject.members : [user?.name || 'Student', ...invitedMembers.map((member) => member.name || member.email)]
    const projectData = { name: projectForm.name.trim(), type: 'New project', year: projectForm.members[0]?.batch?.trim() || 'New project', abstract: projectForm.description.trim() || 'Project abstract to be added.', problemStatement: projectForm.problemStatement.trim() || projectForm.description.trim() || 'Problem statement to be added.', solution: projectForm.solution.trim() || 'Solution approach to be added.', progress: 0, color: 'green', members: memberNames, memberDetails: invitedMembers, mentor: projectForm.mentor || 'Mentor to be requested', github: projectForm.github.trim(), drive: projectForm.drive.trim(), deployed: projectForm.deployed.trim(), image: safeImage, gallery: [safeImage] }
    const nextProjects = editingProjectId ? projects.map((project) => project.id === editingProjectId ? { ...project, ...projectData, id: editingProjectId, progress: project.progress, color: project.color } : project) : [...projects, { id: Date.now().toString(), ...projectData }]
    setProjects(nextProjects)
    localStorage.setItem('projectvault-projects', JSON.stringify(nextProjects))
    if (!editingProjectId) {
      const projectId = nextProjects[nextProjects.length - 1].id
      const nextRequests = [
        ...invitedMembers.map((member, index) => ({ id: `${projectId}-student-${index}`, project: projectData.name, from: user?.name || 'Student', to: member.email, invitee: member, type: 'collaboration', status: 'pending' })),
        ...(projectForm.mentor ? [{ id: `${projectId}-mentor`, project: projectData.name, from: user?.name || 'Student', to: projectForm.mentor, type: 'mentor', status: 'pending' }] : []),
      ]
      const persistedRequests = [...nextRequests, ...requests]
      setRequests(persistedRequests)
      localStorage.setItem('projectvault-requests', JSON.stringify(persistedRequests))
      setToast(nextRequests.length ? 'Project created and requests sent' : 'Project created')
    } else setToast('Project updated')
    setProjectForm({ name: '', description: '', problemStatement: '', solution: '', github: '', drive: '', deployed: '', image: '', members: [{ name: '', email: '', batch: '', department: '' }, { name: '', email: '', batch: '', department: '' }, { name: '', email: '', batch: '', department: '' }], mentor: '' })
    setEditingProjectId(null)
    setShowComposer(false)
    setShowProjectWizard(false)
    setActivePage('My Projects')
    setTimeout(() => setToast(''), 2400)
  }

  const openProjectEditor = (project) => {
    setEditingProjectId(project.id)
    setProjectForm({ name: project.name || '', description: project.abstract || project.description || '', problemStatement: project.problemStatement || '', solution: project.solution || '', github: project.github || '', drive: project.drive || '', deployed: project.deployed || '', image: project.image || '', members: (project.memberDetails || []).concat([{ name: '', email: '', batch: '', department: '' }, { name: '', email: '', batch: '', department: '' }, { name: '', email: '', batch: '', department: '' }]).slice(0, 3), mentor: project.mentor === 'Mentor to be requested' ? '' : project.mentor || '' })
    setShowProjectWizard(true)
  }

  const deleteProject = (project) => {
    if (!['mentor', 'hod'].includes(user?.role)) return
    if (!window.confirm(`Delete ${project.name}? This will remove the project and its pending requests.`)) return
    const nextProjects = projects.filter((item) => item.id !== project.id)
    const nextRequests = requests.filter((request) => request.project !== project.name)
    setProjects(nextProjects)
    setRequests(nextRequests)
    setSelectedProject(null)
    localStorage.setItem('projectvault-projects', JSON.stringify(nextProjects))
    localStorage.setItem('projectvault-requests', JSON.stringify(nextRequests))
    setToast('Project deleted')
    setTimeout(() => setToast(''), 2400)
  }

  const handleRequestDecision = (requestId, status, note = '') => {
    const selected = requests.find((request) => request.id === requestId)
    if (!selected) return

    if (selected.type === 'task-completion') {
      const nextTasks = tasks.map((task) => (task._id || task.id) === selected.taskId ? { ...task, done: status === 'accepted', approvalPending: false, approved: status === 'accepted', feedback: note || (status === 'accepted' ? 'Completion approved by mentor.' : 'Completion proof was rejected. Please update the work and submit proof again.'), completedAt: status === 'accepted' ? new Date().toLocaleString() : '' } : task)
      setTasks(nextTasks)
      if (selected.taskId) apiRequest(`/api/tasks/${selected.taskId}`, { method: 'PUT', body: JSON.stringify({ done: status === 'accepted', approved: status === 'accepted', completedAt: status === 'accepted' ? new Date().toISOString() : '' }) }).catch((error) => setToast(error.message || 'Could not save task approval.'))
      localStorage.setItem('projectvault-tasks', JSON.stringify(nextTasks))
    }

    const next = requests.filter((request) => request.id !== requestId)
    setRequests(next)
    localStorage.setItem('projectvault-requests', JSON.stringify(next))

    const feedbackEntry = {
      id: Date.now(),
      requestId,
      project: selected.project,
      from: selected.from,
      type: selected.type,
      status,
      message: note || (status === 'accepted'
        ? 'Your request was accepted. The mentor has approved your collaboration and the project can proceed.'
        : 'Your request was rejected for this cycle. Please review the feedback and try again after adjustments.'),
      createdAt: new Date().toLocaleString(),
    }

    const nextFeedback = [feedbackEntry, ...requestFeedback]
    setRequestFeedback(nextFeedback)
    localStorage.setItem('projectvault-request-feedback', JSON.stringify(nextFeedback))
    setToast(status === 'accepted' ? 'Request accepted' : 'Request rejected')
    setTimeout(() => setToast(''), 2400)
  }

  const addTask = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const title = form.title.value.trim()
    const project = form.project.value.trim() || 'Smart HealthNet'
    const due = form.due.value.trim() || 'This week'
    const priority = form.priority.value || 'Medium'

    if (!title) return

    apiRequest('/api/tasks', { method: 'POST', body: JSON.stringify({ title, project, due, priority, done: false, proof: '', approved: false }) })
      .then((createdTask) => {
        setTasks((current) => [createdTask, ...current])
        form.reset()
        setToast('Task created and assigned')
        setTimeout(() => setToast(''), 2400)
      })
      .catch((error) => setToast(error.message || 'Task creation failed.'))
  }

  const updateTaskStatus = (taskId, patch) => {
    apiRequest(`/api/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(patch) })
      .then((updatedTask) => setTasks((current) => current.map((task) => task._id === taskId || task.id === taskId ? updatedTask : task)))
      .catch((error) => setToast(error.message || 'Task update failed.'))
  }

  const saveAuthSession = (sessionUser, token) => {
    setUser(sessionUser)
    localStorage.setItem('projectvault-user', JSON.stringify(sessionUser))
    localStorage.setItem('projectvault-token', token)
    setScreen('app')
  }

  const signIn = async (event) => {
    event.preventDefault()
    setAuthError('')

    const form = event.currentTarget
    const formData = {
      name: form.name?.value?.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      role,
    }

    if (authMode === 'register') {
      if (form.confirmPassword && form.confirmPassword.value !== formData.password) {
        setAuthError('Passwords do not match.')
        return
      }

      try {
        const response = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            department: settings.department,
            batch: settings.batch,
          }),
        })
        saveAuthSession(response.user, response.token)
      } catch (error) {
        setAuthError(error.message || 'Registration failed.')
      }
      return
    }

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      saveAuthSession(response.user, response.token)
    } catch (error) {
      setAuthError(error.message || 'Invalid credentials.')
    }
  }
  const signOut = () => { localStorage.removeItem('projectvault-user'); localStorage.removeItem('projectvault-token'); setUser(null); setScreen('launch') }
  const requestGuidance = (event) => { event.preventDefault(); const next = [...guidance, { id: Date.now(), project: event.currentTarget.project.value, message: event.currentTarget.message.value, from: user.name, status: 'Sent' }]; setGuidance(next); localStorage.setItem('projectvault-guidance', JSON.stringify(next)); event.currentTarget.reset(); setToast('Guidance request sent'); setTimeout(() => setToast(''), 2400) }
  const saveProcess = (nextProcess) => { setProcessSteps(nextProcess); localStorage.setItem('projectvault-process', JSON.stringify(nextProcess)); setToast('Project process updated'); setTimeout(() => setToast(''), 2400) }
  const sendMessage = (event, channel = 'group') => { event.preventDefault(); const next = [...messages, { id: Date.now(), channel, author: user.name, role: roles[user.role].label, text: event.currentTarget.message.value, time: 'Just now' }]; setMessages(next); localStorage.setItem('projectvault-messages', JSON.stringify(next)); event.currentTarget.reset() }
  const searchedProjects = projects.filter((project) => `${project.name} ${project.type} ${project.abstract} ${project.year}`.toLowerCase().includes(searchQuery.toLowerCase()))
  const visibleUserProjects = searchedProjects.filter((project) => user?.role !== 'student' || (Array.isArray(project.members) ? project.members.includes(user?.name) : project.name === 'Smart HealthNet'))
  const userTasks = tasks.filter((task) => !task.userId || task.userId === user?.id || visibleUserProjects.some((project) => project.name === task.project))
  const openTaskCount = userTasks.filter((task) => !task.done).length
  const completedTasks = userTasks.filter((task) => task.done)
  const dueThisWeek = userTasks.filter((task) => {
    if (task.done || !task.due) return false
    const dueDate = new Date(task.due)
    const today = new Date()
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)
    return !Number.isNaN(dueDate.getTime()) && dueDate >= new Date(today.setHours(0, 0, 0, 0)) && dueDate <= weekEnd
  }).length
  const onTimeTasks = completedTasks.filter((task) => task.due && task.completedAt && new Date(task.completedAt) <= new Date(task.due)).length
  const trackedCompletedTasks = completedTasks.filter((task) => task.due && task.completedAt).length
  const onTimeRate = trackedCompletedTasks ? Math.round((onTimeTasks / trackedCompletedTasks) * 100) : 0
  const taskCompletion = userTasks.length ? Math.round((completedTasks.length / userTasks.length) * 100) : 0
  const projectProgress = visibleUserProjects.length ? Math.round(visibleUserProjects.reduce((total, project) => total + Number(project.progress || 0), 0) / visibleUserProjects.length) : 0
  const workspaceHealthScore = Math.round((taskCompletion + projectProgress) / 2)
  const workspaceHealth = workspaceHealthScore >= 75 ? 'Good' : workspaceHealthScore >= 45 ? 'Watch' : 'Needs attention'
  window.__projectvaultOverviewSummary = overviewSummary
  window.__projectvaultOverviewProjects = projects
  window.__projectvaultOverviewTasks = tasks
  window.__projectvaultOverviewUser = user
  const addKnowledge = (event) => { event.preventDefault(); const item = { id: Date.now(), title: event.currentTarget.title.value, type: event.currentTarget.type.value, tag: event.currentTarget.tag.value, owner: user.name, year: '2026', description: event.currentTarget.description.value, link: event.currentTarget.link.value }; const next = [item, ...knowledge]; setKnowledge(next); localStorage.setItem('projectvault-knowledge', JSON.stringify(next)); setToast('Resource added to Knowledge'); setTimeout(() => setToast(''), 2400) }
  const saveSettings = (event) => { event.preventDefault(); const nextUser = { ...user, name: event.currentTarget.name.value, email: event.currentTarget.email.value }; const nextSettings = { ...settings, department: event.currentTarget.department.value, batch: event.currentTarget.batch.value, notifications: event.currentTarget.notifications.checked, weeklyDigest: event.currentTarget.weeklyDigest.checked }; setUser(nextUser); setSettings(nextSettings); localStorage.setItem('projectvault-user', JSON.stringify(nextUser)); localStorage.setItem('projectvault-settings', JSON.stringify(nextSettings)); setToast('Settings saved'); setTimeout(() => setToast(''), 2400) }
  const onAddAchievement = () => { const title = window.prompt('Achievement title'); if (!title?.trim()) return; const detail = window.prompt('Achievement detail') || ''; apiRequest('/api/achievements', { method: 'POST', body: JSON.stringify({ title: title.trim(), detail, tag: 'Department', year: new Date().getFullYear().toString() }) }).then((created) => { setAchievements((current) => [created, ...current]); setToast('Achievement published'); setTimeout(() => setToast(''), 2400) }).catch((error) => setToast(error.message || 'Achievement could not be published.')) }

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light')

  if (screen === 'launch') return <Launch onStart={(mode) => { setAuthMode(mode); setScreen('auth') }} />
  if (screen === 'auth') return <Auth mode={authMode} role={role} setRole={setRole} onSubmit={signIn} error={authError} onBack={() => { setAuthError(''); setScreen('launch') }} onSwitch={() => { setAuthError(''); setAuthMode(authMode === 'login' ? 'register' : 'login') }} />

  return (
    <div className={`app-shell role-${user?.role || 'student'}`}>
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><span>p</span></div>
          <span className="brand-name">project<span>vault</span></span>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="workspace-switcher"><div className="workspace-avatar">{user?.name?.slice(0, 2).toUpperCase() || 'PV'}</div><div><strong>{user?.name || 'ProjectVault user'}</strong><span>{roles[user?.role || role]?.label}</span></div></div>

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {(buildRoleNavigation(user?.role || 'student')).map((label) => {
            const Icon = (portalNavigation[user?.role || 'student']).find(([item]) => item === label)?.[1] || FolderKanban
            return <button className={`nav-item ${activePage === label ? 'active' : ''}`} key={label} onClick={() => { setSelectedProject(null); setActivePage(label); setMobileNav(false) }}>
              <Icon size={18} strokeWidth={activePage === label ? 2.4 : 1.8} /><span>{label}</span>
            </button>
          })}
          <p className="nav-label nav-label-spaced">Tools</p>
          <button className="nav-item" onClick={() => setActivePage('Settings')}><Settings size={18} /><span>Settings</span></button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={signOut}><LogIn size={18} /><span>Sign out</span></button>
          <div className="profile-row"><div className="profile-avatar">{user?.name?.slice(0, 2).toUpperCase()}</div><div><strong>{user?.name}</strong><span>{roles[user?.role]?.label}</span></div></div>
        </div>
      </aside>

      {mobileNav && <button className="backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumb"><span>ProjectVault</span><span className="slash">/</span><strong>{activePage}</strong></div>
          <div className="topbar-actions"><label className="search-trigger"><Search size={17} /><input aria-label="Search projects" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search projects" /><kbd>⌘ K</kbd></label><button className="icon-button notification-button" onClick={() => setActivePage('Notifications')} aria-label="Notifications"><Bell size={19} /><i /></button><button className="help-button"><CircleHelp size={17} /> Help</button></div>
        </header>

        <div className="theme-switcher app-theme-switcher" role="group" aria-label="Colour theme">
          <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')} aria-label="Use light mode" aria-pressed={theme === 'light'}><Sun size={15} /><span>Light</span></button>
          <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')} aria-label="Use dark mode" aria-pressed={theme === 'dark'}><Moon size={15} /><span>Dark</span></button>
        </div>
        <div className="page-wrap">
          <section className="welcome-row">
            <div><p className="eyebrow">{roles[user?.role]?.label} workspace <span className="live-dot" /></p><h1>Good morning, {user?.name?.split(' ')[0]} <span>✦</span></h1><p className="subheading">{roles[user?.role]?.detail}</p></div>
            <span className="role-badge"><ShieldCheck size={14} /> {roles[user?.role]?.label} access</span>
          </section>

          {activePage === 'Overview' && <HomeHighlights achievements={achievements} onNavigate={(page) => { setSelectedProject(null); setActivePage(page) }} />}

          {activePage === 'Overview' ? user?.role === 'student' ? <>
          <section className="metric-grid" aria-label="Workspace summary">
            <MetricCard icon={FolderKanban} label="Active projects" value={String(visibleUserProjects.filter((project) => !project.completed).length).padStart(2, '0')} delta={`${visibleUserProjects.length} visible to you`} tone="coral" onClick={() => { setSelectedProject(null); setActivePage('My Projects') }} />
            <MetricCard icon={Check} label="Open tasks" value={String(openTaskCount).padStart(2, '0')} delta={`${dueThisWeek} due this week`} tone="blue" onClick={() => { setSelectedProject(null); setActivePage('Tasks') }} />
            <MetricCard icon={Target} label="On-time rate" value={`${onTimeRate}%`} delta={`${trackedCompletedTasks} completed tasks tracked`} tone="yellow" onClick={() => { setSelectedProject(null); setActivePage('Reports') }} />
            <MetricCard icon={Gauge} label="Workspace health" value={workspaceHealth} delta={`Based on ${workspaceHealthScore}/100`} tone="green" onClick={() => { setSelectedProject(null); setActivePage('Analytics') }} />
          </section>

          {dataLoading && <div className="loading-strip" role="status">Loading your workspace data...</div>}
          <section className="content-grid">
            <div className="primary-column">
              <div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Projects in motion</h2></div><button className="text-button" onClick={() => setActivePage('All Projects')}>View all <ArrowUpRight size={15} /></button></div>
              <div className="project-list">{searchedProjects.slice(0, 6).map((project) => <ProjectRow key={project.name} project={project} onOpen={() => { setSelectedProject(project); setActivePage('All Projects') }} />)}</div>

              <div className="section-heading task-heading"><div><p className="eyebrow">Next up</p><h2>My tasks <span className="heading-count">{tasks.filter((task) => !task.done).length}</span></h2></div><button className="icon-button" aria-label="More task options"><MoreHorizontal size={19} /></button></div>
              <div className="task-list">{tasks.map((task, index) => <TaskRow key={task.title} task={task} onToggle={() => task.done ? completeTask(index) : setProofTask({ task, index })} />)}</div>
            </div>

            <div className="secondary-column">
              <div className="health-panel"><div className="panel-top"><div><p className="eyebrow">Project health</p><h2>{workspaceHealth === 'Good' ? 'Looking steady' : workspaceHealth === 'Watch' ? 'Needs attention' : 'Getting started'}</h2></div><span className="status-pill healthy"><span /> {workspaceHealth}</span></div><div className="health-score"><div className="score-ring"><strong>{workspaceHealthScore}</strong><span>/100</span></div><div><p>Across your visible projects</p><button className="text-button" onClick={() => setActivePage('Analytics')}>View analysis <ArrowUpRight size={14} /></button></div></div><div className="health-bars"><HealthBar label="Task completion" value={taskCompletion} color="coral" /><HealthBar label="Project progress" value={projectProgress} color="blue" /><HealthBar label="On-time delivery" value={onTimeRate} color="yellow" /></div></div>

              <div className="activity-panel"><div className="section-heading"><div><p className="eyebrow">Live feed</p><h2>Recent activity</h2></div><Activity size={17} className="muted-icon" /></div><ActivityItem avatar="RS" color="purple" text={<><strong>Riya Shah</strong> commented on <b>API integration</b></>} time="12 min ago" /><ActivityItem avatar="GH" color="dark" text={<><strong>GitHub</strong> recorded 8 new commits</>} time="2 hours ago" icon={<GitBranch size={13} />} /><ActivityItem avatar="MP" color="green" text={<><strong>Meera Patel</strong> submitted the weekly report</>} time="Yesterday" icon={<FileText size={13} />} /><ActivityItem avatar="AK" color="orange" text={<><strong>Arjun Kumar</strong> joined your team</>} time="Yesterday" /></div>
            </div>
          </section>
          </> : <LegacyRoleOverview role={user?.role} onOpen={(page) => setActivePage(page)} /> : <WorkspacePage page={activePage} projects={projects} tasks={tasks} user={user} guidance={guidance} messages={messages} knowledge={knowledge} settings={settings} processSteps={processSteps} searchQuery={searchQuery} selectedProject={selectedProject} onSelectProject={setSelectedProject} onChat={() => setActivePage('Project Chat')} onNewProject={(project) => project ? openProjectEditor(project) : setShowProjectWizard(true)} onEditProject={openProjectEditor} onDeleteProject={deleteProject} onToggleTask={completeTask} onRequestProof={(task, index) => setProofTask({ task, index })} onGuidance={requestGuidance} onSendMessage={sendMessage} onAddKnowledge={addKnowledge} onSaveSettings={saveSettings} onSaveProcess={saveProcess} canSeePrivate={user?.role !== 'student'} onRequestDecision={handleRequestDecision} onAddTask={addTask} onUpdateTask={updateTaskStatus} requests={requests} requestFeedback={requestFeedback} achievements={achievements} onAddAchievement={onAddAchievement} />}
        </div>
      </main>

      {showProjectWizard && <ProjectWizard form={projectForm} setForm={setProjectForm} editing={Boolean(editingProjectId)} onClose={() => { setShowProjectWizard(false); setEditingProjectId(null) }} onSubmit={createProject} />}

      {showComposer && <div className="modal-backdrop" onClick={() => setShowComposer(false)}><form className="composer-modal" onSubmit={createProject} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">My projects</p><h2>Start a new project</h2></div><button type="button" className="icon-button" onClick={() => setShowComposer(false)} aria-label="Close dialog"><X size={18} /></button></div><label>Project title<input name="name" autoFocus required value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} placeholder="e.g. Smart HealthNet" /></label><label>About the project<textarea name="description" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} placeholder="Abstract and overview" rows="3" /></label><label>Problem statement<textarea name="problemStatement" value={projectForm.problemStatement} onChange={(event) => setProjectForm({ ...projectForm, problemStatement: event.target.value })} placeholder="Describe the real problem this project is solving..." rows="3" /></label><label>Solution approach<textarea name="solution" value={projectForm.solution} onChange={(event) => setProjectForm({ ...projectForm, solution: event.target.value })} placeholder="Explain the proposed solution, method, or technology..." rows="3" /></label><label>Project image URL<input name="image" type="url" value={projectForm.image} onChange={(event) => setProjectForm({ ...projectForm, image: event.target.value })} placeholder="https://images.unsplash.com/..." /></label><label>GitHub source code<input name="github" type="url" value={projectForm.github} onChange={(event) => setProjectForm({ ...projectForm, github: event.target.value })} placeholder="https://github.com/your-team/repo" /></label><label>Google Drive documentation<input name="drive" type="url" value={projectForm.drive} onChange={(event) => setProjectForm({ ...projectForm, drive: event.target.value })} placeholder="https://drive.google.com/..." /></label><label>Deployed project link<input name="deployed" type="url" value={projectForm.deployed} onChange={(event) => setProjectForm({ ...projectForm, deployed: event.target.value })} placeholder="https://your-project.example" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowComposer(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={17} /> Create project</button></div></form></div>}
      {proofTask && <div className="modal-backdrop" onClick={() => setProofTask(null)}><form className="composer-modal" onSubmit={submitTaskProof} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Task completion</p><h2>Submit proof</h2></div><button type="button" className="icon-button" onClick={() => setProofTask(null)} aria-label="Close dialog"><X size={18} /></button></div><p className="proof-task-title">{proofTask.task.title}</p><label>Proof of completion<textarea name="proof" required rows="4" placeholder="Add a result, document link, commit link, or short explanation..." /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setProofTask(null)}>Cancel</button><button className="primary-button" type="submit"><Check size={16} /> Complete task</button></div></form></div>}
      {showRoleTool && <RoleTool role={user.role} onClose={() => setShowRoleTool(false)} />}
      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, delta, tone, onClick }) {
  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  return <article className={`metric-card ${onClick ? 'metric-card-interactive' : ''}`} onClick={onClick} onKeyDown={handleKeyDown} tabIndex={onClick ? 0 : undefined} role={onClick ? 'button' : undefined} aria-label={onClick ? `Open ${label}` : label}><div className={`metric-icon ${tone}`}><Icon size={18} /></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{delta}</small></div><ArrowUpRight size={16} className="metric-arrow" /></article>
}
function HomeHighlights({ achievements = [], onNavigate }) { const highlights = [{ label: 'Milestones', detail: 'Project checkpoints', icon: Target, tone: 'coral', target: 'Project Process' }, { label: 'Semantic search', detail: 'Find by meaning', icon: Search, tone: 'blue', target: 'All Projects' }, { label: 'Calendar', detail: 'Deadlines in view', icon: CalendarDays, tone: 'yellow', target: 'Calendar' }, { label: 'Meetings', detail: 'Stay in sync', icon: Video, tone: 'green', target: 'Project Chat' }, { label: 'Certificates', detail: 'Your achievements', icon: Award, tone: 'purple', target: 'Achievements' }]; const latest = achievements[0]; return <section className="home-highlights" aria-label="Workspace highlights"><div className="highlights-heading"><div><p className="eyebrow">Workspace highlights</p><h2>Everything important, at a glance</h2></div><span>Five focused spaces, one calm home</span></div><div className="highlight-grid">{highlights.map(({ label, detail, icon: Icon, tone, target }) => <button type="button" className="highlight-item" key={label} onClick={() => onNavigate?.(target)} aria-label={`Open ${label}`}><div className={`highlight-icon ${tone}`}><Icon size={18} /></div><div><strong>{label}</strong><span>{detail}</span></div><ArrowUpRight size={15} /></button>)}</div>{latest && <button type="button" className="home-achievement" onClick={() => onNavigate?.('Achievements')}><Award size={17} /><span><small>Latest department achievement</small><strong>{latest.title}</strong></span><ArrowUpRight size={15} /></button>}</section> }
function ProjectRow({ project, onOpen }) { const memberCount = Array.isArray(project.members) ? project.members.length : Number(project.members) || 1; return <article className="project-row project-row-interactive" onClick={onOpen} onKeyDown={(event) => event.key === 'Enter' && onOpen?.()} tabIndex={onOpen ? 0 : undefined}><div className={`project-symbol ${project.color}`}><FolderKanban size={18} /></div><div className="project-info"><div className="project-title"><strong>{project.name}</strong><span className="project-type">{project.type}</span></div><p className="project-row-abstract">{project.abstract || project.description || 'Project abstract to be added.'}</p><div className="progress-track"><span className={project.color} style={{ width: `${project.progress}%` }} /></div></div><div className="project-progress"><strong>{project.progress}%</strong><span>{project.year || 'progress'}</span></div><div className="member-stack"><span>AN</span><span>RS</span><span>+{Math.max(memberCount - 2, 0)}</span></div><ArrowUpRight size={17} className="row-more" /></article> }
function TaskRow({ task, onToggle }) { const status = task.done ? 'Completed' : task.approvalPending ? 'Pending mentor approval' : 'Open'; return <article className={`task-row ${task.done ? 'task-done' : ''}`}><button className={`task-check ${task.done ? 'checked' : ''}`} onClick={onToggle} disabled={task.approvalPending} aria-label={`Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`}>{task.done && <Check size={13} />}</button><div className="task-copy"><strong>{task.title}</strong><span>{task.project} · {status}{task.done && task.completedAt ? ` · ${task.completedAt}` : ''}</span>{task.proof && <small className="task-proof">Proof: {task.proof}</small>}{task.feedback && <small className="task-feedback">Mentor: {task.feedback}</small>}</div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><span className="task-due">{task.due}</span></article> }
function HealthBar({ label, value, color }) { return <div className="health-bar"><div><span>{label}</span><strong>{value}%</strong></div><div className="progress-track"><span className={color} style={{ width: `${value}%` }} /></div></div> }
function ActivityItem({ avatar, color, text, time, icon }) { return <div className="activity-item"><div className={`activity-avatar ${color}`}>{icon || avatar}</div><div><p>{text}</p><span>{time}</span></div></div> }
function LegacyRoleOverview({ role, onOpen }) { const mentor = role === 'mentor'; return <section className={`role-overview role-overview-${role}`}><div className="role-hero"><div><p className="eyebrow">{mentor ? 'Mentor command center' : 'HOD command center'}</p><h2>{mentor ? 'Your groups, moving forward.' : 'Department progress, in one view.'}</h2><p>{mentor ? 'Review group momentum, assign the next task, and keep every team supported.' : 'Track mentors, working groups, achievements, and academic outcomes across the department.'}</p></div><span className="status-pill healthy"><span /> Live workspace</span></div><div className="role-metrics"><MetricCard icon={Users} label={mentor ? 'Working groups' : 'Active mentors'} value={mentor ? '03' : '08'} delta={mentor ? '12 students' : '24 groups covered'} tone="green" /><MetricCard icon={FolderKanban} label="Active projects" value={mentor ? '03' : '24'} delta="Across current cycle" tone="coral" /><MetricCard icon={Check} label="Tasks due" value={mentor ? '09' : '38'} delta="Needs attention" tone="blue" /></div><div className="role-columns"><div className="panel role-group-panel"><div className="section-heading"><div><p className="eyebrow">{mentor ? 'Assigned groups' : 'Department groups'}</p><h3>Working groups</h3></div><button className="text-button" onClick={() => onOpen('My Groups')}>View all <ArrowUpRight size={14} /></button></div><RoleGroup name="Smart HealthNet" mentor="Dr. Meera Patel" progress="72%" tasks="4 tasks due" /><RoleGroup name="Campus Connect" mentor="Prof. K. Rao" progress="48%" tasks="3 tasks due" /><RoleGroup name="EcoTrack" mentor="Dr. Anil Thomas" progress="31%" tasks="2 tasks due" /></div><div className="panel role-action-panel"><p className="eyebrow">Next actions</p><h3>{mentor ? 'Keep teams unblocked' : 'Department watchlist'}</h3><button className="action-row" onClick={() => onOpen('Task Schedule')}><Check size={16} /><span>Schedule and assign tasks</span><ArrowUpRight size={14} /></button><button className="action-row" onClick={() => onOpen('Group Reports')}><FileText size={16} /><span>Generate group report</span><ArrowUpRight size={14} /></button><button className="action-row" onClick={() => onOpen(mentor ? 'Announcements' : 'Achievements')}><Sparkles size={16} /><span>{mentor ? 'Post announcement' : 'Publish achievement'}</span><ArrowUpRight size={14} /></button></div></div></section> }
function RoleGroup({ name, mentor, progress, tasks }) { return <div className="role-group-row"><div className="workspace-avatar">{name.slice(0, 2).toUpperCase()}</div><div><strong>{name}</strong><span>{mentor} · {tasks}</span><div className="progress-track"><span className="blue" style={{ width: progress }} /></div></div><b>{progress}</b></div> }
function WorkspacePage({ page, projects, tasks, user, guidance, messages, knowledge, settings, processSteps, searchQuery, selectedProject, onSelectProject, onChat, onNewProject, onEditProject, onDeleteProject, onToggleTask, onRequestProof, onGuidance, onSendMessage, onAddKnowledge, onSaveSettings, onSaveProcess, canSeePrivate, onRequestDecision, onAddTask, onUpdateTask, requests = [], requestFeedback = [], achievements = [], onAddAchievement }) {
  const pageContent = {
    'All Projects': { eyebrow: 'Project portfolio', title: 'All student projects', description: 'Every year, every abstract, one searchable academic vault.' },
    'My Projects': { eyebrow: 'Your portfolio', title: 'My projects', description: 'Edit your project information and manage collaboration requests.' },
    Certificates: { eyebrow: 'Recognition', title: 'Certificates', description: 'View issued recognition and project completion certificates.' },
    'AI Center': { eyebrow: 'Project intelligence', title: 'AI project assistant', description: 'Ask about a domain and discover relevant completed work from your college.' },
    'Project Process': { eyebrow: 'Standard workflow', title: 'How projects get completed', description: 'A shared process for every team, maintained by mentors and HODs.' },
    Notifications: { eyebrow: 'Updates', title: 'Notifications', description: 'Keep up with guidance, tasks, reviews, and project activity.' },
    'Project Chat': { eyebrow: 'Collaboration', title: 'Project chat', description: 'Private rooms for each group, mentor channel, and student network.' },
    'My Groups': { eyebrow: 'Team oversight', title: 'My working groups', description: 'Review group progress, current tasks, and next milestones.' },
    'Task Schedule': { eyebrow: 'Execution planning', title: 'Task schedule', description: 'Assign and review deadlines across your working groups.' },
    'Group Reports': { eyebrow: 'Academic reporting', title: 'Group reports', description: 'Generate current and previous group progress reports.' },
    Announcements: { eyebrow: 'Project updates', title: 'Announcements', description: 'Share important project and review updates with groups.' },
    'Mentors & Groups': { eyebrow: 'Department oversight', title: 'Mentors and groups', description: 'Track every mentor and the groups currently under them.' },
    Achievements: { eyebrow: 'Department highlights', title: 'Achievements', description: 'Publish completed work and department achievements.' },
    Tasks: { eyebrow: 'Execution board', title: 'My tasks', description: 'Keep work moving through the project lifecycle.' },
    Reports: { eyebrow: 'Weekly reporting', title: 'Reports', description: 'Submit progress updates and review feedback.' },
    Knowledge: { eyebrow: 'Institutional memory', title: 'Knowledge repository', description: 'Find projects, research, and resources in one place.' },
    Team: { eyebrow: 'Collaboration', title: 'My team', description: 'Stay connected with your project collaborators.' },
    Calendar: { eyebrow: 'Schedule', title: 'Calendar', description: 'Upcoming milestones and meetings will appear here.' },
    Messages: { eyebrow: 'Communication', title: 'Messages', description: 'Team and mentor conversations in one place.' },
    Settings: { eyebrow: 'Workspace control', title: 'Settings', description: 'Manage your profile and workspace preferences.' },
  }[page] || { eyebrow: 'Workspace', title: page, description: 'This workspace view is ready for the next module.' }
  const searchedProjects = projects.filter((project) => `${project.name} ${project.type} ${project.abstract} ${project.year}`.toLowerCase().includes(searchQuery.toLowerCase()))
  const visibleProjects = page === 'My Projects' ? searchedProjects.filter((project) => {
    if (user?.role === 'hod') return !project.completed
    if (user?.role === 'mentor') return !project.completed && project.mentor !== 'To be assigned'
    return Array.isArray(project.members) ? project.members.includes(user?.name) || project.name === 'Smart HealthNet' : project.name === 'Smart HealthNet'
  }) : searchedProjects
  if (selectedProject && page === 'All Projects') return <ProjectDetail project={selectedProject} canSeePrivate={canSeePrivate} onBack={() => onSelectProject(null)} onChat={onChat} />
  if (page === 'All Projects' || page === 'My Projects') return <section className="workspace-page"><div className="workspace-page-header"><div><p className="eyebrow">{pageContent.eyebrow}</p><h2>{pageContent.title}</h2><p>{pageContent.description}</p></div>{page === 'My Projects' && <button className="primary-button" onClick={onNewProject}><Plus size={18} /> New project</button>}</div><div className="project-gallery">{visibleProjects.map((project) => <div className="managed-project-card" key={project.id || project.name}><ProjectCard project={project} canSeePrivate={canSeePrivate} mine={page === 'My Projects'} onSelect={() => onSelectProject(project)} onEdit={() => onNewProject(project)} /><div className="managed-project-actions">{['mentor', 'hod'].includes(user?.role) && <button className="text-button danger" onClick={() => onDeleteProject?.(project)}><X size={14} /> Delete project</button>}</div></div>)}</div></section>
  if (page === 'AI Center') return <AICenter projects={projects} />
  if (page === 'Certificates') return <CertificatesPage />
  if (page === 'Project Process') return <ProcessPage steps={processSteps} canEdit={user?.role === 'mentor' || user?.role === 'hod'} onSave={onSaveProcess} />
  if (page === 'Project Chat') return <ChatPage messages={messages} onSend={onSendMessage} />
  if (page === 'Task Schedule') return <TaskSchedulePage tasks={tasks} requests={requests} onAddTask={onAddTask} onUpdateTask={onUpdateTask} onRequestDecision={onRequestDecision} />
  if (page === 'Mentor Workspace') return <MentorWorkspacePage requests={requests} onRequestDecision={onRequestDecision} />
  if (page === 'Reports') return <ReportsPage projects={projects} tasks={tasks} guidance={guidance} onGuidance={onGuidance} />
  if (page === 'Analytics') return <AnalyticsPage projects={projects} />
  if (page === 'Project Similarity') return <SimilarityPage projects={projects} />
  if (page === 'Alumni') return <AlumniPage />
  if (page === 'Achievements') return <AchievementsPage achievements={achievements} canAdd={user?.role === 'hod'} onAdd={onAddAchievement} />
  if (['Mentors & Groups', 'Students', 'Teams', 'Project Monitoring'].includes(page)) return <LegacyRoleModulePage page={page} role={user?.role} projects={projects} tasks={tasks} />
  if (page === 'Notifications' && requests.length) return <RequestInbox requests={requests} onRequestDecision={onRequestDecision} />
  if (page === 'Notifications') return <section className="workspace-page"><PageHeader {...pageContent} /><div className="notification-list panel">{requestFeedback.length ? requestFeedback.map((item) => <NotificationItem key={item.id} title={`${item.status === 'accepted' ? 'Request approved' : 'Request updated'} · ${item.project}`} detail={`${item.from}: ${item.message}`} />) : <><NotificationItem title="Project health review due" detail="Smart HealthNet has a milestone review this week." /><NotificationItem title="New guidance channel" detail="Student and mentor requests are now handled inside the project details." /><NotificationItem title="AI project assistant updated" detail="The assistant now highlights project fit, duplicates, and improvement suggestions." /></> }</div></section>
  if (page === 'Settings') return <SettingsPage user={user} settings={settings} onSave={onSaveSettings} />
  return <ModulePage page={page} role={user?.role} content={pageContent} tasks={tasks} onToggleTask={onToggleTask} onRequestProof={onRequestProof} />
}

function PageHeader({ eyebrow, title, description }) { return <div className="workspace-page-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{title === 'Reports' && <button className="secondary-button" onClick={() => window.dispatchEvent(new Event('projectvault:download-report'))}><FileText size={15} /> Download document</button>}</div> }

function CertificatesPage() {
  const items = getCertificateItems()

  return <section className="workspace-page"><PageHeader eyebrow="Recognition" title="Certificates" description="View issued recognition and project completion certificates." /><div className="certificate-grid">{items.map((item) => <div className="panel certificate-card" key={item.id}><div className="certificate-badge"><Award size={18} /></div><div className="certificate-content"><span>{item.project}</span><h3>{item.title}</h3><small>{item.date}</small><small className="status-line">{item.status}</small></div></div>)}</div></section>
}

function AnalyticsPage({ projects = [] }) {
  const totalProjects = projects.length
  const completedProjects = projects.filter((project) => Number(project.progress || 0) >= 100 || project.completed).length
  const averageProgress = totalProjects ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / totalProjects) : 0
  const topProjects = [...projects].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3)

  return <section className="workspace-page"><PageHeader eyebrow="Performance" title="Analytics" description="Track project progress, completion rate, and momentum across teams." /><div className="metric-grid"><MetricCard icon={Gauge} label="Projects" value={String(totalProjects)} delta="Across all active work" tone="blue" /><MetricCard icon={Check} label="Completed" value={String(completedProjects)} delta="Project milestones achieved" tone="green" /><MetricCard icon={Target} label="Avg. progress" value={`${averageProgress}%`} delta="Current multidisciplinary average" tone="coral" /></div><div className="panel"><div className="section-heading"><div><p className="eyebrow">Top progress</p><h3>High performers</h3></div></div>{topProjects.map((project) => <div className="group-row" key={project.id || project.name}><div className="workspace-avatar">{(project.name || 'PR').slice(0, 2).toUpperCase()}</div><div><strong>{project.name}</strong><span>{project.type || 'Project'} · {project.year || 'Current cycle'}</span></div><div className="request-actions"><strong>{project.progress || 0}%</strong></div></div>)}</div></section>
}

function SimilarityPage({ projects = [] }) {
  const [problemStatement, setProblemStatement] = useState('')
  const [solution, setSolution] = useState('')
  const [matches, setMatches] = useState([])

  const handleCompare = (event) => {
    event.preventDefault()
    if (!problemStatement.trim() && !solution.trim()) return

    const candidateText = `${problemStatement} ${solution}`
    const nextMatches = projects
      .map((project) => {
        const referenceText = `${project.problemStatement || ''} ${project.solution || ''} ${project.abstract || ''}`
        const score = calculateSimilarityScore(candidateText, referenceText)
        return { ...project, score }
      })
      .filter((project) => project.score >= 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    setMatches(nextMatches)
  }

  return <section className="workspace-page"><PageHeader eyebrow="Academic review" title="Project similarity" description="Upload a project problem statement and solution to check whether it overlaps with current work." /><div className="panel"><form className="guidance-form" onSubmit={handleCompare}><label>Problem statement<textarea name="problemStatement" rows="5" value={problemStatement} onChange={(event) => setProblemStatement(event.target.value)} placeholder="Describe the problem your new project is trying to solve..." required /></label><label>Solution<textarea name="solution" rows="5" value={solution} onChange={(event) => setSolution(event.target.value)} placeholder="Explain the proposed solution or method..." required /></label><button className="primary-button" type="submit"><Sparkles size={15} /> Check similarity</button></form></div>{matches.length ? <div className="panel" style={{ marginTop: '18px' }}><div className="section-heading"><div><p className="eyebrow">Comparison results</p><h3>Matching projects</h3></div></div>{matches.map((project) => <div className="group-row" key={project.id || project.name}><div className="workspace-avatar">{(project.name || 'PR').slice(0, 2).toUpperCase()}</div><div><strong>{project.name}</strong><span>{project.type} · {project.score}% similarity</span></div><div className="request-actions"><span>{project.score >= 60 ? 'High similarity' : 'Possible overlap'}</span></div></div>)}</div> : <div className="panel empty-state compact" style={{ marginTop: '18px' }}><Sparkles size={20} /><span>No strong matches found yet. This proposal looks distinct.</span></div>}</section>
}

function AlumniPage() {
  const alumni = [
    { name: 'Ananya Rao', role: 'ML Engineer', batch: '2022', tag: 'AI' },
    { name: 'Karan Mehta', role: 'Product Designer', batch: '2021', tag: 'UX' },
    { name: 'Sonal Gupta', role: 'HealthTech Founder', batch: '2020', tag: 'HealthTech' },
  ]

  return <section className="workspace-page"><PageHeader eyebrow="Industry network" title="Alumni" description="Connect with graduated student mentors and project leaders." /><div className="project-gallery">{alumni.map((person) => <div className="panel project-card" key={person.name}><div className="project-symbol coral"><Users size={18} /></div><div className="project-card-body"><div className="project-title"><strong>{person.name}</strong><span>{person.tag}</span></div><p className="project-year">{person.batch} batch</p><p className="project-abstract">{person.role}</p></div></div>)}</div></section>
}

function AchievementsPage({ achievements = [], canAdd, onAdd }) {
  const items = achievements

  return (
    <section className="workspace-page">
      <div className="workspace-page-header"><PageHeader eyebrow="Recognition" title="Achievements" description="Department milestones and standout project results are listed here." />{canAdd && <button className="primary-button" onClick={onAdd}><Plus size={16} /> Add achievement</button>}</div>
      <div className="achievement-grid">
        {items.length ? items.map((item, index) => (
          <article className="achievement-card panel" key={item.title}>
            <div className="achievement-badge">{String(index + 1).padStart(2, '0')}</div>
            <div className="achievement-body">
              <span className="achievement-tag">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="achievement-meta">
                <span>{item.year}</span>
                <Award size={13} />
              </div>
            </div>
          </article>
        )) : <div className="empty-state compact"><Award size={20} /><span>No achievements have been published yet.</span></div>}
      </div>
    </section>
  )
}

function ModulePage({ page, role, content, tasks, onToggleTask, onRequestProof }) { const data = { 'My Team': ['Team roster', 'Collaborate with your project members and review responsibilities.', 'Arjun Nair · Product lead', 'Riya Shah · Backend', 'Meera Patel · Research'], Milestones: ['Milestone tracker', 'Follow the approved project milestones and completion gates.', 'Proposal approved · 100%', 'System design · 80%', 'Final evaluation · Upcoming'], 'Weekly Reports': ['Weekly reports', 'Create, submit, and review weekly project progress reports.', 'Week 08 · Submitted', 'Week 07 · Approved', 'Week 06 · Needs mentor feedback'], 'Research Papers': ['Research library', 'Search and organize research relevant to your project.', 'Explainable AI in healthcare', 'Computer vision for traffic systems', 'IoT energy monitoring survey'], 'Semantic Search': ['Semantic discovery', 'Search projects, papers, and resources by meaning.', 'Try: AI healthcare monitoring', 'Try: sustainable campus systems'], 'Alumni Connect': ['Alumni network', 'Connect with alumni by skill, domain, and technology.', 'Ananya Rao · ML Engineer', 'Karan Mehta · Product Designer', 'Sonal Gupta · HealthTech Founder'], Calendar: ['Academic calendar', 'Keep deadlines, meetings, reviews, and submissions visible.', 'Sep 04 · Mid-semester review', 'Sep 12 · Weekly report deadline', 'Sep 22 · Final presentation'], Meetings: ['Meetings', 'Coordinate mentor reviews, team stand-ups, and HOD meetings.', 'Mentor review · Tomorrow, 10:30 AM', 'Team stand-up · Friday, 4:00 PM', 'HOD review · Sep 04'], Certificates: ['Certificates', 'View project completion and achievement certificates.', 'Project completion certificate', 'Innovation showcase certificate', 'Downloadable verification records'], 'My Students': ['My students', 'Students currently assigned to your supervision.', 'Riya Shah · Smart HealthNet', 'Neha Joshi · Campus Connect', 'Meera Das · EcoTrack'], Teams: ['Teams', 'Monitor every project team and its working progress.', 'Smart HealthNet · 72% progress', 'Campus Connect · 48% progress', 'EcoTrack · 31% progress'], 'Task Monitoring': ['Task monitoring', 'Review task proof, deadlines, and completion status.', '9 tasks need review', '4 proofs awaiting verification', '2 overdue tasks'], 'Reviews & Feedback': ['Reviews & feedback', 'Provide structured feedback on reports and milestones.', 'System architecture · Awaiting review', 'Literature survey · Feedback added', 'Weekly report · Approved'], 'Project Approvals': ['Project approvals', 'Review proposals and approve valid project ideas.', '3 proposals awaiting review', 'Smart HealthNet · Approved', 'Campus Connect · Under review'], 'Project Monitoring': ['Project monitoring', 'Track department progress and projects at risk.', '24 active projects', '6 projects at risk', '18 projects on track'], Analytics: ['Performance analytics', 'Measure project completion, mentor workload, and research trends.', 'Completion rate · 86%', 'Mentor workload · Balanced', 'Research domains · 5 trending'], Reports: ['Department reports', 'Generate academic, project, and mentor workload reports.', 'Monthly project health report', 'Mentor workload report', 'Yearly completion report'], 'Project Similarity': ['Project similarity', 'Identify duplicate or closely related project proposals.', '2 similar healthcare proposals found', '3 related computer vision projects', 'Review duplicate idea alerts'], Students: ['Student directory', 'View department students and their project activity.', '42 final-year students', '68 active project members', '12 students requesting guidance'], Mentors: ['Mentor directory', 'View faculty mentors and their supervised groups.', '8 active faculty mentors', '24 groups supervised', '3 mentors available for assignment'], Alumni: ['Alumni directory', 'View verified alumni and mentorship connections.', '126 verified alumni', '18 active mentors', '42 industry connections'] }[page] || [content.title, 'A structured workspace for this academic workflow.', 'Activity and records will appear here', 'Connect this module to your project lifecycle']; const isTasks = page === 'Tasks'; return <section className="workspace-page"><PageHeader eyebrow={role === 'hod' ? 'Department workspace' : role === 'mentor' ? 'Supervision workspace' : 'Student workspace'} title={data[0]} description={data[1]} /><div className="module-page-grid">{isTasks ? tasks.map((task, index) => <TaskRow key={task.title} task={task} onToggle={() => task.done ? onToggleTask(index) : onRequestProof(task, index)} />) : data.slice(2).map((item, index) => <article className="module-card" key={`${item}-${index}`}><div className={`module-card-icon ${index === 0 ? 'active' : ''}`}>{index === 0 ? <Activity size={17} /> : <ArrowUpRight size={17} />}</div><div><strong>{item}</strong><span>{role === 'hod' ? 'Department visibility enabled' : role === 'mentor' ? 'Assigned workspace data' : 'Personal workspace data'}</span></div><button className="text-button">Open <ArrowUpRight size={14} /></button></article>)}</div></section> }
function ProjectCard({ project, canSeePrivate, mine, onSelect, onEdit }) { const members = Array.isArray(project.members) ? project.members.join(', ') : `${project.members || 1} members`; return <article className="project-card project-card-selectable" onClick={onSelect} onKeyDown={(event) => event.key === 'Enter' && onSelect?.()} tabIndex={onSelect ? 0 : undefined}><div className={`project-symbol ${project.color}`}><FolderKanban size={19} /></div><div className="project-card-body"><div className="project-title"><strong>{project.name}</strong><span>{project.type}</span></div><p className="project-year">{project.year || 'Academic project'}</p><p className="project-abstract">{project.abstract || project.description || 'Project abstract to be added.'}</p><div className="project-meta"><span><Users size={14} /> {members}</span><span>Mentor: {project.mentor || 'To be assigned'}</span></div><div className="card-actions">{canSeePrivate ? <><a href={project.github || 'https://github.com/'} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><GitBranch size={14} /> Source code</a><a href={project.drive || 'https://drive.google.com/'} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><FileText size={14} /> Documents</a>{project.deployed && <a href={project.deployed} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><ArrowUpRight size={14} /> Live project</a>}</> : <span className="private-note"><LockKeyhole size={14} /> Private links hidden from students</span>}{mine && <button className="text-button" onClick={(event) => { event.stopPropagation(); onEdit?.(project) }}>Edit project <ArrowUpRight size={14} /></button>}</div></div><div className="project-progress"><strong>{project.progress || 0}%</strong><span>progress</span></div></article> }

function ProjectDetail({ project, canSeePrivate, onBack, onChat }) { const members = Array.isArray(project.members) ? project.members : [`${project.members || 1} project members`]; return <section className="workspace-page project-detail"><button className="back-link" onClick={onBack}><ArrowRight size={15} /> Back to all projects</button><div className="detail-hero"><div className={`project-symbol ${project.color}`}><FolderKanban size={25} /></div><div><p className="eyebrow">{project.year || 'Academic project'} · {project.type}</p><h2>{project.name}</h2><p>{project.abstract || project.description || 'Project abstract to be added.'}</p></div><span className="status-pill healthy"><span /> {project.completed ? 'Completed' : 'In progress'}</span></div><div className="detail-grid"><div className="panel detail-section"><p className="eyebrow">Project overview</p><h3>About this project</h3><p className="detail-copy">{project.abstract || project.description || 'This team is building a practical solution and documenting its progress through ProjectVault.'}</p><h4>Technology stack</h4><div className="tech-stack">{(project.tech || ['React', 'Node.js', 'MongoDB']).map((tech) => <span key={tech}>{tech}</span>)}</div></div><div className="panel detail-section"><p className="eyebrow">People</p><h3>Working candidates</h3><div className="people-list">{members.map((member) => <div key={member}><div className="profile-avatar">{member.slice(0, 2).toUpperCase()}</div><strong>{member}</strong><span>Student · Project member</span></div>)}</div><h4>Mentor</h4><div className="mentor-line"><div className="profile-avatar">{(project.mentor || 'TM').slice(0, 2).toUpperCase()}</div><strong>{project.mentor || 'To be assigned'}</strong></div></div></div><div className="detail-actions">{canSeePrivate ? <><a className="secondary-button" href={project.github || 'https://github.com/'} target="_blank" rel="noreferrer"><GitBranch size={15} /> GitHub source</a><a className="secondary-button" href={project.drive || 'https://drive.google.com/'} target="_blank" rel="noreferrer"><FileText size={15} /> Google Drive docs</a></> : <span className="private-note"><LockKeyhole size={14} /> GitHub and Drive links are visible to group members, mentors, and HODs</span>}{project.deployed && <a className="primary-button" href={project.deployed} target="_blank" rel="noreferrer"><ArrowUpRight size={15} /> Open deployed project</a>}<button className="primary-button" onClick={onChat}><MessageCircle size={15} /> Message the team</button></div></section> }

function ChatPage({ messages, onSend }) { const [channel, setChannel] = useState('smart-healthnet'); const channels = [{ id: 'smart-healthnet', label: 'Smart HealthNet', detail: '4 members' }, { id: 'campus-connect', label: 'Campus Connect', detail: '6 members' }, { id: 'mentor-room', label: 'Mentor room', detail: 'Mentors and faculty' }, { id: 'student-network', label: 'Student network', detail: 'All student projects' }]; const visible = messages.filter((message) => message.channel === channel); return <section className="workspace-page"><PageHeader eyebrow="Private collaboration" title="Project chat" description="Each project has its own private room. Messages never cross between groups." /><div className="chat-layout"><div className="chat-channels panel">{channels.map((item) => <button className={channel === item.id ? 'selected' : ''} key={item.id} onClick={() => setChannel(item.id)}><div className="channel-avatar">{item.label.slice(0, 2)}</div><div><strong>{item.label}</strong><span>{item.detail}</span></div></button>)}</div><div className="chat-panel panel"><div className="chat-room-heading"><div><p className="eyebrow">Private room</p><h3>{channels.find((item) => item.id === channel)?.label}</h3></div><span className="audience-chip">Only this group</span></div><div className="message-list">{visible.map((message) => <div className="message-row" key={message.id}><div className="activity-avatar green">{message.author.slice(0, 2).toUpperCase()}</div><div><div className="message-author"><strong>{message.author}</strong><span>{message.role} · {message.time}</span></div><p>{message.text}</p></div></div>)}{!visible.length && <div className="empty-state compact"><MessageCircle size={20} /><span>No messages in this room yet.</span></div>}</div><form className="chat-form" onSubmit={(event) => onSend(event, channel)}><input name="message" required placeholder="Message this group..." /><button className="primary-button" type="submit"><Send size={15} /> Send</button></form></div></div></section> }
const studentRoster = [
  ['Arjun Nair', 'CSE · Final year', 'Smart HealthNet', 'Dr. Meera Patel', 'On track', 88],
  ['Neha Joshi', 'IT · Third year', 'Campus Connect', 'Prof. K. Rao', 'Progressing', 74],
  ['Meera Das', 'ECE · Final year', 'EcoTrack', 'Dr. Anil Thomas', 'Needs review', 62],
  ['Aman Kumar', 'CSE · Third year', 'Campus Connect', 'Prof. K. Rao', 'On track', 72],
  ['Vikram Singh', 'EEE · Final year', 'EcoTrack', 'Dr. Anil Thomas', 'Monitoring', 58],
  ['Riya Shah', 'CSE · Final year', 'Smart HealthNet', 'Dr. Meera Patel', 'Healthy', 91],
  ['Kavya Menon', 'IT · Final year', 'StudySphere', 'Prof. K. Rao', 'On track', 83],
  ['Rahul Verma', 'CSE · Third year', 'SkillSpring', 'Prof. K. Rao', 'Progressing', 67],
  ['Isha Kapoor', 'ECE · Third year', 'SignBridge', 'Prof. K. Rao', 'Monitoring', 55],
  ['Dev Patel', 'CSE · Final year', 'AgriSense', 'Dr. Neha Sinha', 'Healthy', 86],
  ['Sana Khan', 'IT · Final year', 'Biometric Lens', 'Dr. Neha Sinha', 'On track', 78],
  ['Aditya Rao', 'CSE · Third year', 'AquaGuard', 'Dr. Neha Sinha', 'Review', 56],
  ['Pooja Iyer', 'EEE · Final year', 'SafeRoute', 'Prof. Raghav Menon', 'Healthy', 81],
  ['Nikhil Bansal', 'CSE · Third year', 'TransitIQ', 'Prof. Raghav Menon', 'Progressing', 63],
  ['Ananya Sen', 'IT · Final year', 'HeritageAR', 'Dr. Priya Nair', 'Healthy', 89],
  ['Rohan Gupta', 'CSE · Final year', 'CivicLens', 'Dr. Priya Nair', 'On track', 76],
  ['Simran Kaur', 'ECE · Third year', 'FoodLens', 'Dr. Priya Nair', 'Watching', 49],
  ['Yash Thakur', 'CSE · Final year', 'CareCircle', 'Dr. Meera Patel', 'Progressing', 69],
  ['Diya Malhotra', 'IT · Third year', 'MindMend', 'Dr. Meera Patel', 'Review', 58],
  ['Karan Shah', 'CSE · Final year', 'SolarGrid', 'Dr. Anil Thomas', 'Monitoring', 61],
  ['Nandini Rao', 'EEE · Third year', 'EcoTrack', 'Dr. Anil Thomas', 'On track', 73],
  ['Harsh Vyas', 'CSE · Final year', 'Smart HealthNet', 'Dr. Meera Patel', 'Healthy', 84],
  ['Aditi Sharma', 'IT · Final year', 'Campus Connect', 'Prof. K. Rao', 'Progressing', 71],
  ['Manav Sethi', 'CSE · Third year', 'StudySphere', 'Prof. K. Rao', 'On track', 79],
  ['Tanya Bose', 'ECE · Final year', 'SignBridge', 'Prof. K. Rao', 'Monitoring', 52],
  ['Sahil Jain', 'CSE · Final year', 'AgriSense', 'Dr. Neha Sinha', 'Healthy', 87],
  ['Mitali Ghosh', 'IT · Third year', 'Biometric Lens', 'Dr. Neha Sinha', 'Review', 64],
  ['Farhan Ali', 'CSE · Final year', 'AquaGuard', 'Dr. Neha Sinha', 'Progressing', 59],
  ['Ishita Roy', 'EEE · Final year', 'SafeRoute', 'Prof. Raghav Menon', 'Healthy', 77],
  ['Vivek Reddy', 'CSE · Third year', 'TransitIQ', 'Prof. Raghav Menon', 'Monitoring', 54],
  ['Aarav Kulkarni', 'IT · Final year', 'HeritageAR', 'Dr. Priya Nair', 'On track', 82],
  ['Priya Desai', 'CSE · Final year', 'CivicLens', 'Dr. Priya Nair', 'Progressing', 68],
  ['Mohit Arora', 'ECE · Third year', 'FoodLens', 'Dr. Priya Nair', 'Watching', 46],
  ['Shruti Nair', 'CSE · Final year', 'CareCircle', 'Dr. Meera Patel', 'Healthy', 80],
  ['Omkar Patil', 'IT · Third year', 'MindMend', 'Dr. Meera Patel', 'Review', 57],
  ['Lavanya Krishnan', 'CSE · Final year', 'SolarGrid', 'Dr. Anil Thomas', 'On track', 70],
  ['Kabir Singh', 'EEE · Third year', 'EcoTrack', 'Dr. Anil Thomas', 'Monitoring', 43],
  ['Nisha Thomas', 'CSE · Final year', 'Smart HealthNet', 'Dr. Meera Patel', 'Healthy', 93],
  ['Varun Mehta', 'IT · Final year', 'Campus Connect', 'Prof. K. Rao', 'Progressing', 66],
  ['Sanya Prasad', 'CSE · Third year', 'AgriSense', 'Dr. Neha Sinha', 'On track', 75],
].map(([name, academic, project, mentor, status, progress]) => ({
  name,
  academic,
  project,
  mentor,
  detail: `${academic} · ${project} · ${mentor}`,
  status,
  level: `${progress}%`,
}))

const teamRoster = studentRoster.map((student, index) => {
  return {
    name: `${student.project} · Team ${String.fromCharCode(65 + (index % 6))}`,
    detail: `${student.academic} · Lead: ${student.name} · ${student.mentor} · ${3 + (index % 4)} members`,
    status: student.status === 'Healthy' || student.status === 'On track' ? 'On track' : student.status,
    level: student.level,
  }
})

const monitoringRoster = studentRoster.map((student, index) => {
  const progress = Number.parseInt(student.level, 10)
  const risk = progress >= 75 ? 'Low risk' : progress >= 55 ? 'Moderate risk' : 'High risk'
  return {
    name: `${student.project} · Review ${String(index + 1).padStart(2, '0')}`,
    detail: `${risk} · ${student.academic} · ${student.mentor} · ${2 + (index % 3)} tasks due`,
    status: risk === 'Low risk' ? 'Healthy' : risk === 'Moderate risk' ? 'Monitoring' : 'Intervention',
    level: student.level,
  }
})

function RoleModulePage({ page, role, projects = [], tasks = [] }) {
  const activeProjects = projects.filter((project) => !project.completed)
  const taskCount = (projectName) => tasks.filter((task) => task.project === projectName && !task.done).length
  const statusFor = (project) => project.progress >= 75 ? 'Healthy' : project.progress >= 45 ? 'Monitoring' : 'Intervention'
  const studentItems = [...new Map(activeProjects.flatMap((project) => (Array.isArray(project.members) ? project.members : []).map((name) => [name, { name, detail: `${project.name} · ${project.mentor || 'To be assigned'}`, status: statusFor(project), level: `${project.progress || 0}%` }]))).values()]
  const items = page === 'Students' ? studentItems : activeProjects.map((project) => ({
    name: page === 'Teams' ? `${project.name} team` : project.name,
    detail: page === 'Teams' ? `${project.mentor || 'To be assigned'} · ${(project.members || []).length} members` : `${project.mentor || 'To be assigned'} · ${taskCount(project.name)} tasks due`,
    status: statusFor(project),
    level: `${project.progress || 0}%`,
  }))
  const mentors = [...new Set(activeProjects.map((project) => project.mentor).filter((mentor) => mentor && mentor !== 'To be assigned'))]
  const groupedMentors = mentors.map((mentor) => ({ name: mentor, groups: activeProjects.filter((project) => project.mentor === mentor) }))
  const title = page === 'Project Monitoring' ? 'Project monitoring' : page === 'Mentors & Groups' ? 'Mentors and groups' : page
  const description = page === 'Students' ? 'Students currently assigned to active project groups.' : page === 'Teams' ? 'Active project teams and their current delivery pace.' : page === 'Project Monitoring' ? 'Live progress and open work across active projects.' : 'Every mentor and the active groups currently under their guidance.'

  return <section className="workspace-page"><PageHeader eyebrow={role === 'hod' ? 'HOD authority' : 'Mentor workspace'} title={title} description={description} />{page === 'Mentors & Groups' ? <div className="hod-module-grid">{groupedMentors.map((mentor) => <article className="hod-module-card panel" key={mentor.name}><div className="hod-card-header"><span className="hod-index">{String(mentor.groups.length).padStart(2, '0')}</span><span className="hod-status healthy">{mentor.groups.length} groups</span></div><h3>{mentor.name}</h3>{mentor.groups.map((project) => <p key={project.name}>{project.name} · {project.progress || 0}% progress</p>)}</article>)}{!groupedMentors.length && <div className="empty-state"><Users size={24} /><strong>No mentors assigned</strong><span>Assign a mentor to an active project to see them here.</span></div>}</div> : <div className="hod-module-grid">{items.map((item) => <article className="hod-module-card panel" key={item.name}><div className="hod-card-header"><span className="hod-index">{item.name.slice(0, 2).toUpperCase()}</span><span className={`hod-status ${String(item.status).toLowerCase()}`}>{item.status}</span></div><h3>{item.name}</h3><p>{item.detail}</p><div className="hod-progress-wrap"><div className="hod-progress"><span style={{ width: item.level }} /></div><strong>{item.level}</strong></div></article>)}{!items.length && <div className="empty-state"><FolderKanban size={24} /><strong>No live records</strong><span>Create an active project to populate this view.</span></div>}</div>}</section>
}

function LegacyRoleModulePage({ page, role, projects, tasks }) {
  const hod = role === 'hod'
  const mentorData = [
    {
      name: 'Dr. Meera Patel',
      total: '3 groups',
      summary: 'HealthTech lead',
      groups: [
        { name: 'Smart HealthNet', focus: 'AI health monitoring', students: '4 students', progress: 72, status: 'Healthy' },
        { name: 'CareCircle', focus: 'Digital healthcare access', students: '3 students', progress: 64, status: 'Stable' },
        { name: 'MindMend', focus: 'Mental wellness analytics', students: '4 students', progress: 58, status: 'Review' },
      ],
    },
    {
      name: 'Prof. K. Rao',
      total: '4 groups',
      summary: 'EdTech specialist',
      groups: [
        { name: 'Campus Connect', focus: 'Student engagement network', students: '6 students', progress: 48, status: 'Monitoring' },
        { name: 'StudySphere', focus: 'Collaborative learning spaces', students: '5 students', progress: 61, status: 'Stable' },
        { name: 'SkillSpring', focus: 'Career and skills guidance', students: '4 students', progress: 55, status: 'Review' },
        { name: 'SignBridge', focus: 'Inclusion and access support', students: '3 students', progress: 46, status: 'Watching' },
      ],
    },
    {
      name: 'Dr. Anil Thomas',
      total: '2 groups',
      summary: 'Climate & IoT mentor',
      groups: [
        { name: 'EcoTrack', focus: 'Campus sustainability analytics', students: '3 students', progress: 31, status: 'Intervention' },
        { name: 'SolarGrid', focus: 'Renewable energy monitoring', students: '4 students', progress: 44, status: 'Monitoring' },
      ],
    },
    {
      name: 'Dr. Neha Sinha',
      total: '3 groups',
      summary: 'AI and research mentor',
      groups: [
        { name: 'AgriSense', focus: 'Smart agriculture diagnostics', students: '4 students', progress: 81, status: 'Healthy' },
        { name: 'Biometric Lens', focus: 'Secure recognition systems', students: '3 students', progress: 67, status: 'Stable' },
        { name: 'AquaGuard', focus: 'Water quality monitoring', students: '5 students', progress: 56, status: 'Review' },
      ],
    },
    {
      name: 'Prof. Raghav Menon',
      total: '2 groups',
      summary: 'Smart city systems',
      groups: [
        { name: 'SafeRoute', focus: 'Urban mobility safety', students: '4 students', progress: 69, status: 'Healthy' },
        { name: 'TransitIQ', focus: 'Public transport analytics', students: '3 students', progress: 52, status: 'Monitoring' },
      ],
    },
    {
      name: 'Dr. Priya Nair',
      total: '3 groups',
      summary: 'Product and UX mentor',
      groups: [
        { name: 'HeritageAR', focus: 'Cultural preservation tools', students: '4 students', progress: 75, status: 'Healthy' },
        { name: 'CivicLens', focus: 'Citizen feedback dashboards', students: '5 students', progress: 64, status: 'Stable' },
        { name: 'FoodLens', focus: 'Food sourcing and waste insights', students: '3 students', progress: 43, status: 'Watching' },
      ],
    },
  ]

  const [selectedMentor, setSelectedMentor] = useState(mentorData[0])

  const sectionContent = {
    'Students': {
      title: 'Students',
      description: 'View all 40 students with their academic details, project assignment, mentor, status, and current progress.',
      items: studentRoster,
    },
    Teams: {
      title: 'Teams',
      description: 'Track all 40 department teams, their academic stream, team lead, mentor, member count, and current delivery pace.',
      items: teamRoster,
    },
    'Project Monitoring': {
      title: 'Project monitoring',
      description: 'Monitor all 40 project reviews with risk level, academic stream, mentor ownership, tasks due, status, and completion progress.',
      items: monitoringRoster,
    },
    'Mentors & Groups': {
      title: 'Mentors and groups',
      description: 'Every mentor and the groups currently under their guidance, with live progress and delivery details.',
    },
  }[page] || { title: page, description: 'Academic operations and project visibility.', items: [] }

  return (
    <section className="workspace-page">
      <PageHeader eyebrow={hod ? 'HOD authority' : 'Mentor workspace'} title={sectionContent.title} description={sectionContent.description} />

      {page === 'Mentors & Groups' ? (
        <div className="mentor-layout">
          <div className="mentor-list panel">
            {mentorData.map((mentor) => (
              <button
                type="button"
                key={mentor.name}
                className={`mentor-item ${selectedMentor?.name === mentor.name ? 'selected' : ''}`}
                onClick={() => setSelectedMentor(mentor)}
              >
                <div className="workspace-avatar">{mentor.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                <div>
                  <strong>{mentor.name}</strong>
                  <span>{mentor.total} · {mentor.summary}</span>
                </div>
                <span className="mentor-pill">{Math.round(mentor.groups.reduce((sum, group) => sum + group.progress, 0) / mentor.groups.length)}%</span>
              </button>
            ))}
          </div>

          <div className="mentor-detail panel">
            {selectedMentor ? (
              <>
                <p className="eyebrow">Mentor focus</p>
                <h3>{selectedMentor.name}</h3>
                <p className="mentor-summary">{selectedMentor.summary}</p>
                {selectedMentor.groups.map((group) => (
                  <div className="mentor-group-row" key={`${selectedMentor.name}-${group.name}`}>
                    <div className="mentor-group-head">
                      <strong>{group.name}</strong>
                      <span>{group.focus}</span>
                    </div>
                    <div className="mentor-group-meta">
                      <span>{group.students}</span>
                      <span>{group.status}</span>
                    </div>
                    <div className="hod-progress-wrap">
                      <div className="hod-progress">
                        <span style={{ width: `${group.progress}%` }} />
                      </div>
                      <strong>{group.progress}%</strong>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-state compact"><Users size={20} /><span>Select a mentor to view their groups.</span></div>
            )}
          </div>
        </div>
      ) : (
        <div className="hod-module-grid">
          {(sectionContent.items || []).map((item, index) => (
            <article className="hod-module-card panel" key={`${sectionContent.title}-${item.name || index}`}>
              <div className="hod-card-header">
                <span className="hod-index">{String(index + 1).padStart(2, '0')}</span>
                <span className={`hod-status ${String(item.status).toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
              </div>
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
              <div className="hod-progress-wrap">
                <div className="hod-progress">
                  <span style={{ width: `${Number.parseInt(item.level || '0', 10)}%` }} />
                </div>
                <strong>{item.level}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function AICenter({ projects }) { const [query, setQuery] = useState(''); const matches = query ? projects.filter((project) => `${project.name} ${project.type} ${project.abstract}`.toLowerCase().includes(query.toLowerCase())) : []; return <section className="workspace-page"><PageHeader eyebrow="Project intelligence" title="AI project assistant" description="Ask about a project domain to find relevant completed work and starting points." /><div className="ai-panel panel"><div className="ai-prompt"><Sparkles size={21} /><div><h3>What are you building?</h3><p>Try “health sector”, “climate”, or “education”.</p></div></div><div className="ai-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Describe your project domain..." /></div>{query && <div className="ai-results"><p className="eyebrow">{matches.length} related projects found</p>{matches.slice(0, 6).map((project) => <div className="ai-result" key={project.id}><div className={`project-symbol ${project.color}`}><FolderKanban size={16} /></div><div><strong>{project.name}</strong><span>{project.year} · {project.type}</span><p>{project.abstract}</p></div></div>)}{!matches.length && <div className="empty-state compact"><Sparkles size={20} /><span>No matching archive projects yet. Try another domain.</span></div>}</div>}</div></section> }
function ProcessPage({ steps, canEdit, onSave }) { const [draft, setDraft] = useState(steps); const [newStep, setNewStep] = useState(''); const save = () => onSave(draft); return <section className="workspace-page"><PageHeader eyebrow="Standard workflow" title="How projects get completed" description={canEdit ? 'You can update this process as a mentor or HOD.' : 'Follow this shared path from idea to final submission.'} /><div className="process-panel panel"><div className="process-list">{draft.map((step, index) => <div className="process-step" key={`${step}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{canEdit ? <input value={step} onChange={(event) => setDraft(draft.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /> : <strong>{step}</strong>}</div>)}</div>{canEdit && <div className="process-editor"><input value={newStep} onChange={(event) => setNewStep(event.target.value)} placeholder="Add a process step" /><button className="secondary-button" onClick={() => { if (newStep.trim()) { setDraft([...draft, newStep.trim()]); setNewStep('') } }}><Plus size={15} /> Add step</button><button className="primary-button" onClick={save}><Check size={15} /> Save process</button></div>}</div></section> }
function NotificationItem({ title, detail }) { return <div className="notification-item"><div className="notification-icon"><Bell size={16} /></div><div><strong>{title}</strong><span>{detail}</span><small>Just now</small></div></div> }

function RequestInbox({ requests, onRequestDecision }) {
  return <section className="workspace-page"><PageHeader eyebrow="Collaboration requests" title="Requests" description="Review invitations to join projects or supervise a team. Accepting or rejecting removes the request from the queue and records feedback." /><div className="panel request-inbox">{requests.length ? requests.map((request) => <div className="request-inbox-row" key={request.id}><div className="workspace-avatar">{request.type === 'mentor' ? 'M' : 'S'}</div><div><strong>{request.type === 'mentor' ? `${request.from} requested mentor support` : `${request.from} invited you to join ${request.project}`}</strong><span>{request.type === 'mentor' ? `Project: ${request.project}` : `${request.invitee?.name || request.to || 'Student member'} · ${request.invitee?.batch || 'Academic member'} · ${request.invitee?.department || 'Department not provided'}`}</span></div><div className="request-actions"><button className="text-button" onClick={() => onRequestDecision?.(request.id, 'accepted')}>Accept</button><button className="text-button danger" onClick={() => onRequestDecision?.(request.id, 'rejected')}>Reject</button></div></div>) : <div className="empty-state compact"><Bell size={20} /><span>No pending collaboration requests.</span></div>}</div></section>
}

function MentorWorkspacePage({ requests = [], onRequestDecision }) {
  const queue = requests.length ? requests : [
    { id: 1, project: 'Smart HealthNet', from: 'Aman Kumar', type: 'collaboration', status: 'pending' },
    { id: 2, project: 'Campus Connect', from: 'Riya Shah', type: 'mentor', status: 'pending' },
    { id: 3, project: 'EcoTrack', from: 'Meera Das', type: 'collaboration', status: 'pending' },
  ]

  return (
    <section className="workspace-page">
      <PageHeader eyebrow="Mentor workspace" title="Mentor workspace" description="Review collaborations, mentor requests, and team activity in one place." />

      <div className="role-operations">
        <div>
          <p className="eyebrow">Mentor console</p>
          <h2>Working groups</h2>
          <p>Track every active team and handle requests before the next review cycle.</p>
        </div>

        <div className="ops-grid">
          <div className="ops-stat"><strong>03</strong><span>active groups</span></div>
          <div className="ops-stat"><strong>12</strong><span>students supported</span></div>
          <div className="ops-stat"><strong>76%</strong><span>average progress</span></div>
        </div>

        <div className="ops-actions">
          <button className="secondary-button" onClick={() => onRequestDecision?.(queue[0]?.id, 'accepted')}><Users size={15} /> Manage groups</button>
          <button className="secondary-button" onClick={() => onRequestDecision?.(queue[1]?.id, 'accepted')}><FileText size={15} /> Generate group report</button>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Requests</p>
            <h3>Pending actions</h3>
          </div>
        </div>

        {queue.map((request) => (
          <div className="group-row" key={request.id}>
            <div className="workspace-avatar">{request.project.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{request.project}</strong>
              <span>{request.from} · {request.type} request</span>
            </div>
            <div className="request-actions">
              <button className="text-button" onClick={() => onRequestDecision?.(request.id, 'accepted')}>Accept</button>
              <button className="text-button danger" onClick={() => onRequestDecision?.(request.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TaskSchedulePage({ tasks = [], requests = [], onAddTask, onUpdateTask, onRequestDecision }) {
  const completionRequests = requests.filter((request) => request.type === 'task-completion' && request.status === 'pending')
  return <section className="workspace-page"><PageHeader eyebrow="Execution planning" title="Task schedule" description="Create, assign, and monitor every task across active student projects." /><div className="panel"><form className="guidance-form" onSubmit={onAddTask}><label>Task title<input name="title" required placeholder="e.g. Complete API testing" /></label><label>Project<select name="project" defaultValue="Smart HealthNet"><option>Smart HealthNet</option><option>Campus Connect</option><option>EcoTrack</option></select></label><label>Due date<input name="due" defaultValue="This week" /></label><label>Priority<select name="priority" defaultValue="Medium"><option>High</option><option>Medium</option><option>Low</option></select></label><button className="primary-button" type="submit"><Plus size={15} /> Add task</button></form></div>{completionRequests.length > 0 && <div className="panel task-approval-panel"><div className="section-heading"><div><p className="eyebrow">Mentor review</p><h3>Completion requests</h3></div></div>{completionRequests.map((request) => <div className="group-row" key={request.id}><div className="workspace-avatar">{request.from.slice(0, 2).toUpperCase()}</div><div><strong>{request.taskTitle}</strong><span>{request.from} · {request.project}</span><small className="task-proof">Proof: {request.proof}</small></div><div className="request-actions"><button className="text-button" onClick={() => onRequestDecision?.(request.id, 'accepted')}>Approve</button><button className="text-button danger" onClick={() => onRequestDecision?.(request.id, 'rejected')}>Reject</button></div></div>)}</div>}<div className="panel task-schedule-list">{tasks.length ? tasks.map((task) => <div className="group-row" key={task.id || `${task.title}-${task.project}`}><div className="workspace-avatar">{task.project.slice(0, 2).toUpperCase()}</div><div><strong>{task.title}</strong><span>{task.project} · {task.due} · {task.priority} · {task.done ? 'Completed' : task.approvalPending ? 'Pending mentor approval' : 'Open'}</span></div><div className="request-actions">{task.approvalPending ? <span className="pending-label">Pending review</span> : <button className="text-button" onClick={() => onUpdateTask?.(task.id, { done: !task.done, approved: task.done ? false : true })}>{task.done ? 'Reopen' : 'Complete'}</button>}</div></div>) : <div className="empty-state compact"><Check size={20} /><span>No tasks assigned yet.</span></div>}</div></section>
}

function ReportsPage({ projects = [], tasks = [], guidance = [], onGuidance }) {
  const activeProjects = projects.filter((project) => !project.completed)
  const reportGroups = [...new Map(activeProjects.map((project) => [project.name, project])).values()]
  const getTasks = (projectName) => tasks.filter((task) => task.project === projectName)
  const getGuidance = (projectName) => guidance.filter((item) => item.project === projectName).slice(-1)[0]
  const downloadReport = (project) => {
    const projectTasks = getTasks(project.name)
    const completed = projectTasks.filter((task) => task.done).length
    const content = `ProjectVault Group Report\n\nGroup: ${project.name}\nMentor: ${project.mentor || 'To be assigned'}\nProgress: ${project.progress || 0}%\nCompleted tasks: ${completed}\nOpen tasks: ${projectTasks.length - completed}\n\nLatest guidance\n${getGuidance(project.name)?.message || 'No guidance submitted.'}`
    const url = URL.createObjectURL(new Blob([content], { type: 'application/msword' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-report.doc`
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="workspace-page"><PageHeader eyebrow="Group reporting" title="Reports" description="Each active project has one distinct report with its own progress, tasks, and guidance." /><div className="report-group-grid">{reportGroups.map((project) => { const projectTasks = getTasks(project.name); const completed = projectTasks.filter((task) => task.done).length; const rate = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0; const latestGuidance = getGuidance(project.name); return <article className="panel report-group-card" key={project.name}><div className="section-heading"><div><p className="eyebrow">Group report</p><h3>{project.name}</h3></div><button className="secondary-button" onClick={() => downloadReport(project)}><FileText size={15} /> Download</button></div><p>{project.mentor || 'Mentor to be assigned'} · {project.progress || 0}% project progress</p><div className="metric-grid compact-grid"><MetricCard icon={Check} label="Completed" value={String(completed)} delta={`${projectTasks.length} total tasks`} tone="green" /><MetricCard icon={Target} label="Open" value={String(projectTasks.length - completed)} delta="Needs attention" tone="blue" /><MetricCard icon={Gauge} label="Task rate" value={`${rate}%`} delta="This group" tone="coral" /></div><div className="report-guidance"><strong>Latest guidance</strong><span>{latestGuidance?.message || 'No guidance submitted for this group.'}</span></div></article> })}{!reportGroups.length && <div className="empty-state"><FileText size={24} /><strong>No reports yet</strong><span>Active projects will receive a separate report here.</span></div>}</div><div className="panel report-form-panel"><div className="section-heading"><div><p className="eyebrow">Submit update</p><h3>Group-specific weekly report</h3></div></div><form className="guidance-form" onSubmit={onGuidance}><label>Project<select name="project" defaultValue={reportGroups[0]?.name || ''} required>{reportGroups.map((project) => <option key={project.name}>{project.name}</option>)}</select></label><label>Weekly guidance<textarea name="message" rows="4" placeholder="Summarize completed work, blockers, and next steps..." required /></label><button className="primary-button" type="submit"><Check size={15} /> Send report</button></form></div></section>
}

function LegacyReportsPage({ tasks, guidance, onGuidance }) {
  const summary = tasks.reduce((acc, task) => {
    if (task.done) acc.done += 1
    else acc.open += 1
    return acc
  }, { done: 0, open: 0 })

  const completionRate = tasks.length ? Math.round((summary.done / tasks.length) * 100) : 0
  const downloadReport = () => {
    const content = `ProjectVault Weekly Report\n\nCompletion: ${completionRate}%\nCompleted tasks: ${summary.done}\nOpen tasks: ${summary.open}\n\nGuidance\n${guidance.map((item) => `- ${item.project}: ${item.message}`).join('\n') || 'No guidance submitted.'}`
    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'projectvault-weekly-report.doc'
    link.click()
    URL.revokeObjectURL(url)
  }
  useEffect(() => {
    window.addEventListener('projectvault:download-report', downloadReport)
    return () => window.removeEventListener('projectvault:download-report', downloadReport)
  })

  return <section className="workspace-page"><PageHeader eyebrow="Weekly reporting" title="Reports" description="Track task completion, review guidance requests, and summarize your project progress." /><div className="guidance-layout panel"><div className="guidance-section"><p className="eyebrow">This week</p><h3>Project status</h3><div className="metric-grid compact-grid"><MetricCard icon={Check} label="Completed tasks" value={String(summary.done)} delta="This weekly cycle" tone="green" /><MetricCard icon={Target} label="Open tasks" value={String(summary.open)} delta="Still in progress" tone="blue" /><MetricCard icon={Gauge} label="Completion rate" value={`${completionRate}%`} delta="Current momentum" tone="coral" /></div></div><div className="guidance-section"><p className="eyebrow">Guidance</p><h3>Mentor conversations</h3>{guidance.length ? <div className="guidance-list">{guidance.map((item) => <div className="guidance-item" key={item.id}><strong>{item.project}</strong><span>{item.from}</span><p>{item.message}</p><small>{item.status}</small></div>)}</div> : <div className="empty-state compact"><FileText size={20} /><span>No guidance requests submitted yet.</span></div>}</div></div>
    <div className="panel report-form-panel"><div className="section-heading"><div><p className="eyebrow">Submit update</p><h3>Weekly summary</h3></div></div><form className="guidance-form" onSubmit={onGuidance}><label>Project<select name="project" defaultValue="Smart HealthNet"><option>Smart HealthNet</option><option>Campus Connect</option><option>EcoTrack</option></select></label><label>Weekly guidance<textarea name="message" rows="4" placeholder="Summarize completed work, blockers, and next steps..." required /></label><button className="primary-button" type="submit"><Check size={15} /> Send report</button></form></div></section>
}

function KnowledgePage({ items, query, canAdd, onAdd }) { const [filter, setFilter] = useState('All'); const [showAdd, setShowAdd] = useState(false); const types = ['All', ...new Set(items.map((item) => item.type))]; const visible = items.filter((item) => (filter === 'All' || item.type === filter) && `${item.title} ${item.tag} ${item.description} ${item.owner}`.toLowerCase().includes(query.toLowerCase())); return <section className="workspace-page"><div className="workspace-page-header"><PageHeader eyebrow="Institutional memory" title="Knowledge repository" description="Find project reports, research, templates, presentations, and tutorials." />{canAdd && <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={16} /> Add resource</button>}</div><div className="knowledge-toolbar"><div className="filter-tabs">{types.map((type) => <button key={type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{type}</button>)}</div><span>{visible.length} resources</span></div><div className="knowledge-grid">{visible.map((item) => <article className="knowledge-card" key={item.id}><div className="knowledge-icon"><BookOpen size={18} /></div><div><span className="knowledge-type">{item.type}</span><h3>{item.title}</h3><p>{item.description}</p><div className="knowledge-meta"><span>{item.tag}</span><span>{item.owner}</span><span>{item.year}</span></div><a href={item.link} target="_blank" rel="noreferrer">Open resource <ArrowUpRight size={14} /></a></div></article>)}</div>{!visible.length && <div className="empty-state"><BookOpen size={24} /><strong>No resources found</strong><span>Try another search or category.</span></div>}{showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><form className="composer-modal" onSubmit={(event) => { onAdd(event); setShowAdd(false) }} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Knowledge repository</p><h2>Add a resource</h2></div><button type="button" className="icon-button" onClick={() => setShowAdd(false)} aria-label="Close dialog"><X size={18} /></button></div><label>Title<input name="title" required placeholder="Resource title" /></label><label>Type<select name="type"><option>Project report</option><option>Research paper</option><option>Tutorial</option><option>Template</option><option>Presentation</option></select></label><label>Category<input name="tag" required placeholder="e.g. AI Research" /></label><label>Description<textarea name="description" required rows="3" placeholder="What will students learn?" /></label><label>Resource link<input name="link" type="url" required placeholder="https://..." /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={16} /> Add resource</button></div></form></div>}</section> }
function SettingsPage({ user, settings, onSave }) { return <section className="workspace-page"><PageHeader eyebrow="Workspace control" title="Settings" description="Update your profile, academic context, and notification preferences." /><form className="settings-layout" onSubmit={onSave}><div className="panel settings-panel"><p className="eyebrow">Profile</p><h3>Personal information</h3><label>Full name<input name="name" defaultValue={user.name} required /></label><label>Email address<input name="email" type="email" defaultValue={user.email} required /></label><div className="role-summary"><ShieldCheck size={18} /><div><strong>{roles[user.role].label} account</strong><span>Role permissions are controlled by your account.</span></div></div></div><div className="panel settings-panel"><p className="eyebrow">Academic workspace</p><h3>Context</h3><label>Department<input name="department" defaultValue={settings.department} required /></label><label>Batch / year<input name="batch" defaultValue={settings.batch} required /></label><div className="setting-toggle"><div><strong>Notifications</strong><span>Receive project activity updates.</span></div><input type="checkbox" name="notifications" defaultChecked={settings.notifications} /></div><div className="setting-toggle"><div><strong>Weekly digest</strong><span>Get a weekly progress summary.</span></div><input type="checkbox" name="weeklyDigest" defaultChecked={settings.weeklyDigest} /></div><button className="primary-button" type="submit"><Check size={16} /> Save settings</button></div></form></section> }
function RoleOperations({ role, onTool }) { const hod = role === 'hod'; return <section className="role-operations"><div><p className="eyebrow">{hod ? 'Department oversight' : 'Mentor console'}</p><h2>{hod ? 'Academic operations' : 'Working groups'}</h2><p>{hod ? 'Track mentors, groups, achievements, and department progress.' : 'Monitor your assigned groups and keep their next actions clear.'}</p></div><div className="ops-grid"><div className="ops-stat"><strong>{hod ? '08' : '03'}</strong><span>{hod ? 'active mentors' : 'working groups'}</span></div><div className="ops-stat"><strong>{hod ? '24' : '12'}</strong><span>students supported</span></div><div className="ops-stat"><strong>76%</strong><span>average progress</span></div></div><div className="ops-actions"><button className="secondary-button" onClick={onTool}><Users size={15} /> {hod ? 'View mentors & groups' : 'Manage working groups'}</button><button className="secondary-button" onClick={onTool}><FileText size={15} /> Generate group report</button>{hod && <button className="primary-button" onClick={onTool}><Plus size={15} /> Upload achievement</button>}</div></section> }
function RoleTool({ role, onClose }) { const hod = role === 'hod'; return <div className="modal-backdrop" onClick={onClose}><div className="role-tool panel" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">{hod ? 'HOD authority' : 'Mentor console'}</p><h2>{hod ? 'Mentors & working groups' : 'Working groups'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div><div className="group-row"><div className="workspace-avatar">SH</div><div><strong>Smart HealthNet group</strong><span>Dr. Meera Patel · 72% progress · 4 students</span></div><button className="text-button">Set tasks <ArrowUpRight size={14} /></button></div><div className="group-row"><div className="workspace-avatar">CC</div><div><strong>Campus Connect group</strong><span>Prof. K. Rao · 48% progress · 6 students</span></div><button className="text-button">View report <ArrowUpRight size={14} /></button></div>{hod && <div className="achievement-box"><Sparkles size={18} /><div><strong>Achievement spotlight</strong><span>Upload a winning project or department achievement to show on every home page.</span></div><button className="secondary-button">Choose file</button></div>}<button className="primary-button" onClick={onClose}>Done</button></div></div> }

function Launch({ onStart }) { return <div className="launch-screen"><div className="launch-copy"><div className="launch-brand"><span className="brand-mark">p</span><strong>project<span>vault</span></strong></div><div className="launch-kicker"><span /> Academic project intelligence <span /></div><h1>Where ideas<br /><em>become visible.</em></h1><p className="launch-description">A focused home for student builders, generous mentors, and academic leaders shaping the next useful thing.</p><div className="launch-actions"><button className="primary-button" onClick={() => onStart('register')}>Enter your workspace <ArrowRight size={17} /></button><button className="launch-login" onClick={() => onStart('login')}><LogIn size={16} /> Sign in</button></div><div className="launch-trust"><ShieldCheck size={15} /> Built for academic teams <span /> <LockKeyhole size={14} /> Private by role</div></div><div className="launch-art"><div className="launch-art-grid" /><div className="launch-orbit orbit-one" /><div className="launch-orbit orbit-two" /><div className="launch-signal signal-one"><span>01</span><strong>Ideas</strong><small>shape the question</small></div><div className="launch-signal signal-two"><span>02</span><strong>Teams</strong><small>move the work</small></div><div className="launch-signal signal-three"><span>03</span><strong>Outcomes</strong><small>make it matter</small></div><div className="launch-core"><div className="launch-core-mark">p</div><span>PROJECT<span>VAULT</span></span></div><div className="launch-caption"><FolderKanban size={15} /><span>One workspace<br /><strong>many ways forward</strong></span></div></div></div> }

function PasswordInput({ name, placeholder, onChange, required = true }) {
  const [visible, setVisible] = useState(false)
  return <div className="password-input"><input type={visible ? 'text' : 'password'} name={name} required={required} minLength="6" placeholder={placeholder} onChange={onChange} /><button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
}

function Auth({ mode, role, setRole, onSubmit, error, onBack, onSwitch }) {
  const [submitting, setSubmitting] = useState(false)
  const isRegister = mode === 'register'
  const roleInfo = roles[role]
  const RoleIcon = roleInfo.icon
  const submit = async (event) => { setSubmitting(true); await onSubmit(event); setSubmitting(false) }
  return <div className="auth-screen">
    <button className="auth-back" onClick={onBack}><ArrowRight size={15} /> Back to home</button>
    <div className="auth-panel">
      <div className="auth-brand"><span className="brand-mark">p</span><strong>project<span>vault</span></strong><span className="auth-live"><i /> Secure workspace</span></div>
      <div className="auth-heading"><p className="eyebrow">{isRegister ? 'Join your workspace' : 'Welcome back'}</p><h1>{isRegister ? 'Build your academic home.' : 'Pick up where your ideas left off.'}</h1><p>{isRegister ? 'Choose your role and create a focused workspace in a few moments.' : 'Sign in to see your projects, team momentum, and next steps.'}</p></div>
      <div className="role-tabs auth-role-tabs">{Object.entries(roles).map(([key, item]) => { const Icon = item.icon; return <button type="button" key={key} className={role === key ? 'selected' : ''} onClick={() => setRole(key)}><Icon size={18} /><span>{item.label}</span><small>{item.detail.split(',')[0]}</small></button> })}</div>
      <div className="auth-role-preview"><div className="auth-preview-icon"><RoleIcon size={20} /></div><div><strong>{roleInfo.label} workspace</strong><span>{roleInfo.detail}</span></div><Sparkles size={17} /></div>
      {error && <div className="auth-error" role="alert"><Bell size={15} />{error}</div>}
      <form onSubmit={submit} className="auth-form">{isRegister && <label>Full name<input name="name" required placeholder={role === 'student' ? 'Your full name' : `${roleInfo.label} name`} /></label>}<label>Email address<input type="email" name="email" required placeholder="you@college.edu" /></label><label>Password<PasswordInput name="password" placeholder="At least 6 characters" /></label>{isRegister && <label>Confirm password<PasswordInput name="confirmPassword" placeholder="Repeat your password" onChange={(event) => { const password = event.currentTarget.form.password.value; event.target.setCustomValidity(event.target.value === password ? '' : 'Passwords do not match') }} /></label>}{isRegister && role !== 'student' && <label className="secret-field">{roleInfo.label} secret code<PasswordInput name="secret" placeholder="Enter your role code" onChange={(event) => { const valid = (role === 'mentor' && event.target.value === 'nbnscoe') || (role === 'hod' && event.target.value === 'Swapnil'); event.target.setCustomValidity(valid ? '' : `Invalid ${roleInfo.label} secret code`) }} /><small><LockKeyhole size={12} /> Required to verify your {roleInfo.label.toLowerCase()} account</small></label>}<button className={`primary-button auth-submit ${submitting ? 'is-loading' : ''}`} type="submit" disabled={submitting}><span>{submitting ? 'Opening workspace…' : isRegister ? 'Create account' : 'Sign in securely'}</span><ArrowRight size={16} /></button></form>
      <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to ProjectVault?'} <button type="button" onClick={onSwitch}>{isRegister ? 'Sign in' : 'Create an account'}</button></p><p className="role-caption"><RoleIcon size={14} /> {roleInfo.detail}</p>
    </div>
    <div className="auth-side"><div className="auth-side-orbit orbit-one" /><div className="auth-side-orbit orbit-two" /><div className="auth-side-stat"><strong>One place</strong><span>for academic momentum</span></div><div className="auth-quote"><span>“</span><p>Great projects do not happen by accident. They happen when the right people have room to think, build, and be seen.</p><small>ProjectVault principle · 01</small></div></div>
  </div>
}

function AuthLegacy({ mode, role, setRole, onSubmit, error, onBack, onSwitch }) { const isRegister = mode === 'register'; const roleInfo = roles[role]; const RoleIcon = roleInfo.icon; return <div className="auth-screen"><button className="auth-back" onClick={onBack}><ArrowRight size={15} /> Back to home</button><div className="auth-panel"><div className="auth-brand"><span className="brand-mark">p</span><strong>project<span>vault</span></strong></div><div className="auth-heading"><p className="eyebrow">{isRegister ? 'Join your workspace' : 'Welcome back'}</p><h1>{isRegister ? 'Create your account' : 'Sign in to ProjectVault'}</h1><p>{isRegister ? 'Choose your role to enter the right academic workspace.' : 'Continue your project journey.'}</p></div><div className="role-tabs">{Object.entries(roles).map(([key, item]) => { const Icon = item.icon; return <button type="button" key={key} className={role === key ? 'selected' : ''} onClick={() => setRole(key)}><Icon size={17} /><span>{item.label}</span></button> })}</div>{error && <div className="auth-error" role="alert"><Bell size={15} />{error}</div>}<form onSubmit={onSubmit} className="auth-form">{isRegister && <label>Full name<input name="name" required placeholder={role === 'student' ? 'Your full name' : `${roleInfo.label} name`} /></label>}<label>Email address<input type="email" name="email" required placeholder="you@college.edu" /></label><label>Password<input type="password" name="password" required minLength="6" placeholder="At least 6 characters" /></label>{isRegister && <label>Confirm password<input type="password" name="confirmPassword" required minLength="6" placeholder="Repeat your password" onChange={(event) => { const password = event.currentTarget.form.password.value; event.target.setCustomValidity(event.target.value === password ? '' : 'Passwords do not match') }} /></label>}{isRegister && role !== 'student' && <label className="secret-field">{roleInfo.label} secret code<input type="password" name="secret" required placeholder="Enter your role code" onChange={(event) => { const valid = (role === 'mentor' && event.target.value === 'nbnscoe') || (role === 'hod' && event.target.value === 'Swapnil'); event.target.setCustomValidity(valid ? '' : `Invalid ${roleInfo.label} secret code`) }} /><small><LockKeyhole size={12} /> Required to verify your {roleInfo.label.toLowerCase()} account</small></label>}<button className="primary-button auth-submit" type="submit">{isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form><p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to ProjectVault?'} <button onClick={onSwitch}>{isRegister ? 'Sign in' : 'Create an account'}</button></p><p className="role-caption"><RoleIcon size={14} /> {roleInfo.detail}</p></div><div className="auth-side"><div className="auth-quote"><span>“</span><p>Great projects do not happen by accident. They happen when the right people have room to think, build, and be seen.</p><small>ProjectVault principle · 01</small></div></div></div> }

export default App

createRoot(document.getElementById('root')).render(<App />)
