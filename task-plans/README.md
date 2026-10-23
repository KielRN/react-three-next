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

On `/admin/tasks`, select week 43 for October 19–23 and week 44 for October 26. Check-offs are available Monday–Friday in America/Chicago, on or after the due date. A second open account sees updates on focus or the next minute's refresh.
