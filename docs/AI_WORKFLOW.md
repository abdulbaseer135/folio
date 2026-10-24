# AI-native workflow note

## Disclosure

This implementation was prepared with AI assistance (Perplexity for initial architecture preparation, and Google Antigravity IDE for pre-submission engineering audit, live browser automation, Atlas deployment troubleshooting, and release verification). The candidate reviewed, executed, verified, and took responsibility for the code and deployment behavior.

## Where AI accelerated work

- Converted the assessment brief into a scoped asynchronous document lifecycle and requirement checklist.
- Generated a React/Tiptap UI, Express API, MongoDB repository, seeded demo identities, validation, and version-aware saves.
- Produced authorization, import, and conflict tests, as well as an opt-in integration test.
- Audited requirement compliance and verified that UTF-8 .txt import satisfies the product-relevant file upload requirement without needing extra formats (.md/.docx).
- Diagnosed Atlas TLS handshake / IP access list configuration on Render.
- Executed end-to-end automated browser verification and live API tests against the deployed application on Render.

## Decisions rather than blind acceptance

- Chose single-origin deployment (Express serving Vite static build) instead of separate services, eliminating CORS complexity.
- Confirmed that .txt import with in-memory validation satisfies the upload requirement; avoided brittle DOCX/PDF parsers.
- Chose explicit public demo identities instead of incomplete auth flows.
- Chose atomic version checks with HTTP 409 conflict responses rather than destructive last-write-wins.
- Deliberately deferred comments, real-time sync, and complex version trees to maintain architectural focus.

## Candidate completion log — actual verified observations

| Check | Actual result / evidence |
|---|---|
| npm install | Succeeded cleanly in workspace (`npm ci --include=dev`). |
| npm test | Passed: 28 passed, 0 failed, 1 skipped (default suite). |
| npm run build | Succeeded: Vite compiled client production bundle in 4.17s. |
| MongoDB integration test | Passed: 29 passed, 0 failed, 0 skipped total with `TEST_MONGODB_URI` pointing to dedicated test database. |
| Live API verification | Verified: All 12 automated API checks passed against https://folio-zq34.onrender.com/. |
| Live browser verification | Verified via automated browser subagent: Login as Abdul, document creation, rich formatting (bold, italic, underline, heading 1, heading 2, bulleted lists, and numbered lists), autosave, reopening, invite Maya, switch account, open from "Shared with me", edit as Maya, verify persistence, and check 390px mobile viewport. |
| Sharing, uninvited access, revocation | Verified: Sam Rivera receives HTTP 404; collaborator Maya receives HTTP 403 on share management. |
| Stale-write conflict | Verified: Version mismatch returns HTTP 409 and preserves existing server content. |
| Public deployed flow / mobile viewport | Verified: https://folio-zq34.onrender.com/ responsive and functional at 390px. |
