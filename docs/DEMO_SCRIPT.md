# 3–5 minute walkthrough plan

Record the actual working deployment, not slides that substitute for the product. This is a suggested talk track; change statements to match what you personally verified.

## 0:00–0:25 — framing

“Folio is a deliberately scoped asynchronous document workspace. I prioritized a complete editing, import, persistence, and sharing flow over a broad but unreliable Google Docs clone. This is a public sandbox with explicitly simulated identities.”

Show the public live URL and demo account selector. Choose Abdul.

## 0:25–1:20 — document lifecycle

Create a document. Rename it. Enter a heading, bold/italic/underlined text, and a list. Point out autosave and wait for the saved indicator. Return to the dashboard, reopen, and refresh to demonstrate persisted formatting.

## 1:20–1:50 — import

Import samples/team-kickoff.txt. Explain UTF-8 .txt only and the 256 KB upload limit. Edit the imported result and wait for save. If useful, show the unsupported-type error briefly rather than spending time on it.

## 1:50–2:50 — sharing and authorization

Share the document with maya@demo.local. Switch to Maya and open Shared with me. Edit and save. Switch back to Abdul, reopen, and show the update. Briefly show that only the owner can manage sharing. If time permits, revoke Maya and show loss of access on a subsequent request.

## 2:50–3:25 — engineering decisions

“One service serves React and the API. MongoDB stores structured editor JSON and access lists. Every content save includes a version, and the database checks that version and current access atomically. Stale edits produce a conflict rather than overwriting silently. This is shared editing, not websocket co-editing.”

Show a prepared two-tab conflict only if it works reliably and time permits.

## 3:25–4:15 — quality, AI, and cuts

Briefly show test output and the architecture/AI notes. State which suites actually ran; do not call skipped tests passing.

“AI generated substantial implementation scaffolding and tests. I used it to speed up decomposition and routine code, while reviewing the scope, access rules, save behavior, and deployment. [Explain one actual change you made and the checks you personally ran.] I intentionally deferred real-time merging, production auth, and DOCX import. With more time, I would add browser-level multi-user tests and recoverable rich-text drafts first.”

End with the working product. Keep the recording within 3–5 minutes. Set the video visibility so reviewers can open it without requesting access.
