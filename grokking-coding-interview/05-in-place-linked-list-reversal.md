---
title: "05. In-Place Linked List Reversal"
category: "Coding Interview Patterns"
type: "Pattern"
permalink: /grokking-coding-interview/05-in-place-linked-list-reversal/
tags: [linked-list, reversal, pointers, python, coding-interview]
summary: "Reverse a linked list, a sub-list, or k-node groups in O(n) time and O(1) extra space by re-wiring next pointers."
---

# 05. In-Place Linked List Reversal

## 1. Trigger Signals (When to Use)
* Problem asks to **reverse** a linked list, a **sub-list `[left..right]`**, or **every `k` nodes**.
* Constraint requires **$O(1)$ extra space** (no copying values into a Python list).

---

## 2. Mental Model

```mermaid
flowchart LR
    Prev["prev"] -.->|"cur.next = prev"| Cur["cur"] --> Next["nxt = cur.next"]
```
At each step: save `nxt = cur.next`, point `cur.next = prev`, advance `prev = cur`, `cur = nxt`.

---

## 3. Reusable Python Template

```python
class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next


def reverse_list(head: ListNode | None) -> ListNode | None:
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev
```

---

## 4. Must-Know Classic Problems

### Problem A: Reverse Linked List II (Sub-list `[left..right]`)
Use a `dummy` node before `head`, walk to `prev` (`left - 1`), and head-insert `right - left` nodes.
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def reverse_between(head: ListNode | None, left: int, right: int) -> ListNode | None:
    dummy = ListNode(0, head)
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
```

### Problem B: Reverse Nodes in `k`-Group
Check if `k` nodes remain; reverse that `k`-group and connect to the previous group's tail.
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def reverse_k_group(head: ListNode | None, k: int) -> ListNode | None:
    dummy = ListNode(0, head)
    group_prev = dummy

    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next

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

## 5. Edge Cases & Common Traps
* **Always use a `dummy` node** when `head` itself might change (like `left == 1` or `k`-group reversal).
* **Save `nxt` before overwriting `cur.next`**—losing the reference to the rest of the list is the #1 bug.

---

## 6. Rapid Follow-Up Q&As
- **Q: How do you check if a linked list is a palindrome in $O(1)$ space?**  
  **A:** Find the middle (Fast/Slow pointers), reverse the second half in-place, compare both halves, and optionally restore the second half.
