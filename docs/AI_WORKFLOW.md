# AI-native workflow note

## Disclosure

This implementation was prepared with substantial AI assistance from Perplexity. AI generated the initial application source, tests, deployment configuration, documentation, and review plan. The candidate must review, run, understand, and take responsibility for the final submitted code. This note must not imply that the candidate manually authored all generated code or completed checks that have not been run.

## Where AI accelerated work

- Converted the open-ended brief into a scoped document lifecycle and requirement checklist.
- Generated a React/Tiptap UI, Express API, MongoDB repository, seeded demo identities, validation, and version-aware saves.
- Produced authorization/import/conflict tests and an opt-in real-database test.
- Drafted architecture, deployment, reviewer instructions, and walkthrough structure.
- Consulted official Tiptap, Render, MongoDB, and Mongoose documentation for editor capabilities, persistence boundaries, and atomic update behavior.

## Decisions rather than blind acceptance

- Chose a single-origin deployment instead of a separate frontend/backend deployment to reduce configuration work.
- Chose plain-text import rather than a fragile DOCX conversion path.
- Chose explicit public demo identities instead of spending the timebox on password and OAuth flows.
- Chose stale-version rejection instead of last-write-wins or pretending to offer live collaboration.
- Deliberately deferred comments, real-time synchronization, and version-history UI.

## Generated output changed during review

The AI preparation process caught and corrected a malformed npm script JSON value, over-escaped regular expressions, and a production build configuration that needed dev dependencies included for Vite. A no-store API cache policy was added. These were real preparation-stage corrections; they are not a claim that all runtime defects have been found.

## Verification actually completed during preparation

- Parsed package manifests as JSON.
- Ran Node syntax checks on backend source files.
- Executed 15 dependency-free validation tests: all passed.
- Attempted an offline npm installation; required packages were not cached. No successful full dependency installation or frontend build occurred in that environment.

## Candidate completion log — fill with actual observations before submission

| Check | Actual result / evidence |
|---|---|
| npm install | NOT YET RECORDED |
| npm test | NOT YET RECORDED |
| npm run build | NOT YET RECORDED |
| MongoDB integration test | NOT YET RECORDED; otherwise state skipped |
| Local create/edit/refresh/import | NOT YET RECORDED |
| Sharing, uninvited access, revocation | NOT YET RECORDED |
| Two-tab stale-write conflict | NOT YET RECORDED |
| Public deployed flow / mobile viewport | NOT YET RECORDED |
| Candidate changes to generated code | RECORD ONLY CHANGES ACTUALLY MADE |

If another AI coding tool is used locally, add its name, the task it performed, what was rejected or changed, and how the resulting code was verified. Do not list tools that were not actually used.
