# Folio — Ajaia Full Stack Product Engineer assessment

Candidate: Abdul Baseer

## Links — replace before submitting

- Google Drive folder: REPLACE_WITH_PUBLIC_FOLDER_LINK
- Live product: https://folio-zq34.onrender.com/
- Walkthrough video: REPLACE_WITH_PUBLIC_3_TO_5_MINUTE_VIDEO_URL

## Review in two minutes

1. Open the live product and select Abdul Baseer.
2. Create a document, rename it, format text, and wait for All changes saved.
3. Refresh to verify persistence, or import the included sample .txt.
4. Share with maya@demo.local, switch to Maya, and open Shared with me.
5. Edit and save as Maya; switch back to Abdul and reopen.

Demo identities, no passwords:

- Abdul Baseer — abdul@demo.local
- Maya Chen — maya@demo.local
- Sam Rivera — sam@demo.local

This is an intentionally public sandbox with selectable demo identities. Do not upload sensitive information. Sharing is asynchronous; refresh/reopen to see another user's saved updates.

## Included materials

| Material | Location |
|---|---|
| Full source code | client/, server/, root configuration files |
| Local setup, run, and test instructions | README.md |
| Architecture and tradeoffs | docs/ARCHITECTURE.md |
| AI tools, changes, and verification disclosure | docs/AI_WORKFLOW.md |
| Verification status and release checks | docs/VERIFICATION.md, docs/RELEASE_CHECKLIST.md |
| Deployment configuration and instructions | render.yaml, docs/DEPLOYMENT.md |
| Walkthrough plan | docs/DEMO_SCRIPT.md |
| Walkthrough link | VIDEO_URL.txt — replace placeholder |
| Example import | samples/team-kickoff.txt |
| Automated tests | server/test/ |

Screenshots are not included in the preparation package. Add real screenshots to the final Drive folder if they help reviewers or extra setup steps remain.

## Implemented scope — verify against your actual deployment

- Document creation, renaming, rich-text editing, autosave, explicit save, and reopening.
- Bold, italic, underline, headings, ordered and unordered lists.
- UTF-8 .txt import into a new editable document with validation and limits.
- Owner/editor sharing by seeded email; owner-only invite and revoke.
- Owned/shared navigation and server-enforced document access.
- MongoDB persistence with structured content and sharing metadata.
- Version-aware writes, visible stale-write conflicts, and local plain-text backup.
- Responsive UI, empty/loading/error states, meaningful automated tests, and single-service deployment configuration.

## Actual verification

Automated verification executed in Node.js 22/24 environment:
- Default test suite: **28 passed, 0 failed, 1 skipped** (`server/test/api.test.js` and `server/test/validation.test.js`).
- With MongoDB integration enabled (`TEST_MONGODB_URI`): **29 passed, 0 failed, 0 skipped total** (`server/test/mongo.integration.test.js` exercised isolated Atlas/local database atomic writes and revocation).
- Production build: `npm run build` compiled client bundle with zero errors.
- Live deployment verification on Render (https://folio-zq34.onrender.com/): specifically tested and confirmed for demo user login, document creation, renaming, rich formatting (bold, italic, underline, heading 1, heading 2, bulleted lists, and numbered lists), autosave, reopening persistence, UTF-8 .txt import (<=256 KB), owner-collaborator sharing, access isolation (HTTP 404 for unshared third users, HTTP 403 on collaborator share management), stale-save conflict rejection (HTTP 409), and 390px mobile viewport layout.
- Remaining deliverables: walkthrough video recording and Google Drive folder assembly.

## Intentionally incomplete

No simultaneous live co-editing, production identity/security system, DOCX/Markdown import, offline rich-text recovery, comments, or full version-history UI. Plain-text export does not preserve formatting. Open clients do not automatically receive edits or membership changes. Dashboard metadata is not paginated.

## Next 2–4 hours

1. Add browser automation for multi-user editing, revoke, and conflict recovery.
2. Persist recoverable local rich-text drafts and improve conflict resolution.
3. Add proper authentication and pagination before production use.

## Local commands

See README.md for environment prerequisites and MongoDB setup.

```bash
npm install
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET, DEMO_MODE=true in the root .env.
npm test
npm run build
npm run dev
```

## Pre-submit honesty gate

Replace every REPLACE_WITH_* marker, record a real video, verify the public product, and update the AI/verification notes with the checks actually performed. The preparation package by itself does not satisfy the live-deployment or video requirement.
