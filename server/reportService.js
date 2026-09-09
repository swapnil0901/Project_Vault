export function buildWeeklyReport({ projectName, student, tasks = [], guidance = [] }) {
  const completedTasks = tasks.filter((task) => task.done)
  const pendingTasks = tasks.filter((task) => !task.done)
  const guidanceText = guidance.map((item) => item.message || item.comment || item.detail).filter(Boolean)

  const lines = [
    'Weekly Progress Report',
    `Project: ${projectName || 'ProjectVault Project'}`,
    `Student: ${student || 'Student'}`,
    `Date: ${new Date().toLocaleDateString()}`,
    '',
    'Summary:',
    `- Completed tasks: ${completedTasks.length}`,
    `- Pending tasks: ${pendingTasks.length}`,
    `- Progress status: ${completedTasks.length > 0 ? 'On track' : 'Needs attention'}`,
    '',
    'Completed work:',
    completedTasks.length
      ? completedTasks.map((task) => `- ${task.title}${task.proof ? ` (${task.proof})` : ''}`).join('\n')
      : '- No tasks completed this week.',
    '',
    'Pending work:',
    pendingTasks.length
      ? pendingTasks.map((task) => `- ${task.title}`).join('\n')
      : '- No pending tasks.',
    '',
    'Mentor guidance:',
    guidanceText.length
      ? guidanceText.map((item) => `- ${item}`).join('\n')
      : '- No mentor guidance provided this week.',
    '',
    'Outcome:',
    completedTasks.length >= 1 ? 'The project is making steady progress and remains aligned with the timeline.' : 'The project needs stronger weekly momentum to stay on track.',
  ]

  return lines.join('\n')
}

export function buildProjectSummary({ projectName, progress = 0, taskCount = 0, completedCount = 0 }) {
  const completionRate = Number(progress) || Math.round((Number(completedCount) / Math.max(Number(taskCount), 1)) * 100)
  const status = completionRate >= 70 ? 'On track' : completionRate >= 40 ? 'Watchlist' : 'Needs attention'

  return [
    `Project Summary: ${projectName || 'Project'}`,
    `Completion: ${completionRate}%`,
    `Tasks completed: ${completedCount}/${taskCount || completedCount}`,
    `Status: ${status}`,
  ].join('\n')
}
