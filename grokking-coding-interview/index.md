---
title: "Grokking Coding Interview Patterns"
category: "Coding Interview Patterns"
type: "Overview"
permalink: /grokking-coding-interview/
tags: [dsa, algorithms, python, coding-interview, patterns]
summary: "21 core coding interview patterns with trigger signals, reusable Python templates, classic problems, and edge-case checklists."
---

# Grokking Coding Interview Patterns 🧩🐍

> *"Don't memorize 500 LeetCode solutions—recognize the **21 underlying patterns** from the problem's clues and apply a battle-tested Python template."*

---

## 🧭 Pattern Recognition Cheat Table

| Problem Clue / Trigger | Pattern | Typical Complexity |
| :--- | :--- | :--- |
| Sorted array, pair/triplet sum, palindrome, remove duplicates in-place | **[01. Two Pointers](01-two-pointers.md)** | $O(n)$ time, $O(1)$ space |
| Cycle in linked list/array, find middle node, happy number | **02. Fast & Slow Pointers** *(planned)* | $O(n)$ time, $O(1)$ space |
| Contiguous subarray/substring, longest/shortest/max sum of size `k` | **03. Sliding Window** *(planned)* | $O(n)$ time, $O(k)$ space |
| Overlapping time ranges, meeting rooms, insert/merge intervals | **04. Merge Intervals** *(planned)* | $O(n \log n)$ time |
| Reverse linked list (full, sub-list, or every `k` nodes) in $O(1)$ space | **05. In-Place Linked List Reversal** *(planned)* | $O(n)$ time, $O(1)$ space |
| Running median from data stream, maximize capital | **06. Two Heaps** *(planned)* | $O(\log n)$ push, $O(1)$ peek |
| Merge `K` sorted lists/arrays, $K$-th smallest in sorted matrix | **07. K-Way Merge** *(planned)* | $O(n \log K)$ time |
| Top `K` frequent/largest/closest elements | **08. Top 'K' Elements** *(planned)* | $O(n \log K)$ time |
| Sorted or rotated sorted array, search boundary / peak | **09. Modified Binary Search** *(planned)* | $O(\log n)$ time |
| All subsets, combinations, permutations, backtracking | **10. Subsets & Backtracking** *(planned)* | $O(2^n)$ / $O(n!)$ |
| Local optimal choice gives global optimum (jump game, gas station) | **11. Greedy Techniques** *(planned)* | $O(n)$ / $O(n \log n)$ |
| Single unique number, two unique numbers, complement bits | **12. Bitwise XOR** *(planned)* | $O(n)$ time, $O(1)$ space |
| Level-order traversal, minimum depth, level averages | **13. Tree BFS** *(planned)* | $O(n)$ time |
| Root-to-leaf paths, diameter, LCA, tree serialization | **14. Tree DFS** *(planned)* | $O(n)$ time |
| 2D grid islands, flood fill, spiral/matrix traversal | **15. Matrix Traversal** *(planned)* | $O(R \cdot C)$ time |
| Array contains numbers in range `1..n` or `0..n`, find missing/duplicate | **16. Cyclic Sort** *(planned)* | $O(n)$ time, $O(1)$ space |
| Overlapping subproblems, 0/1 Knapsack, coin change, LCS | **17. Dynamic Programming** *(planned)* | $O(n \cdot W)$ / $O(n^2)$ |
| Task scheduling with prerequisites, alien dictionary (DAG) | **18. Topological Sort** *(planned)* | $O(V + E)$ time |
| Prefix search, autocomplete, word dictionary | **19. Trie** *(planned)* | $O(L)$ per word |
| Valid parentheses, next greater element, histogram area | **20. Stacks & Monotonic Stack** *(planned)* | $O(n)$ time |
| Dynamic connectivity, cycle in undirected graph, accounts merge | **21. Union-Find (Disjoint Set)** *(planned)* | $O(\alpha(n))$ per op |
