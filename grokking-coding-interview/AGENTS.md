# Grokking Coding Interview Patterns — Authoring Rules (`AGENTS.md`)

## 1. Purpose & Philosophy
- **Primary Goal:** Interview-first coding pattern cards modeled after *Grokking the Coding Interview Patterns* (Educative), optimized for **pattern recognition, Brute Force → Optimal explanation, and bug-free Python 3.10+ live coding**.

---

## 2. Standard Note Structure (7 Clean Sections)
Every pattern note in `grokking-coding-interview/` must follow this structure:

1. `## 1. Trigger Signals & Brute Force -> Optimal` — 3–4 problem clues + what brute force does vs. how the pattern eliminates redundant work.
2. `## 2. Mental Model & Dry-Run Trace` — Compact Mermaid diagram + 3-step dry-run trace on a tiny input (especially for pointer/window/binary-search/DP patterns).
3. `## 3. Reusable Python Template` — Clean Python 3.10+ template with docstring and invariant comments.
4. `## 4. Must-Know Classic Problems` — 2–3 classic problems, each with Time/Space, docstring, key invariant comments, and a 2-line `Example` input/output.
5. `## 5. Edge Cases & Pattern vs. Pattern` — Off-by-one traps + compact disambiguation table against look-alike patterns.
6. `## 6. Rapid Follow-Up Q&As` — 2–3 complexity/variation questions interviewers ask.

---

## 3. Quality Rules
- **Python 3.10+ Idioms:** Type hints (`list[int]`, `int | None`), `collections.deque`, `heapq` (`-val` for max-heap).
- **Viewer Compatibility:** Clean numbered `##` headings, standard GFM tables, `mermaid` blocks, and relative `.md` links.
