---
title: "12. Bitwise XOR"
category: "Coding Interview Patterns"
type: "Pattern"
permalink: /grokking-coding-interview/12-bitwise-xor/
tags: [bitwise, xor, bit-manipulation, python, coding-interview]
summary: "Leverage XOR properties (a ^ a = 0, a ^ 0 = a) to find missing or unique numbers in O(n) time and O(1) space."
---

# 12. Bitwise XOR

## 1. Trigger Signals & Brute Force -> Optimal
* **Triggers:** Every number appears **twice** except **one** (or **two**) unique numbers, or find a **missing number** in `0..n` in $O(1)$ space.
* **Brute Force → Optimal:** Counting with a `Counter` takes $O(n)$ space. XOR cancels pairs (`x ^ x == 0`) in **$O(n)$ time and $O(1)$ space**.

---

## 2. Mental Model & Dry-Run Trace
* **Identity:** `x ^ 0 = x` | **Self-Inverse:** `x ^ x = 0` | **Associative:** `a ^ b ^ a = b`

**Dry-Run (`[4, 1, 2, 1, 2]`):**
`0 ^ 4 ^ 1 ^ 2 ^ 1 ^ 2` = `4 ^ (1 ^ 1) ^ (2 ^ 2)` = `4 ^ 0 ^ 0` = **`4`**.

---

## 3. Must-Know Classic Problems

### Problem A: Single Number
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def single_number(nums: list[int]) -> int:
    """Return the unique element when every other element appears twice."""
    ans = 0
    for num in nums:
        ans ^= num
    return ans

# Example: single_number([4, 1, 2, 1, 2]) -> 4
```

### Problem B: Missing Number (`0..n`)
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def missing_number(nums: list[int]) -> int:
    """Find the single missing number in `0..n` without overflow or extra space."""
    ans = len(nums)
    for i, num in enumerate(nums):
        ans ^= i ^ num  # Pairs each index with its value; missing index survives
    return ans

# Example: missing_number([3, 0, 1]) -> 2
```

### Problem C: Two Single Numbers
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def single_number_iii(nums: list[int]) -> list[int]:
    """Find the two unique elements when all others appear twice."""
    xor_all = 0
    for n in nums:
        xor_all ^= n

    low_bit = xor_all & -xor_all  # Isolate rightmost bit where a and b differ
    a = b = 0
    for n in nums:
        if n & low_bit:
            a ^= n
        else:
            b ^= n
    return [a, b]

# Example: single_number_iii([1, 2, 1, 3, 2, 5]) -> [3, 5]
```

---

## 4. Edge Cases & Pattern vs. Pattern
* **Negative numbers in Python:** Python ints have arbitrary precision; mask with `& 0xFFFFFFFF` if simulating 32-bit unsigned behavior.

| Pattern | When to Choose |
| :--- | :--- |
| **Bitwise XOR** | Exact pairs + 1 or 2 unique numbers in $O(1)$ space. |
| **[Cyclic Sort](16-cyclic-sort.md)** | Range `1..n` with arbitrary duplicates/missing items. |

---

## 5. Rapid Follow-Up Q&As
* **Q: What if every number appears 3 times except one?**  
  **A:** Sum the set bits at each bit position `0..31` modulo `3` (XOR only cancels even counts).
