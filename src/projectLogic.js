export function calculateProjectProgress(tasks = []) {
  if (!tasks.length) return 0

  const completed = tasks.filter((task) => task.done).length
  return Math.round((completed / tasks.length) * 100)
}

export function buildRoleNavigation(role) {
  const base = {
    student: [
      'Overview',
      'All Projects',
      'My Projects',
      'Tasks',
      'Reports',
      'AI Center',
      'Project Chat',
      'Project Process',
      'Notifications',
    ],
    mentor: [
      'Overview',
      'My Projects',
      'Mentor Workspace',
      'Task Schedule',
      'Reports',
      'AI Center',
      'Project Chat',
      'Project Process',
      'Analytics',
      'Project Similarity',
      'Notifications',
    ],
    hod: [
      'Overview',
      'All Projects',
      'Mentors & Groups',
      'Students',
      'Teams',
      'Project Monitoring',
      'Reports',
      'Project Similarity',
      'Alumni',
      'Achievements',
      'Project Chat',
      'Notifications',
    ],
  }

  return base[role] || base.student
}

export function getTaskApprovalStatus(task = {}) {
  if (task.approved) return 'approved'
  if (task.proof && !task.approved) return 'pending'
  if (task.done) return 'completed'
  return 'open'
}

export function resolveProjectImage(project = {}, fallback = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80') {
  return project.image || project.gallery?.[0] || fallback
}

export function calculateSimilarityScore(candidateText = '', referenceText = '') {
  const stopWords = new Set(['a', 'an', 'and', 'are', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'using', 'with'])
  const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 2 && !stopWords.has(word))
  const candidateWords = normalize(candidateText)
  const referenceWords = normalize(referenceText)

  if (!candidateWords.length || !referenceWords.length) return 0

  const candidateSet = new Set(candidateWords)
  const referenceSet = new Set(referenceWords)
  const overlap = [...candidateSet].filter((word) => referenceSet.has(word))
  const smallerSetSize = Math.min(candidateSet.size, referenceSet.size)

  return Math.round((overlap.length / smallerSetSize) * 100)
}

export function getCertificateItems() {
  return [
    { id: 'completion', title: 'Project Completion Certificate', project: 'Smart HealthNet', date: 'Aug 2026', status: 'Issued' },
    { id: 'innovation', title: 'Innovation Showcase Certificate', project: 'Campus Connect', date: 'Jul 2026', status: 'Issued' },
    { id: 'research', title: 'Research Excellence Certificate', project: 'EcoTrack', date: 'Jun 2026', status: 'Issued' },
  ]
}

export function getReportSummary(tasks = [], guidance = []) {
  const completed = tasks.filter((task) => task.done).length
  const pending = tasks.length - completed
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return {
    completed,
    pending,
    guidanceItems: guidance.length,
    completionRate,
  }
}
