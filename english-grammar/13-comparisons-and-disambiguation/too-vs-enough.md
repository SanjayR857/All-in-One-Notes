---
title: "Too vs. Enough: Disambiguation Matrix"
category: "English Grammar"
difficulty: "A2–B1 (Scalar Thresholds, Excess & Positional Laws)"
reference: "Murphy (Unit 103); Swan (§15.6)"
permalink: /english-grammar/13-comparisons-and-disambiguation/too-vs-enough/
tags: [grammar, comparisons, disambiguation, too, enough, intensifiers, thresholds, word-order]
summary: "Comprehensive side-by-side comparison between Too and Enough: prohibitive excess vs. sufficiency thresholds, strict positional word-order laws (too fast vs. fast enough vs. enough RAM), and infinitival complementation."
---

# Too vs. Enough: Disambiguation Matrix ⚖️🎚️

> **Level:** CEFR A2–B1 (Scalar Thresholds, Excess & Positional Laws)  
> **Primary References:** Raymond Murphy (*English Grammar in Use*, Unit 103); Michael Swan (*Practical English Usage*, §15.6)  
> **Core Conflict:** **`Too`** and **`Enough`** evaluate whether an attribute or quantity meets an operational threshold. **`Too`** signals **prohibitive excess**—more than is acceptable, resulting in an undesirable or prohibitive consequence. **`Enough`** signals **sufficiency**—meeting the minimum threshold required to perform an action. Crucially, they follow completely different **positional word-order laws**.

---

## 1. The Threshold & Positional Architecture

```mermaid
graph TD
    ThresholdChoice["Choosing Between TOO and ENOUGH"]
    
    ThresholdChoice --> MeaningCheck{"Does the statement indicate excessive negativity or sufficiency?"}
    
    MeaningCheck -->|Prohibitive Excess (More than allowed/tolerable)| UseToo["<b>USE TOO (Prohibitive Excess)</b><br/>• Position: <b>BEFORE</b> Adjective or Adverb<br/>• <code>too + Adjective/Adverb + to-infinitive</code><br/>• <i>'The latency is <b>too high to tolerate</b>.'</i><br/>(Meaning: We cannot tolerate it!)"]
    
    MeaningCheck -->|Sufficient Threshold (Meets the requirement)| CheckTarget{"What are you modifying with ENOUGH?"}
    
    CheckTarget -->|Adjective or Adverb| EnoughAfter["<b>PLACE ENOUGH AFTER ADJECTIVE/ADVERB</b><br/>• <code>Adjective/Adverb + ENOUGH</code><br/>• <i>'The cache is <b>fast enough to handle</b> load.'</i><br/>• ❌ <b>NEVER:</b> 'enough fast'"]
    
    CheckTarget -->|Noun / Quantity| EnoughBefore["<b>PLACE ENOUGH BEFORE NOUN</b><br/>• <code>ENOUGH + Noun Phrase</code><br/>• <i>'We have <b>enough memory to execute</b>.'</i>"]
```

---

## 2. Side-by-Side Structural Contrast Matrix

| Dimension | `Too` (`too + Adj / Adv`) | `Enough` (`Adj + enough` / `enough + Noun`) |
| :--- | :--- | :--- |
| **Operational Meaning**| **Excessive / Prohibitive** (Causes failure) | **Sufficient / Adequate** (Enables success) |
| **Connotation** | Inherently **negative / obstructive** | Generally **positive / capable** |
| **Position with Adjectives**| **BEFORE** the adjective (*too slow*) | **AFTER** the adjective (*fast enough*) |
| **Position with Adverbs** | **BEFORE** the adverb (*too slowly*) | **AFTER** the adverb (*quickly enough*) |
| **Position with Nouns** | Must use *too much / too many* (*too much RAM*) | **BEFORE** the noun (*enough RAM*) |
| **With `to-infinitive`** | *too [adj] to [verb]* (*too complex to maintain*) | *[adj] enough to [verb]* (*modular enough to maintain*) |

---

## 3. High-Frequency Technical Computing Contrasts

Notice how the two structures contrast operational capabilities:

### Contrast 1: System Threshold Evaluation
- **With `Too` (Failure to meet constraint):**  
  *The database query execution time was **too slow to satisfy** our 50ms SLA.*  
  $\rightarrow$ The execution time exceeded our limit, causing SLA violation.
- **With `Enough` (Successfully meeting constraint):**  
  *The database query execution time was **fast enough to satisfy** our 50ms SLA.*  
  $\rightarrow$ The execution time met the required benchmark.

### Contrast 2: The Positional Word-Order Trap
A pervasive error among engineering teams is placing *enough* before an adjective:
- ❌ *The staging environment is not enough stable.*
- ✅ *The staging environment is not **stable enough**.*
- ❌ *The worker process is not enough fast to consume the queue.*
- ✅ *The worker process is not **fast enough** to consume the queue.*

### Contrast 3: The Resumptive Pronoun Bug
When using `too [adj] to [do]`, do **not** repeat the object pronoun at the end of the infinitive clause:
- ❌ *The legacy monolith is too complex to refactor it.*
- ✅ *The legacy monolith is **too complex to refactor**.* (The subject *monolith* is already the target).

---

## 4. Practical Dual-Domain Examples

### Everyday Conversation

1. *Too:* *This coffee is **too hot to drink**.* (Cannot drink it)
2. *Enough:* *Is the coffee **hot enough for you**?* (Sufficient warmth)
3. *Word Order:* *He didn't run **fast enough** to catch the train.* (After adverb)
4. *Noun:* *Do we have **enough time** to eat lunch before the movie?* (Before noun)
5. *Too:* *The box is **too heavy for me to carry**.* (Prohibitive weight)
6. *Enough:* *She is **old enough to drive**.* (After adjective)
7. *Too:* *He speaks **too fast for us to understand**.* (Prohibitive speed)
8. *Noun:* *There weren't **enough chairs** in the conference room.* (Before plural noun)

### Software Engineering & Technical Documentation

9. *Too:* *The network packet size was **too large to fit** inside the standard MTU.* (Packet was dropped)
10. *Enough:* *The ingress buffer is **large enough to accommodate** temporary traffic bursts.* (Meets threshold)
11. *Word Order:* *The background daemon does not poll **frequently enough** to catch ephemeral errors.* (After adverb)
12. *Noun:* *The server does not have **enough compute capacity** to train the large language model.* (Before noun)
13. *Too:* *The cryptographic algorithm is **too computationally intensive to run** on embedded IoT microcontrollers.*
14. *Enough:* *Our distributed consensus protocol is **resilient enough to tolerate** two node failures.* (After adjective)
15. *Too:* *The connection timeout was **too short for the secondary replica to sync**.*
16. *Noun:* *Ensure you provision **enough disk space** before running the database vacuum job.*
17. *Too:* *The race condition was **too elusive to reproduce** in a localized development environment.*
18. *Enough:* *The API response latency was **low enough to enable** real-time algorithmic trading.*

---

## 5. Common Antipatterns & Diagnostic Table

| Incorrect Antipattern | Corrected Grammar | Rule & Explanation |
| :--- | :--- | :--- |
| ❌ *The microservice is enough fast.* | ✅ *The microservice is **fast enough**.* | *Enough* must sit AFTER adjectives and adverbs. |
| ❌ *The database has memory enough.* | ✅ *The database has **enough memory**.* | *Enough* must sit BEFORE nouns. |
| ❌ *The query is too complex to explain it.* | ✅ *The query is **too complex to explain**.* | Resumptive pronoun bug: do not repeat *it* at the end of the infinitive clause. |
| ❌ *The code is too good! I love it.* | ✅ *The code is **extremely / very good**! I love it.* | *Too* carries a negative connotation of prohibitive excess; use *very/extremely*. |
| ❌ *We don't have too time.* | ✅ *We don't have **enough time**.* / *...have **too little time**.* | *Too* cannot modify a noun directly without *much/many/little*. |
| ❌ *The pod is too slow for run.* | ✅ *The pod is **too slow to run**.* | The formula is *too + adjective + to-infinitive*, not *for + bare verb*. |

---

## 6. Self-Assessment Exercises

### Exercise 1: Too vs. Enough Selection & Placement
Insert **too** or **enough** in the correct position relative to the word in parentheses:

1. The server latency is ________ (high) to support multiplayer gaming. (Prohibitive excess)
2. Is the staging cluster ________ (stable) to run automated end-to-end smoke tests? (Sufficiency)
3. The virtual machine does not have ________ (RAM) to boot the database container. (Quantity)
4. The worker daemon did not react ________ (quickly) to prevent the buffer overflow. (Adverb sufficiency)
5. The cryptographic key length was ________ (short) to withstand brute-force attacks. (Inadequate security)

### Exercise 2: Contextual Bug Diagnostics
Correct the grammatical error in each sentence:

6. The new cloud cluster is enough reliable to host mission-critical production services.
7. The architectural decision record is too long to read it before today's standup.
8. We did not provision bandwidth enough to handle the sudden DDoS attack.
9. Your pull request is too well-written; congratulations! (Intended as a sincere compliment).
10. The microservice was too slow for process the incoming payment webhook.

<details>
<summary>View Complete Answer Key & Diagnostic Explanations</summary>

1. **too high** (*too* sits before the adjective to indicate prohibitive excess).
2. **stable enough** (*enough* sits after the adjective to indicate sufficiency).
3. **enough RAM** (*enough* sits before the noun).
4. **quickly enough** (*enough* sits after the adverb).
5. **too short** (*too* indicates dangerous defect).
6. The new cloud cluster is **reliable enough** to host... (*enough* sits after adjective).
7. The architectural decision record is **too long to read** before today's standup. (Remove resumptive pronoun *it*).
8. We did not provision **enough bandwidth** to handle... (*enough* sits before noun).
9. Your pull request is **extremely / exceptionally well-written**; congratulations! (Replace negative *too* with positive intensifier).
10. The microservice was **too slow to process** the incoming payment webhook. (*to-infinitive*, not *for + verb*).

</details>

---

## 7. Revision Flashcards

```
Q: What is the semantic difference between "too" and "enough"?
A: "Too" indicates prohibitive excess with a negative consequence ("too slow to use" = we cannot use it). "Enough" indicates sufficient threshold capability ("fast enough to use" = we can use it).

Q: Where does "enough" sit when modifying an adjective versus when modifying a noun?
A: "Enough" sits AFTER adjectives/adverbs ("fast enough", "reliably enough"), but BEFORE nouns ("enough memory", "enough servers").

Q: Why is "The code is too complex to refactor it" ungrammatical?
A: It contains a "resumptive pronoun" bug. The subject ("The code") is already the object of the infinitive; repeating "it" is redundant and ungrammatical ("too complex to refactor").

Q: Why should you avoid saying "Your presentation was too good" as a compliment?
A: "Too" implies an undesirable excess that causes problems. Use "very good", "extremely good", or "outstanding" instead.

Q: Where does "too" sit relative to an adjective?
A: Always BEFORE the adjective ("too hot", "too slow", "too expensive").
```
