# Weekday assignments

Run commands from the application directory. Plans are dated imports, not recurring jobs. Use the existing allowlisted Firebase login; the same owner, task key, and business date identify an assignment.

Apply database migrations before deploying the task code:

```powershell
node --env-file=.env scripts/migrate.mjs
```

The October 19–23, 2026 plan contains 26 assignments owned by Manny and shared with Elliott. The remaining two agency assignments are in `manny-2026-W44.json`, due October 26. Each business day has two agency assignments, alongside the separately scheduled social, GHL, Upwork, and SBA work. Instructions use short, positive steps focused on profile setup and saving access in Keeper. Preview week 43:

```powershell
node scripts/import-tasks.mjs --file task-plans/manny-2026-W43.json --week 2026-W43 --email manny.lamboy23@gmail.com --share-with elliott@texasaiconsulting.com
```

To save the authorized plan, run the same command with `node --env-file=.env` and append `--apply`.

For October 26, use `--file task-plans/manny-2026-W44.json --week 2026-W44` with the same account flags.

| Date | Agency assignments |
| --- | --- |
| October 19 | Bexar County; City of San Antonio |
| October 20 | SAM.gov; University Health |
| October 21 | CPS Energy; Texas CMBL |
| October 22 | TxDOT; TIPS |
| October 23 | BuyBoard; DIR |
| October 26 | GSA; TXMAS |

The former business-details preparation and weekly audit tasks were removed from the active checklist. Existing agency task IDs and shared access were preserved when their dates changed. Future date changes should likewise update the existing task IDs; importing the same key on a new date creates a separate assignment. A recovery snapshot of the original uncompleted records is stored locally in the ignored `.tmp/` folder.

Sharing links the original task IDs. It does not create a second checklist. Both accounts see the same instructions, resource links, completion, and note. Only the person who completes the task earns its points and XP, once. Simultaneous check-offs are serialized on the task row. Personal assignments remain private to their owner unless explicitly shared.

Reimports update incomplete assignments; completed work and rewards stay intact. Sharing is additive and can include completed assignments without paying them again. Omitting `--share-with` later does not revoke existing access. Keep Manny as the owner when revising this plan.

On `/admin/tasks`, select week 43 for October 19–23 and week 44 for October 26. Check-offs are available Monday–Friday in America/Chicago, on or after the due date, until the task's week ends. A second open account sees updates on focus or the next minute's refresh.

## Daily routines

`routines.json` lists work that must happen every business day (GoHighLevel messages and the Upwork job search). Routines are not part of weekly plans: the board generates them for every business day of the current week, shared like their definition. Load or change them with:

```powershell
node --env-file=.env scripts/import-routines.mjs --file task-plans/routines.json --email manny.lamboy23@gmail.com --share-with elliott@texasaiconsulting.com --apply
```

The file is the complete list for that person; a routine removed from it is paused. A routine can only be checked off on its own day and expires unchecked at the end of that day without restarting. Points are the base value times the routine streak: +10% for each fully cleared business day in a row before today, up to double. Clearing every routine on all five days pays the routine owner a one-time 300-point / 75 XP perfect-week bonus. Missing a day resets the streak. Requires `db/migrations/005_task_routines.sql`.

## Unfinished tasks

Unfinished work does not carry over as overdue. When a week ends, every unchecked task in it is closed as **Not done** (`missed_at`) and a fresh copy restarts on the same weekday of the current week, with the same instructions, rewards, and shared access (`restarted_from` links the copy to the original). If that slot already holds the same task key, such as a weekly search, the existing task is kept instead of duplicated. The rollover runs automatically whenever the task board loads; `db/migrations/004_task_rollover.sql` must be applied first. Reimports never reopen a task that closed as not done.
