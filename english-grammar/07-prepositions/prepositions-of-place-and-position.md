---
title: "Prepositions of Place and Position: At, On, In, Above, Over, Under, Between"
category: "English Grammar"
difficulty: "A1–B2 (Spatial Topology & Geometric Coordinates)"
reference: "Murphy (Units 123-125); Swan (§18.4-18.5)"
permalink: /english-grammar/07-prepositions/prepositions-of-place-and-position/
tags: [grammar, prepositions, place-prepositions, spatial-relations, at-on-in, above-vs-over, under-vs-below, between-vs-among]
summary: "Comprehensive guide to prepositions of place: the At-On-In spatial dimensions, topological hierarchies, above vs. over, below vs. under, between vs. among, and computing infrastructure spatial models."
---

# Prepositions of Place and Position: At, On, In, Above, Over, Under, Between 🗺️📍

> **Level:** CEFR A1–B2 (Spatial Topology & Geometric Coordinates)  
> **Primary References:** Raymond Murphy (*English Grammar in Use*, Units 123–125); Michael Swan (*Practical English Usage*, §18.4–18.5)  
> **Core Concept:** Spatial prepositions locate entities within geometric and conceptual space. English organizes position through dimensional topology: **`at`** (zero dimensions: a point or milestone), **`on`** (one/two dimensions: a line or surface), and **`in`** (three dimensions: an enclosed volume or container), alongside precise vertical and relational coordinates (*above/over, below/under, between/among*).

---

## 1. The Spatial Dimension Hierarchy (At, On, In)

```mermaid
graph TD
    SpatialPyramid["Spatial Dimension Hierarchy"]
    
    subgraph AtPoint ["AT: 0-D Dimensionless Point / Location / Event"]
        A1["• Specific addresses: <b>at 10 Downing Street</b><br/>• Target points: <b>at the intersection</b>, <b>at the door</b><br/>• Social gatherings & events: <b>at the conference</b>, <b>at the meet-up</b><br/>• Network coordinates: <b>at port 8080</b>, <b>at the API endpoint</b>"]
    end
    
    subgraph OnSurface ["ON: 1-D / 2-D Surface, Line & Media"]
        O1["• Physical surfaces: <b>on the motherboard</b>, <b>on the desk</b><br/>• Electronic displays & media: <b>on the screen</b>, <b>on the website</b>, <b>on the disk</b><br/>• Public transport: <b>on the train</b>, <b>on the bus</b>, <b>on the plane</b><br/>• Lines & boundaries: <b>on the coast</b>, <b>on the border</b>"]
    end
    
    subgraph InVolume ["IN: 3-D Enclosed Space, Container & Territory"]
        I1["• 3D physical enclosures: <b>in the server room</b>, <b>in the data center</b><br/>• Virtual containers & data storage: <b>in the database</b>, <b>in memory</b>, <b>in RAM</b><br/>• Geographic regions: <b>in California</b>, <b>in Europe</b>, <b>in Tokyo</b><br/>• Small enclosed vehicles: <b>in a car</b>, <b>in a taxi</b>"]
    end

    AtPoint --> OnSurface
    OnSurface --> InVolume
```

---

## 2. Technical Computing Spatial Topology

Software systems heavily repurpose spatial prepositions. Choosing the wrong preposition obscures architectural intent:

| Architectural Location | Standard Preposition | Rationale | Example Sentence |
| :--- | :---: | :--- | :--- |
| **Volatile RAM / Storage Engine** | **`in`** | Enclosed 3D data container | *The session state is stored **in Redis / in memory**.* |
| **Relational Database / File** | **`in`** | Internal data enclosure | *The records are located **in the `users` table**.* |
| **Host / Virtual Machine / OS** | **`on`** | Operating platform or surface | *The daemon executes **on Ubuntu / on AWS EC2**.* |
| **Physical Disk / Storage Medium** | **`on`** | Storage surface layer | *The write-ahead log is flushed **on SSD drives**.* |
| **Network Interface / Port / URL** | **`at`** | Specific dimensionless destination point | *The service listens for incoming TCP traffic **at port 443**.* |
| **Domain / Endpoint URL** | **`at`** | Discrete address coordinate | *The health check is available **at `/healthz`**.* |

> [!TIP]
> - **In** memory (internal state).
> - **On** the server (host platform).
> - **At** port 8080 (network endpoint address).

---

## 3. Vertical Relationships: `Above` vs. `Over`

Both words indicate a higher vertical position, but their geometric and figurative distributions differ:

```mermaid
graph TD
    VerticalHigh["Vertical Relationships: Above vs. Over"]
    
    VerticalHigh --> OverChoice["<b>OVER</b>"]
    OverChoice --> Ov1["Directly vertical alignment: <i>'a lamp over the table'</i>"]
    OverChoice --> Ov2["Physical covering / contact: <i>'a tarp over the server rack'</i>"]
    OverChoice --> Ov3["Movement across a boundary: <i>'data routed over the bridge'</i>"]
    OverChoice --> Ov4["Numerical excess / quantities: <i>'over 5,000 requests/sec'</i>"]
    
    VerticalHigh --> AboveChoice["<b>ABOVE</b>"]
    AboveChoice --> Ab1["Higher on a scale or plane (not necessarily directly vertical)"]
    AboveChoice --> Ab2["Measurements, temperatures, altitudes: <i>'above 90°C'</i>, <i>'above sea level'</i>"]
    AboveChoice --> Ab3["Document layout reference: <i>'as mentioned above'</i>"]
```

### Contrast Table

| Context | `Above` | `Over` |
| :--- | :--- | :--- |
| **Direct Vertical Alignment** | Permissible (*a shelf above the desk*) | Preferred (*a light hanging over the desk*) |
| **Physical Surface Covering** | ❌ Cannot express covering | ✅ *Place a cover **over** the hardware.* |
| **Scale / Threshold Measurement** | ✅ *CPU utilization is **above 95%**.* | ❌ Unnatural with exact degree scales |
| **Numerical Quantity ("More than")** | ❌ *Above 500 users* (less common) | ✅ * **Over 500 users** are connected.* |
| **Movement Across an Obstacle** | ❌ Cannot express crossing | ✅ *Traffic travels **over** the TLS VPN tunnel.* |

---

## 4. Vertical Relationships: `Below` vs. `Under`

The downward counterparts of *above* and *over*:

```mermaid
graph TD
    VerticalLow["Vertical Relationships: Below vs. Under"]
    
    VerticalLow --> UnderChoice["<b>UNDER</b>"]
    UnderChoice --> Un1["Directly underneath / covered: <i>'cables under the floor'</i>"]
    UnderChoice --> Un2["Subordinate status / condition: <i>'under heavy load', 'under review'</i>"]
    UnderChoice --> Un3["Less than (quantities): <i>'under 100 milliseconds'</i>"]
    
    VerticalLow --> BelowChoice["<b>BELOW</b>"]
    BelowChoice --> Be1["Lower on a vertical scale or measurement"]
    BelowChoice --> Be2["Temperatures & benchmarks: <i>'below freezing', 'below average'</i>"]
    BelowChoice --> Be3["Document layout reference: <i>'see code snippet below'</i>"]
```

- *The fiber optic cables run **under** the raised floor tiles.* (Directly underneath and covered).
- *The query latency dropped **below** the 50ms SLA threshold.* (Scalar benchmark).
- *The database is currently operating **under** heavy concurrent write stress.* (Idiomatic state).

---

## 5. Relational Proximity: `Between` vs. `Among`

```mermaid
graph LR
    subgraph BetweenBox ["BETWEEN (Distinct & Individualized)"]
        B1["Used for separate, distinct, named entities.<br/>• Prototypically <b>two</b>: <i>'between the client and the server'</i><br/>• Can be <b>three or more</b> if each is individually named:<br/><i>'negotiations between France, Germany, and Italy'</i><br/><i>'network latency between Node A, Node B, and Node C'</i>"]
    end

    subgraph AmongBox ["AMONG (Collective & Undifferentiated)"]
        A1["Used for members of an undivided group, mass, or crowd (3+).<br/>• <i>'consensus <b>among</b> cluster nodes'</i><br/>• <i>'distribute the workload <b>among</b> all workers'</i><br/>• <i>'a consensus among senior architects'</i>"]
    end
```

> [!CAUTION]
> The traditional rule stating *"between is only for two; among is for three or more"* is an oversimplification. In technical prose:
> - *The packet travels **between** server 1, server 2, and server 3.* (Correct, because the servers are distinct, named nodes).
> - *The load is balanced **among** all available servers.* (Correct, because the servers form an indistinct collective pool).

---

## 6. Practical Dual-Domain Examples

### Everyday Conversation

1. *I left my keys **on the kitchen table**.* (Surface)
2. *She is waiting for you **at the coffee shop on 5th Avenue**.* (Point + Line)
3. *We stayed **in a charming hotel in Rome**.* (Enclosed building + City)
4. *There is an antique mirror hanging **above the fireplace**.* (Higher on the wall)
5. *The cat is sleeping **under the bed**.* (Directly underneath and covered)
6. *He divided the inheritance equally **between his two sons**.* (Two distinct individuals)
7. *She felt completely comfortable **among her closest friends**.* (Collective group)
8. *The temperature dropped **below zero** overnight.* (Scalar measurement)

### Software Engineering & Technical Documentation

9. *The background worker processes asynchronous jobs stored **in Redis**.*
10. *The application runs containerized workloads **on Kubernetes clusters**.*
11. *The reverse proxy listens **at port 80** and redirects to port 443.*
12. *The cache hit ratio remained **above 92%** throughout the stress test.*
13. *Network traffic is encrypted **over an IPsec VPN tunnel**.*
14. *Latency degraded significantly when CPU utilization climbed **over 90%**.*
15. *The cluster nodes reach consensus **among themselves** using the Raft protocol.*
16. *We analyzed the network latency **between the ingress gateway, the auth service, and the database**.*
17. *Inspect the diagram **below** to review the microservice dependency graph.*
18. *The microservice operates reliably **under high concurrent write pressure**.*

---

## 7. Common Antipatterns & Diagnostic Table

| Incorrect Antipattern | Corrected Grammar | Rule & Explanation |
| :--- | :--- | :--- |
| ❌ *The session is stored on memory.* | ✅ *The session is stored **in memory**.* | Volatile memory is an enclosed virtual container, requiring *in*. |
| ❌ *The microservice listens on port 8080.* | ✅ *The microservice listens **at port 8080**.* (or *on interface... at port*). | Ports represent discrete dimensionless network points (*at*). |
| ❌ *I read the tutorial in internet.* | ✅ *I read the tutorial **on the internet**.* | Digital media, broadcasts, and network surfaces take *on*. |
| ❌ *The server temperature is over 100°C.* | ✅ *The server temperature is **above 100°C**.* | Benchmark scales, levels, and thermometer measurements take *above*, not *over*. |
| ❌ *Divide the tasks between all developers.* | ✅ *Divide the tasks **among** all developers.* | Modifying an undivided collective group (3+) takes *among*. |
| ❌ *The latency fell under the 50ms SLA.* | ✅ *The latency fell **below** the 50ms SLA.* | Fixed scalar benchmarks and thresholds take *below*. |
| ❌ *We arrived to the data center.* | ✅ *We arrived **at the data center**.* | *Arrive* takes *at* (for buildings/points) or *in* (for cities/countries), never *to*. |

---

## 8. Self-Assessment Exercises

### Exercise 1: Spatial At, On, In
Fill in the blanks with **at, on**, or **in**:

1. The configuration values are defined ________ the `.env` file.
2. The webhook dispatcher listens for events ________ endpoint `/v1/events`.
3. We deployed the machine learning model ________ an AWS EC2 instance.
4. The Redis cache keeps all active user sessions ________ RAM.
5. The developers met ________ the main conference room ________ the third floor.

### Exercise 2: `Above`, `Over`, `Below`, `Under`, `Between`, `Among`
Choose the appropriate preposition:

6. The cluster latency must remain (below / under) 100 milliseconds at all times.
7. Traffic is routed securely (above / over) an encrypted TLS 1.3 connection.
8. We balanced the network requests (between / among) all fifty cluster worker nodes.
9. System memory usage spiked (above / over) 95% capacity during the backup.
10. The agreement was negotiated (between / among) the client, the vendor, and the host provider.

<details>
<summary>View Complete Answer Key & Diagnostic Explanations</summary>

1. **in** (Enclosed inside a digital file container).
2. **at** (Discrete address endpoint).
3. **on** (Host platform / VM surface).
4. **in** (Enclosed volatile memory).
5. **in** the main conference room **on** the third floor (*in* for 3D room; *on* for architectural floor level).
6. **below** (Benchmark threshold metric on a numeric scale).
7. **over** (Movement or communication across a medium/tunnel).
8. **among** (Collective, undifferentiated group of 50 nodes).
9. **above** (Scale measurement; *over* is also acceptable colloquially, but *above* is the standard scalar term).
10. **between** (Three separate, individually named corporate entities).

</details>

---

## 9. Revision Flashcards

```
Q: What is the spatial difference between "in", "on", and "at"?
A: "At" designates a dimensionless target point or address; "on" designates a 1D/2D line or surface; "in" designates an enclosed 3D volume, container, or geographic territory.

Q: In technical infrastructure, why do we say "in memory" but "on the server"?
A: Memory (RAM) is treated conceptually as an internal storage container ("in"), while a server or OS is treated as an execution platform or surface ("on").

Q: When should you use "above" instead of "over"?
A: Use "above" for measurements, temperatures, and scalar thresholds on a vertical scale ("above 90°C", "above the 50ms SLA"). Use "over" for direct vertical alignment, physical covering, or numerical quantities ("over 10,000 users").

Q: Can "between" ever be used with more than two items?
A: Yes! Use "between" whenever three or more items are distinct, individual, and separately named ("between Node A, Node B, and Node C").

Q: Why is "arrive to the office" incorrect?
A: The verb "arrive" takes "at" (for buildings, points, and specific facilities) or "in" (for cities and countries), never the directional preposition "to".
```
