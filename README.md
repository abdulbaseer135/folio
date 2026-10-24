# Folio — a lightweight shared document workspace

A deliberately scoped full-stack assessment implementation for Ajaia.

Create, rename, format, import, persist, and share documents. The experience is asynchronous shared editing, not simultaneous Google Docs-style co-editing.

## Reviewer quick start

- Live application: REPLACE_WITH_VERIFIED_LIVE_URL
- Walkthrough: REPLACE_WITH_PUBLIC_VIDEO_URL
- Demo identities: Abdul Baseer, Maya Chen, Sam Rivera.
- No passwords: select an identity on the landing page.
- Suggested flow: Abdul creates a document → shares with maya@demo.local → switch to Maya → Shared with me → edit → save → switch back and reopen as Abdul.
- This is an openly accessible sandbox. All identities can be selected by any visitor. Do not store sensitive data.

## Verification status

All 28 automated HTTP API, authorization, and structural validation tests have been executed and passed. The frontend production build (`vite build`) has been compiled and verified with zero errors. When `TEST_MONGODB_URI` was provided, the opt-in MongoDB persistence, atomic update, and revocation integration test also executed and passed (29 of 29 passed). Public cloud deployment, the live reviewer URL, walkthrough video recording, and Google Drive deliverables remain pending manual release. Links in the section above are placeholders until deployment is completed.

## Stack and design

- React + Vite frontend, Tiptap v3 rich-text editor, Lucide icons.
- Node.js 22 + Express 5 API.
- MongoDB + Mongoose persistence.
- Signed, expiring demo identity tokens.
- One production service serves the frontend and API; Vite proxies API requests during development.
- No paid editor features, external fonts, or paid reviewer dependencies.

## Prerequisites

- Node.js 22 and npm.
- A running MongoDB instance, either local or Atlas.
- Optional Docker for the included local MongoDB compose file.

## Local setup

Run from the repository root.

```bash
npm install
cp .env.example .env
```

PowerShell equivalent for the copy command:

```powershell
Copy-Item .env.example .env
```

Set MONGODB_URI and JWT_SECRET in the root .env. DEMO_MODE must be true for seeded login.

Generate a random secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Option A: start the included local MongoDB service:

```bash
docker compose up -d
```

The example MongoDB URI then works unchanged. The database is persisted in a named Docker volume; the port is bound to localhost only. This local container is not configured as an authenticated production database.

Option B: set MONGODB_URI to your Atlas connection string, including an application database name. Allow your current development IP in Atlas Network Access. Do not commit the URI or password.

Start both development processes:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/health
- User records and a welcome document are seeded idempotently at server startup. Existing document content is not reset.
- Commit the generated package-lock.json after the first successful install. Use npm ci --include=dev for subsequent reproducible installs.

## Tests and build

```bash
npm test
npm run build
```

Or run both:

```bash
npm run check
```

Validation-only tests require no installed npm dependencies:

```bash
node --test server/test/validation.test.js
```

API tests use the real Express application with an injected in-memory repository. They exercise authorization, sharing, revocation, update versioning, validation, and imports. They do not establish MongoDB behavior.

To also exercise actual MongoDB persistence and atomic update behavior, set TEST_MONGODB_URI to a MongoDB test connection and run npm test. The integration test creates and drops a randomly named folio_test_* database, never the URI's default database. The test user needs permission to create and drop that test database. Without TEST_MONGODB_URI, that test is explicitly skipped.

Run the production build locally:

```bash
npm run build
npm start
```

Open http://localhost:3001. Development mode must be stopped first if it already occupies port 3001. In production, set NODE_ENV=production in your service configuration.

## Supported file workflow

- Import exactly one UTF-8 .txt file as a new editable document.
- Maximum uploaded file size: 256 KB. The resulting structured document also has a 256 KB size limit and structural complexity limits, so very line-heavy imports may be rejected below the file-size ceiling.
- Empty files, invalid UTF-8, binary control characters, unsupported extensions, and oversized files return clear errors.
- Line breaks become paragraphs; HTML is treated as literal text.
- Original filename is retained as document metadata; the original file is not stored on disk.
- .md, .docx, attachments, images, and embedded HTML are intentionally not supported.
- Download text exports a plain-text copy. It does not preserve rich formatting.

## Access model

| Identity | Own documents | Invited documents | Manage sharing |
|---|---|---|---|
| Owner | Read, rename, edit | N/A | Grant and revoke |
| Invited editor | N/A | Read, rename, edit | No |
| Uninvited user | No access | No access | No |

Unauthorized document requests return 404. An invited editor attempting to manage sharing receives 403. Access is enforced by the server, not merely by UI filters. Demo account switching remains intentional public impersonation: this is not production authentication.

## Save and conflict behavior

- Changes autosave after approximately 900 ms of inactivity.
- Explicit Save now and Ctrl/Cmd+S are available.
- Saves are serialized within a document view; edits made during an in-flight save are queued for the next save.
- Every content/title save requires the last known version. MongoDB matches permissions and version in the same write filter, then increments the version.
- A stale save returns 409. The UI keeps the local draft in memory and offers a plain-text backup and reload action; it does not silently overwrite or auto-merge.
- Navigating away with unsaved changes asks for confirmation. Browser refresh/close has a beforeunload guard. This is not offline persistence: discarding or forcibly closing can lose unsaved work.
- Other users' updates are visible when a document is reopened/reloaded; there is no websocket sync or polling.
- Revocation blocks subsequent server reads/writes; it does not erase content already loaded into another browser.

## Deployment

Follow docs/DEPLOYMENT.md. Render configuration is included in render.yaml. Production documents belong in MongoDB, never the ephemeral application filesystem.

## Repository map

```text
client/src/           React UI, editor, API client, styles
server/src/           Express routes, validation, MongoDB repository, demo seed
server/test/          Validation, HTTP API, and opt-in MongoDB tests
docs/                 Architecture, AI workflow, verification, deployment, demo script
samples/              Example UTF-8 import file
README.md             Setup and reviewer guide
SUBMISSION.md         Submission inventory and honest readiness checklist
VIDEO_URL.txt         Replace with recorded public/unlisted video link
render.yaml           Single-service deployment configuration
compose.yaml          Optional local MongoDB
```

## Intentional limitations

No real-time merge/CRDT, production auth, comments, document deletion, DOCX/PDF conversion, offline draft storage, or version-history UI. Shared editors have one permission level. The dashboard currently loads all accessible document metadata without pagination; it is intended for the assessment scale. Public demo data is not isolated per reviewer. No reset button deletes other reviewers' work.

## Another 2–4 hours

1. Add Playwright end-to-end checks for two identities and two-tab conflicts.
2. Add recoverable local rich-text drafts and a safer conflict comparison/merge screen.
3. Add pagination and real authentication before using this beyond a public demo.
4. Add viewer permissions or version history only after the core remains reliable.
