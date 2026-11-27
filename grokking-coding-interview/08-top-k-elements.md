---
title: "08. Top 'K' Elements"
category: "Coding Interview Patterns"
type: "Pattern"
permalink: /grokking-coding-interview/08-top-k-elements/
tags: [top-k, heaps, quickselect, python, coding-interview]
summary: "Find the K largest, smallest, most frequent, or closest elements using a bounded heap of size K in O(n log K) time."
---

# 08. Top 'K' Elements

## 1. Trigger Signals (When to Use)
* Problem asks for the **top `K`**, **`K` largest / smallest**, **`K` most frequent**, or **`K` closest** items.
* Better than full $O(n \log n)$ sorting when $K \ll n$.

---

## 2. Mental Model

```mermaid
flowchart LR
    Stream["Input Stream (n items)"] -->|"push & if len > k: pop min"| Heap["Min-Heap of size K"]
    Heap --> Ans["Heap holds Top K largest!"]
```
* **Top K Largest** → keep a **Min-Heap** of size `K` (pop smallest when `len > k`).
* **Top K Smallest** → keep a **Max-Heap** of size `K` (negate values in Python, pop largest when `len > k`).

---

## 3. Reusable Python Template

```python
import heapq


def top_k_largest(nums: list[int], k: int) -> list[int]:
    heap: list[int] = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap
```

---

## 4. Must-Know Classic Problems

### Problem A: Top K Frequent Elements
Count frequencies with `Counter`, then keep a Min-Heap of size `k` (or bucket sort by frequency for $O(n)$).
* **Time:** $O(n \log k)$ (or $O(n)$ with buckets) | **Space:** $O(n)$

```python
import heapq
from collections import Counter


def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return heapq.nlargest(k, counts.keys(), key=counts.get)  # type: ignore[arg-type]
```

### Problem B: K Closest Points to Origin
Maintain a Max-Heap of size `k` storing `(-dist_sq, x, y)`.
* **Time:** $O(n \log k)$ | **Space:** $O(k)$

```python
import heapq


def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    heap: list[tuple[int, int, int]] = []
    for x, y in points:
        dist = -(x * x + y * y)
        if len(heap) < k:
            heapq.heappush(heap, (dist, x, y))
        elif dist > heap[0][0]:
            heapq.heapreplace(heap, (dist, x, y))
    return [[x, y] for _, x, y in heap]
```

---

## 5. Edge Cases & Common Traps
* **`heapq.heapreplace(heap, item)`** is faster than `heappop` + `heappush` when the heap is already at capacity `k`.
* **Distance comparison:** Use squared distance `x*x + y*y`—never `math.sqrt` (avoids float inaccuracy and extra cost).

---

## 6. Rapid Follow-Up Q&As
- **Q: How can you find the Kth largest element in $O(n)$ average time?**  
  **A:** **Quickselect** (Hoare's partition)—$O(n)$ average, $O(n^2)$ worst case, $O(1)$ space. Use a Min-Heap when $O(n \log k)$ worst-case guarantee or streaming is needed.
