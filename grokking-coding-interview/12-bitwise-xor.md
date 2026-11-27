---
title: "12. Bitwise XOR"
category: "Coding Interview Patterns"
type: "Pattern"
permalink: /grokking-coding-interview/12-bitwise-xor/
tags: [bitwise, xor, bit-manipulation, python, coding-interview]
summary: "Leverage XOR properties (a ^ a = 0, a ^ 0 = a) to find missing or unique numbers in O(n) time and O(1) space."
---

# 12. Bitwise XOR

## 1. Trigger Signals (When to Use)
* Every element appears **twice** except for **one** (or **two**) unique elements.
* Find a **missing number** in `0..n` in $O(1)$ extra space.
* Flipping/inverting bits or comparing Hamming distance.

---

## 2. Mental Model
* **Identity:** `x ^ 0 = x`
* **Self-Inverse:** `x ^ x = 0`
* **Commutative & Associative:** Order doesn't matter (`a ^ b ^ a = b`).

---

## 3. Must-Know Classic Problems

### Problem A: Single Number
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def single_number(nums: list[int]) -> int:
    ans = 0
    for num in nums:
        ans ^= num
    return ans
```

### Problem B: Missing Number (`0..n`)
XOR all array values with all indices `0..n`.
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def missing_number(nums: list[int]) -> int:
    ans = len(nums)
    for i, num in enumerate(nums):
        ans ^= i ^ num
    return ans
```

### Problem C: Two Single Numbers
XOR everything to get `diff = a ^ b`, isolate the lowest set bit `mask = diff & -diff`, and partition numbers into two groups.
* **Time:** $O(n)$ | **Space:** $O(1)$

```python
def single_number_iii(nums: list[int]) -> list[int]:
    xor_all = 0
    for n in nums:
        xor_all ^= n
    low_bit = xor_all & -xor_all  # Rightmost differing bit
    a = b = 0
    for n in nums:
        if n & low_bit:
            a ^= n
        else:
            b ^= n
    return [a, b]
```

---

## 4. Edge Cases & Common Traps
* **Python arbitrary-precision ints:** Negative numbers in Python have infinite leading `1` bits—mask with `& 0xFFFFFFFF` if simulating 32-bit unsigned integers.

---

## 5. Rapid Follow-Up Q&As
- **Q: What if every number appears 3 times except one?**  
  **A:** Count set bits at each bit position `0..31` modulo `3` (XOR only cancels pairs).
