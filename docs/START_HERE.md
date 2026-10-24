# Abdul: execute in this order

This package contains a substantial AI-generated implementation, not a verified deployed submission. Do not upload it unchanged and claim the whole application has passed review.

## 1. Open and install

Extract the source ZIP and open the ajaia-workspace directory in VS Code. Use Node 22. From that directory:

```bash
npm install
```

If install fails, capture the first substantive error. Do not rewrite the app before understanding that failure.

## 2. Run quality checks immediately

```bash
npm test
npm run build
```

Expected authored test inventory: 15 validation tests, 13 API tests, and one optional MongoDB integration test. The MongoDB test is skipped unless TEST_MONGODB_URI is configured. Only the 15 validation tests were actually run in preparation.

## 3. Configure persistence and start

Copy .env.example to .env. Set MONGODB_URI and a random JWT_SECRET of at least 32 characters; keep DEMO_MODE=true. Use local MongoDB, Docker compose, or Atlas as explained in README.md.

```bash
npm run dev
```

Open http://localhost:5173. Complete the release checklist in docs/RELEASE_CHECKLIST.md.

## 4. Deploy early

Push the source and generated lockfile to GitHub. Follow docs/DEPLOYMENT.md for Render + Atlas. Build command:

```bash
npm install --include=dev && npm run build
```

Start command:

```bash
npm start
```

Use one service, not separate frontend/backend deployments. Do not deploy SQLite or uploads to ephemeral local storage. The implementation already persists documents in MongoDB.

## 5. Review as three people

- Abdul: create, format, save, import, share, revoke.
- Maya: open Shared with me, edit, save, cannot manage sharing.
- Sam: must not see or open unshared documents.

Use two browser tabs to test a stale-save conflict. Verify refresh preserves rich formatting.

## 6. Record and submit

Use docs/DEMO_SCRIPT.md for a 3–5 minute recording. Fill the actual URLs and results in README.md, SUBMISSION.md, VIDEO_URL.txt, AI_WORKFLOW.md, and VERIFICATION.md. Put everything in one public-viewable Google Drive folder and test permissions in incognito.

## Timebox guidance

Treat the portal's remaining timer as authoritative. Suggested allocation from the moment you start locally:

- 0–25 minutes: install, tests, build, environment.
- 25–80 minutes: fix runtime defects and exercise required flows.
- 80–135 minutes: deploy and verify the public application.
- 135–180 minutes: sharing, stale-write, refresh, and mobile checks; fix only high-impact issues.
- Final 35–45 minutes: video, truthful documentation, Drive permissions, portal submission.

Adjust to actual remaining time. If behind, cut polish and stretch work, not deployment or the required video. Reserve time to submit before the timer ends.
