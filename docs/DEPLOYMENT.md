# Deployment: one Render service + MongoDB Atlas

## Before deployment

1. Run npm install, npm test, and npm run build locally.
2. Resolve failures before polishing or adding features.
3. Commit package-lock.json. Do not commit .env, node_modules, or database passwords.
4. Push source to a GitHub repository.
5. Use a separate demo MongoDB database; never point this public sandbox at production data.

## Atlas

1. Create or use a no-cost Atlas cluster suitable for the assessment.
2. Create a database user with read/write access limited to the application database.
3. Obtain the Node connection URI and include the database name, e.g. folio_demo.
4. Add your development IP for local testing.
5. After creating the Render service, find its outbound IP ranges/addresses in the service dashboard and allow those in Atlas Network Access. Do not leave an unrestricted network allowlist as an undocumented shortcut.
6. Special characters in credentials must be URL-encoded in the connection URI.

## Render service

Create a Node Web Service from the repository, with the repository root as root directory.

- Build: npm install --include=dev && npm run build
- Start: npm start
- Health check: /api/health
- Instance: choose a suitable free instance for the assessment.
- Node: 22
- NODE_ENV: production
- DEMO_MODE: true
- JWT_SECRET: a strong generated secret, at least 32 characters
- MONGODB_URI: your Atlas URI, stored only as a service environment secret

The --include=dev flag matters: the frontend build needs Vite and the React plugin even when NODE_ENV is production. Once package-lock.json is committed and verified, npm ci --include=dev can replace npm install --include=dev in the build command.

render.yaml includes this configuration for Blueprint deployment. MONGODB_URI remains a user-supplied secret. Atlas must allow the service to connect before its health check can pass.

## Verify the actual public product

1. Open /api/health and confirm {"status":"ok"}.
2. Open the application in an incognito browser without a logged-in developer account.
3. Create and format as Abdul; wait for All changes saved.
4. Refresh and verify content and formatting.
5. Import samples/team-kickoff.txt, then edit and save the result.
6. Share with Maya. Open a separate browser/incognito session as Maya and edit through Shared with me.
7. Confirm Sam cannot see the document. As owner, revoke Maya; verify she cannot reopen or save it.
8. Open one document in two tabs. Save a change in the first tab; edit the stale second tab. Confirm a conflict message appears and the winning content remains intact.
9. Test the public URL on a phone-sized viewport.
10. Run local npm run build and npm test again after any fixes.

## Persistence check

Redeploy/restart the web service, then reopen a non-seed document. It should remain because content lives in Atlas, not the application filesystem. The application does not save uploaded files locally.

## Expected hosting limitation

Free services may sleep when idle and take time to respond on first access. State this in the submission if observed. Verify current provider availability and quotas in your account; do not promise a specific cold-start duration. Visit the live product shortly before recording and submitting, but do not describe warming as an uptime guarantee.

## When setup fails

- Mongo connection timeout: check Atlas network allowlist, database user credentials, URI encoding, and service outbound network details.
- Missing environment errors: configure secrets and DEMO_MODE in the service, not only your local .env.
- Vite unavailable during build: include dev dependencies in the build command.
- Blank screen: inspect the browser console and network requests; run the production build locally.
- 401 after changing JWT_SECRET: switch accounts/sign in again to obtain a new token.

## Publishing materials

Create one Google Drive folder containing the source ZIP, README, architecture note, AI workflow note, SUBMISSION.md, VIDEO_URL.txt, and verification evidence. Set general access to Anyone with the link / Viewer, subject to your account policy. Test the folder, live URL, and video in an incognito window. Do not include secrets.
