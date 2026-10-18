# Weekday assignments

Run commands from the application directory. Plans are dated imports, not recurring jobs. Use the existing allowlisted Firebase login; the same owner, task key, and business date identify an assignment.

Apply database migrations before deploying the task code:

```powershell
node --env-file=.env scripts/migrate.mjs
```

The October 19–23, 2026 plan contains 30 assignments owned by Manny and shared with Elliott. Preview it:

```powershell
node scripts/import-tasks.mjs --file task-plans/manny-2026-W43.json --week 2026-W43 --email manny.lamboy23@gmail.com --share-with elliott@texasaiconsulting.com
```

To save the authorized plan, run the same command with `node --env-file=.env` and append `--apply`.

Sharing links the original task IDs. It does not create a second checklist. Both accounts see the same instructions, resource links, completion, and note. Only the person who completes the task earns its points and XP, once. Simultaneous check-offs are serialized on the task row. Personal assignments remain private to their owner unless explicitly shared.

Reimports update incomplete assignments; completed work and rewards stay intact. Sharing is additive and can include completed assignments without paying them again. Omitting `--share-with` later does not revoke existing access. Keep Manny as the owner when revising this plan.

On `/admin/tasks`, select week 43 to view this schedule. Check-offs are available Monday–Friday in America/Chicago, on or after the due date. A second open account sees updates on focus or the next minute's refresh.
