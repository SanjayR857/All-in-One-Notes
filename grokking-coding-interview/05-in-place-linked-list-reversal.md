---
title: "05. In-Place Linked List Reversal"
category: "Coding Interview Patterns"
type: "Pattern"
permalink: /grokking-coding-interview/05-in-place-linked-list-reversal/
tags: [linked-list, reversal, pointers, python, coding-interview]
summary: "Reverse a linked list, a sub-list, or k-node groups in O(n) time and O(1) extra space by re-wiring next pointers."
---

# 05. In-Place Linked List Reversal ⭐

## 1. Trigger Signals & Brute Force -> Optimal
* **Triggers:** Reverse a linked list, a **sub-list `[left..right]`**, or **every `k` nodes** with **$O(1)$ extra space**.
* **Brute Force → Optimal:** Pushing values into a Python list and rebuilding nodes takes $O(n)$ space. Re-wiring `cur.next = prev` in-place achieves **$O(n)$ time and $O(1)$ space**.

---

## 2. Mental Model & Dry-Run Trace

```mermaid
flowchart LR
    Prev["prev"] -.->|"cur.next = prev"| Cur["cur"] --> Next["nxt = cur.next"]
```

**Dry-Run (`1 -> 2 -> 3 -> None`):**
1. `prev=None, cur=1`: save `nxt=2`, set `1.next=None`, move `prev=1, cur=2`.
2. `prev=1, cur=2`: save `nxt=3`, set `2.next=1`, move `prev=2, cur=3`.
3. `prev=2, cur=3`: save `nxt=None`, set `3.next=2`, move `prev=3, cur=None` → return `3 -> 2 -> 1`.

---

## 3. Reusable Python Template

```python
class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next


def reverse_list(head: ListNode | None) -> ListNode | None:
    """Reverse a singly linked list in-place and return the new head."""
    prev, cur = None, head
    while cur:
        nxt = cur.next   # Save remainder before overwriting cur.next
        cur.next = prev  # Reverse pointer
        prev = cur
        cur = nxt
    return prev
```

---

## 4. Must-Know Classic Problems

### Problem A: Reverse Linked List II (Sub-list `[left..right]`)
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def reverse_between(head: ListNode | None, left: int, right: int) -> ListNode | None:
    """Reverse nodes from 1-indexed `left` to `right` in a single pass."""
    dummy = ListNode(0, head)  # Handles left == 1 uniformly
    prev = dummy
    for _ in range(left - 1):
        prev = prev.next

    cur = prev.next
    for _ in range(right - left):
        nxt = cur.next
        cur.next = nxt.next
        nxt.next = prev.next
        prev.next = nxt
    return dummy.next

# Example: [1, 2, 3, 4, 5], left=2, right=4 -> [1, 4, 3, 2, 5]
```

### Problem B: Reverse Nodes in `k`-Group
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def reverse_k_group(head: ListNode | None, k: int) -> ListNode | None:
    """Reverse nodes in chunks of `k`; leave trailing < k nodes untouched."""
    dummy = ListNode(0, head)
    group_prev = dummy

    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next  # Fewer than k nodes remain

        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt

        tail = group_prev.next
        group_prev.next = kth
        group_prev = tail
```

---

## 5. Edge Cases & Pattern vs. Pattern
* **Dummy node:** Always create `dummy = ListNode(0, head)` when `head` can change (`left == 1` or `k`-group).

| Pattern | When to Choose |
| :--- | :--- |
| **In-Place Reversal** | Re-wiring `next` pointers in $O(1)$ space. |
| **[Fast & Slow Pointers](02-fast-and-slow-pointers.md)** | Finding midpoint/cycle before reversing half a list (e.g., Palindrome Linked List). |

---

## 6. Rapid Follow-Up Q&As
* **Q: Recursive vs. Iterative reversal?**  
  **A:** Iterative uses $O(1)$ space; recursive uses $O(n)$ call-stack space and risks `RecursionError` in Python for long lists (>1000 nodes).
