# Grokking Coding Interview Patterns — Authoring Rules (`AGENTS.md`)

## 1. Purpose & Philosophy
- **Primary Goal:** Interview-first coding pattern cards modeled after *Grokking the Coding Interview Patterns* (Educative), optimized for **fast pattern recognition** and **clean Python 3.10+ live coding**.
- **Focus:** Memorize **trigger signals + reusable templates**, not 500 isolated LeetCode solutions.

---

## 2. Standard Note Structure (6 Sections)
Every pattern note in `grokking-coding-interview/` must follow this structure:

1. **Frontmatter (YAML):**
   - Keys: `title`, `category: "Coding Interview Patterns"`, `type`, `permalink`, `tags`, `summary`.
2. **1. Trigger Signals (When to Use This Pattern):**
   - 3–5 bullet clues that appear in problem statements (e.g., *"sorted array"*, *"contiguous subarray"*, *"cycle detection"*), plus expected Time/Space target.
3. **2. Mental Model (Mermaid Diagram):**
   - **One** clean Mermaid `flowchart` showing pointer movement, window expansion/shrinkage, or state flow.
4. **3. Reusable Python Template:**
   - Clean, copy-ready Python 3.10+ template using standard library tools (`collections.deque`, `heapq`, `bisect`, `collections.Counter`).
5. **4. Must-Know Classic Problems (2–3 Problems):**
   - Problem statement (1–2 lines), key insight, clean Python solution, and Time/Space complexity.
6. **5. Edge Cases & Common Traps:**
   - Off-by-one bugs, empty/single-element inputs, negative numbers, or Python-specific gotchas (e.g., `heapq` is min-heap only).
7. **6. Rapid Follow-Up Questions:**
   - 2–3 complexity or variation questions interviewers ask right after you solve the problem.

---

## 3. Quality Rules
- **Python 3.10+ Idioms:** Use type hints (`list[int]`, `int | None`), `collections.deque` for queues, and `heapq` (with `-val` for max-heaps).
- **Keep Notes Scannable:** Target ~90–140 lines per pattern note.
- **Viewer Compatibility:** Standard GFM tables, `mermaid` blocks, and relative `.md` links.
