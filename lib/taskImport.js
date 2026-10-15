import { transaction } from './db.js'

export async function importTasks(assignments, assigneeId) {
  return transaction(async (client) => {
    const counts = { imported: 0, updated: 0, completedUnchanged: 0 }
    for (const task of assignments) {
      const result = await client.query(`insert into admin_tasks
        (task_key, assignee_id, title, instructions, due_date, points, xp, source, resource_url)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        on conflict (assignee_id, task_key, due_date) do update set
          title = excluded.title, instructions = excluded.instructions, points = excluded.points,
          xp = excluded.xp, source = excluded.source, resource_url = excluded.resource_url, updated_at = now()
        where admin_tasks.completed_at is null
        returning (xmax = 0) as inserted`,
      [task.key, assigneeId, task.title, task.instructions, task.dueDate, task.points, task.xp, task.source, task.link])
      if (!result.rows.length) counts.completedUnchanged++
      else if (result.rows[0].inserted) counts.imported++
      else counts.updated++
    }
    return counts
  })
}
