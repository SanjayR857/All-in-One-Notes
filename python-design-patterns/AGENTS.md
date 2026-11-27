# Python Design Patterns — Authoring Rules (`AGENTS.md`)

## 1. Primary Source & Philosophy
- **Primary Reference:** *Mastering Python Design Patterns* by Sakis Kasampalis (`../Mastering Python Design Patterns - Start Learning Python -- Kasampalis Sakis -- ( WeLib.gl ).pdf`).
- **Core Goal:** Clear, scannable, interview-ready Python 3.10+ notes (~110–150 lines) with **detailed docstrings, inline comments, and sample output**.

---

## 2. Standard Note Order (7 Clean Sections)
Every pattern note in `python-design-patterns/` must follow this exact numbered heading structure (for a clean right-hand TOC in the HTML viewer):

1. `## 1. Clear Definition` — Plain-English definition, 30-second spoken interview summary, and key participants.
2. `## 2. Real-Time & Real-World Examples` — Real-life analogy (from the book) + real-time Python backend/system example.
3. `## 3. Mental Model` — One compact Mermaid diagram (`flowchart` or `classDiagram`).
4. `## 4. Python Implementation` — **One** primary, runnable Python 3.10+ example with full docstrings, inline comments explaining *why*, and a short `Sample Output` block.
5. `## 5. Use Cases & When to Skip` — Concrete **When to Use** vs. **When to Skip** (Pythonic alternatives).
6. `## 6. Don't Confuse With` — Compact 2-row comparison table against the closest look-alike pattern(s).
7. `## 7. Rapid Interview Q&As` — 2–3 high-frequency follow-up questions with concise answers.

---

## 3. Quality Rules
- **No Java / JVM / Spring Leftovers:** Pure Python 3.10+ (`Protocol`, `ABC`, `@dataclass`, `X | Y`).
- **Viewer Compatibility:** Clean headings (no cluttered emojis in `##` TOC headings), standard GFM tables, `mermaid` blocks, and relative `.md` links.
