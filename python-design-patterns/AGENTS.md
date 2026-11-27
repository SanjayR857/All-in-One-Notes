# Python Design Patterns — Authoring Rules (`AGENTS.md`)

## 1. Primary Source & Philosophy
- **Primary Reference:** *Mastering Python Design Patterns* by Sakis Kasampalis (`../Mastering Python Design Patterns - Start Learning Python -- Kasampalis Sakis -- ( WeLib.gl ).pdf`).
- **Core Goal:** Combine the book's **Python-first idioms, real-life analogies, and software examples** with **concise, interview-ready structure** (80–120 lines per note, zero textbook bloat).
- **Python Version:** Modernize the book's Python 3 code to clean **Python 3.10+** (`typing.Protocol`, `abc.ABC`, `@dataclass`, union types `X | Y`, `Enum`).

---

## 2. Standard Note Structure (6 Sections)
Every pattern note in `python-design-patterns/` must follow this exact structure:

1. **Frontmatter (YAML):**
   - Required keys: `title`, `category: "Python Design Patterns"`, `type`, `permalink`, `tags`, `summary`.
2. **1. 30-Second Interview Answer:**
   - 2–3 sentences you can say out loud: what the pattern does, what problem it solves, and its key trade-off.
3. **2. Real-Life & Software Examples (from the Book):**
   - **Real-life analogy** used in *Mastering Python Design Patterns*.
   - **Python software/ecosystem example** (e.g., Django, Flask, `functools`, `pyparsing`, `itertools`, `abc`).
4. **3. Mental Model (Mermaid Diagram):**
   - **One** clean Mermaid `classDiagram` or `flowchart` showing the pattern's structure.
5. **4. Python Implementation:**
   - One clean, runnable Python 3.10+ implementation inspired by the book's chapter example (with type hints and brief inline comments).
6. **5. Use Cases & When to Skip (Pythonic Alternatives):**
   - Bullet list of when to apply the pattern + when Python's built-in features (first-class functions, `@decorator`, generators, `@dataclass`, `sys.modules`) make the class-heavy pattern unnecessary.
7. **6. Rapid Follow-Up Q&As:**
   - 2–3 high-probability interview questions and concise answers.

---

## 3. Strict Quality Rules
- **No Java / JVM / Spring Leftovers:** Never mention `JVM`, `Bill Pugh`, `Joshua Bloch`, `Spring AOP`, `javax.*`, `Calendar.getInstance`, `StringBuilder`, `instanceof`, or `OutOfMemoryError`.
- **Keep Notes Scannable:** Target ~75–120 lines per pattern note. Prefer tables and short bullets over long paragraphs.
- **Viewer Compatibility:**
  - Use standard GFM tables and fenced `python` / `mermaid` code blocks.
  - Use relative `.md` links (`../structural/adapter.md`, `index.md`) so the GitHub Markdown Viewer navigates inline.
