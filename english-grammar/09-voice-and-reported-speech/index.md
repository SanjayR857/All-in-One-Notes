---
title: "Module 09: Voice and Reported Speech"
category: "English Grammar"
difficulty: "B1–B2 (Transitivity, Rhetorical Focus & Discourse Shifts)"
reference: "Murphy (Units 42-48, 50); Swan (§6, 24)"
permalink: /english-grammar/09-voice-and-reported-speech/
tags: [grammar, passive-voice, reported-speech, causatives, indirect-questions, voice, discourse-shifts]
summary: "Mastery guide to grammatical voice and reported discourse: passive voice mechanics across all tenses, impersonal reporting passives, causative constructions (have/get/make/let), reported speech backshifting, and indirect questions."
---

# Module 09: Voice and Reported Speech 📢🛡️

> **Level:** CEFR B1–B2 (Transitivity, Rhetorical Focus & Discourse Shifts)  
> **Primary References:** Raymond Murphy (*English Grammar in Use*, Units 42–48, 50); Michael Swan (*Practical English Usage*, §6, 24)  
> **Core Concept:** Grammatical voice controls **thematic focus** (directing attention to the agent or the patient/receiver of an action). In technical writing, the **passive voice** is an indispensable tool for objective, process-centric documentation where the actor is irrelevant or systemic. Additionally, **reported speech** enables clear communication of decisions, bug reports, and requirements across time and discourse boundaries.

---

## 1. The Voice and Reported Discourse Architecture

```mermaid
graph TD
    VoiceSystem["Voice and Reported Discourse System"]
    
    subgraph PassiveVoice ["1. Passive Voice Transformations"]
        PV1["<b>Standard Passives:</b> BE + Past Participle (V3)<br/><i>'The payload was encrypted.'</i>"]
        PV2["<b>Impersonal Passives:</b> It is believed that... / The node is said to be..."]
        PV3["<b>Ditransitive Passives:</b> Recipient passive vs. Theme passive"]
    end
    
    subgraph CausativeVoice ["2. Causative Constructions"]
        CV1["<b>Passive Causative:</b> have / get something done<br/><i>'We had the code audited.'</i>"]
        CV2["<b>Active Causative:</b> make, let, have, get (with bare or to-infinitive)"]
    end
    
    subgraph ReportedDiscourse ["3. Reported Speech & Indirect Structures"]
        RD1["<b>Tense Backshifting:</b> Present -> Past; Past -> Past Perfect"]
        RD2["<b>Deictic Shifts:</b> Pronouns, temporal markers (now -> then, yesterday -> the day before)"]
        RD3["<b>Indirect Questions:</b> Declarative word order (S + V) without auxiliary inversion"]
    end

    VoiceSystem --> PassiveVoice
    VoiceSystem --> CausativeVoice
    VoiceSystem --> ReportedDiscourse
```

---

## 2. Topic Curriculum

This module contains **4 comprehensive deep-dive guides**:

| Guide | Core Focus | Target CEFR | Authoritative Literature |
| :--- | :--- | :---: | :--- |
| **01. [Passive Voice Forms and Mechanics](passive-voice-forms-and-mechanics.md)** | Active-to-passive transformation across all tenses, agent *by*-phrase omission criteria, ditransitive passives, technical style rationale | B1–B2 | Murphy Units 42–44; Swan §6.1–6.3 |
| **02. [Impersonal and Advanced Passives](impersonal-and-advanced-passives.md)** | Impersonal *it*-passives (*It is reported that*), personal passives with to-infinitives (*The bug is thought to be fixed*), passive gerunds & infinitives | B2–C1 | Murphy Unit 45; Swan §6.4–6.6 |
| **03. [Causative Structures: Have, Get, Make, Let](causative-structures-have-and-get.md)** | Delegated action (*have/get something done*), coercive/permissive causatives (*make someone do*, *let someone do*, *get someone to do*) | B1–B2 | Murphy Unit 46; Swan §1.7 |
| **04. [Reported Speech and Indirect Questions](reported-speech-and-indirect-questions.md)** | Backshifting laws, modal preservation/shifts, reporting verbs with that-clauses/infinitives, indirect question word order | B1–B2 | Murphy Units 47–48, 50; Swan §24 |

---

## 3. When to Choose Active vs. Passive Voice in Engineering

```mermaid
graph TD
    VoiceDecision["Choosing Between Active and Passive Voice"]
    
    VoiceDecision --> WhoDidIt{"Is the actor / agent important, human, or the main topic?"}
    
    WhoDidIt -->|YES: Actor is Central| UseActive["Use <b>ACTIVE VOICE</b><br/>• Clear accountability, direct instructions<br/>• Git commits, runbooks, personal actions<br/>• <i>'Alice refactored the auth module.'</i><br/>• <i>'Restart the container.'</i>"]
    
    WhoDidIt -->|NO: Action / Receiver is Central| UsePassive["Use <b>PASSIVE VOICE</b><br/>• Actor is unknown, irrelevant, or obvious<br/>• System events, RFCs, postmortems, architecture logs<br/>• <i>'The database was upgraded to v16.'</i><br/>• <i>'Packets are encrypted with AES-256.'</i>"]
```

---

## 4. Cross-Reference Directory
- **Foundations:** [Sentence Elements & Word Order](../01-foundations/sentence-elements-and-word-order.md) (Transitivity and Direct vs. Indirect objects).
- **Verbs:** [Transitive and Intransitive Verbs](../02-verbs-and-auxiliaries/transitive-and-intransitive-verbs.md) (Why intransitive verbs like *happen* or *occur* can **never** be passivized).
- **Tenses:** [Tenses & Aspect](../03-tenses-and-aspect/) (The 12 tense coordinate matrix).
- **Technical Writing:** [Practical Technical Communication](../15-practical-english-and-communication/) (Passive voice calibration in incident postmortems and SLAs).
