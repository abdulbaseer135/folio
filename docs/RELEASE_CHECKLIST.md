# Release gates — use the remaining assessment time deliberately

## Gate 1: runnable before attractive

- [ ] Install dependencies with Node 22.
- [ ] Run npm test; investigate failures.
- [ ] Run npm run build; fix compilation errors.
- [ ] Configure MongoDB and run the app locally.
- [ ] Commit package-lock.json and all source, never secrets.

## Gate 2: required product slice

- [ ] Create and rename a document.
- [ ] Bold, italic, underline, heading, bullet list, numbered list.
- [ ] Wait for saved status, refresh, and reopen with formatting intact.
- [ ] Import a valid UTF-8 .txt file; edit and save it.
- [ ] Unsupported file and empty import show actionable errors.
- [ ] Owned and Shared with me have distinct correct content.
- [ ] Share as Abdul with Maya; edit as Maya; see persisted update as Abdul.
- [ ] Sam cannot list/open/edit the private document.
- [ ] Maya cannot manage sharing.
- [ ] Owner revocation prevents subsequent reads/writes by Maya.
- [ ] Two-tab stale save shows conflict and does not overwrite winning content.
- [ ] Failed save retains local editor content and permits retry.

## Gate 3: live reviewer access

- [ ] Deployed health endpoint succeeds.
- [ ] Public application works in incognito.
- [ ] Non-seed document persists across a service restart/redeploy.
- [ ] No secret in source or browser bundle.
- [ ] Mobile-sized viewport remains usable.
- [ ] Document any observed free-host cold start.

## Gate 4: delivery

- [ ] Record a real 3–5 minute walkthrough.
- [ ] Put its public/unlisted link in VIDEO_URL.txt and the portal video field.
- [ ] Replace link placeholders in README.md and SUBMISSION.md.
- [ ] Fill AI_WORKFLOW.md with actual candidate verification and changes.
- [ ] Update VERIFICATION.md with commands and results actually obtained.
- [ ] Upload one Drive folder containing source and all requested notes.
- [ ] Test folder and video permissions in incognito.
- [ ] Paste concise final Markdown into the portal before the timer ends.

Do not claim these boxes are complete unless you have actually checked them. Start deployment while enough time remains to fix environment and network errors. Do not pursue stretch features before all core gates pass.
