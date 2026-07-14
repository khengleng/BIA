# Module: collaboration — Dev 4

Bounded context: documents/dataroom and user-to-user collaboration.

## Owns (migrate from `src/routes/`)
- `document.ts`, `dataroom.ts` (S3/GCS-backed uploads, presigned URLs)
- `community.ts`, `messages.ts`, `calendar.ts`, `notifications.ts`

## Watch-outs
- `notifications.ts` is mounted at BOTH `/api/notifications` and `/api/push` — preserve both.
- `reports.ts` is mounted at `/api/reports`+`/api/report` but belongs to `platform` (Dev 5), not here.

## Definition of done
- Files under `modules/collaboration/`, `@/shared/*` imports, `index.ts` exports mounted router with both notification aliases, build + tests green.
