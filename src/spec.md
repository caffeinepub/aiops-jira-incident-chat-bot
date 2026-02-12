# Specification

## Summary
**Goal:** Deliver a final, single-file, copy-paste-ready Google Chat Jira incident bot implementation (Option B) contained entirely in `frontend/code.gs`.

**Planned changes:**
- Consolidate and finalize the bot logic into a single Apps Script file (`frontend/code.gs`) without introducing any additional services or databases.
- Ensure all user-facing bot text is in English.
- Preserve the existing command set (hi/help, projects, issues/incidents, create incident, Q&A fallback) without adding new commands.

**User-visible outcome:** A ready-to-deploy Google Chat bot script that supports the existing Jira incident workflow and responses, with all interactions presented in English.
