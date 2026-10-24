# Architecture and product decisions

## Product slice

Folio supports the complete asynchronous document lifecycle: create → edit → format → save → reopen → import → share → edit as another identity. The goal is a coherent working slice rather than a Google Docs clone.

## System boundaries

```text
React + Tiptap
  └─ same-origin JSON / multipart requests
       └─ Express API
            ├─ signed demo identity verification
            ├─ document authorization and payload validation
            └─ MongoRepository
                 └─ MongoDB: users and documents
```

Vite proxies /api locally. In deployment, Express serves client/dist and /api from one domain. This removes cross-origin configuration and reduces the number of deployment units.

## Persistence model

User: id, name, email, initials, color.

Document: id, title, Tiptap JSON content, ownerId, sharedWith user IDs, numeric version, optional imported sourceName, timestamps.

Rich-text JSON preserves formatting and structure without storing executable HTML. The editor uses an explicit subset of Tiptap StarterKit. The API allowlists nodes, marks, heading levels, and supported attributes; it limits encoded size, node count, and nesting depth. This is not a general HTML sanitizer. Rendered content is owned by the configured editor schema; the application does not use dangerouslySetInnerHTML.

A document embeds its access list because the list is small and shares should change atomically in one record. ownerId and sharedWith are indexed. A large-scale product would need pagination and additional query/index review; this assessment does not pretend to solve that scale.

## Authorization

Demo login is explicit and public. The server signs an expiring HS256 identity token. The signature prevents accidental client-side identity-field changes from being trusted; it does not make publicly selectable accounts secure authentication.

Both owner and invited editors can read, rename, and edit. Only owners can grant/revoke access. Unknown and inaccessible documents return 404; collaborators receive 403 when attempting owner-only actions. Incoming ownership or access-list fields are never used in document update payloads.

Each content update matches the document ID, current user's access, and expected version in one atomic database filter. Membership is rechecked at write time rather than trusting an earlier read. Grant uses $addToSet, so repeated invitations are idempotent. Revoke uses $pull. No multi-document transaction is required.

## Save reliability

A 900 ms debounce batches typing. The browser serializes saves and snapshots each submitted revision. Edits arriving during an in-flight request remain dirty and schedule a subsequent save using the returned version.

The database updates only if the expected version matches, then increments version. A competing edit returns 409 rather than silently overwriting another user's work. Local content remains in the current editor instance. Recovery is intentionally simple: download local plain text, then explicitly reload. Formatting in a plain-text backup is lost, and there is no automatic merge or offline durability.

Sharing operations do not increment the content version; they update access membership atomically. The write predicate still checks the current access list. Open clients do not live-refresh the membership display and cannot have already-read information remotely erased.

## File import

A multipart .txt upload is buffered in memory, size limited, decoded strictly as UTF-8, checked for unsupported control characters, converted to structured paragraphs, and persisted as a document. No filesystem blob persistence is needed. Extension checks alone are not treated as enough: content decoding and validation are also required.

## Error and UX decisions

- Visible loading, empty, import failure, permission failure, unsaved, saving, saved, and conflict states.
- Owned and shared views with server-filtered accessible metadata.
- Keyboard formatting through Tiptap, explicit save shortcut, labeled toolbar controls.
- Modal focus management and Escape handling; responsive desktop/mobile layouts.
- Unsaved navigation warnings, with explicit limits for forced browser shutdown.
- API responses are non-cacheable and internal error details are not sent to clients.

These are implemented intentions, not a claim that accessibility or browser behavior has been independently certified. Browser checks remain part of release verification.

## Timebox prioritization

Must ship: document lifecycle, required formatting, one meaningful import, owner/editor sharing, persistence, automated tests, deployment, review documentation, video.

Cut deliberately: CRDT/websockets, comments, DOCX/PDF conversion, OAuth/password lifecycle, attachments, complex permissions, full version history, and deletion. Real-time collaboration would add failure modes that are disproportionate to the required scope. Version-aware asynchronous sharing is an honest smaller product.

## Verification layers

1. Dependency-free tests: content schema, formatting round trip, encoding-related conversion, limits, metadata validation.
2. API tests with a test repository: actual HTTP routes and middleware, not a database integration claim.
3. Opt-in MongoDB test: persistence, competing atomic saves, and revocation.
4. Production build and browser smoke checklist: required before publishing.

See VERIFICATION.md for what was actually executed versus merely authored.
