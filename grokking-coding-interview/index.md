---
title: "Grokking Coding Interview Patterns"
category: "Coding Interview Patterns"
type: "Overview"
permalink: /grokking-coding-interview/
tags: [dsa, algorithms, python, coding-interview, patterns]
summary: "All 21 coding interview patterns grouped by interview frequency (Tier 1 Must-Know vs Tier 2 Specialized) with templates, traces, and edge cases."
---

# Grokking Coding Interview Patterns 🧩🐍

> *"Don't memorize 500 LeetCode solutions—recognize the **21 underlying patterns** from the problem's clues, explain **Brute Force → Optimal**, and apply a battle-tested Python template."*

---

## ⭐ Tier 1: Must-Know Patterns (80% of Coding Interviews)

| Problem Clue / Trigger | Pattern | Typical Complexity |
| :--- | :--- | :--- |
| Sorted array, pair/triplet sum, palindrome, remove duplicates in-place | **[01. Two Pointers](01-two-pointers.md)** | $O(n)$ time, $O(1)$ space |
| Cycle in linked list/array, find middle node, happy number | **[02. Fast & Slow Pointers](02-fast-and-slow-pointers.md)** | $O(n)$ time, $O(1)$ space |
| Contiguous subarray/substring, longest/shortest/max sum of size `k` | **[03. Sliding Window](03-sliding-window.md)** | $O(n)$ time, $O(k)$ space |
| Overlapping time ranges, meeting rooms, insert/merge intervals | **[04. Merge Intervals](04-merge-intervals.md)** | $O(n \log n)$ time |
| Reverse linked list (full, sub-list, or every `k` nodes) in $O(1)$ space | **[05. In-Place Linked List Reversal](05-in-place-linked-list-reversal.md)** | $O(n)$ time, $O(1)$ space |
| Top `K` frequent/largest/closest elements | **[08. Top 'K' Elements](08-top-k-elements.md)** | $O(n \log K)$ time |
| Sorted or rotated sorted array, search boundary / peak | **[09. Modified Binary Search](09-modified-binary-search.md)** | $O(\log n)$ time |
| All subsets, combinations, permutations, backtracking | **[10. Subsets & Backtracking](10-subsets-and-backtracking.md)** | $O(2^n)$ / $O(n!)$ |
| Level-order traversal, minimum depth, right-side view | **[13. Tree BFS](13-tree-bfs.md)** | $O(n)$ time |
| Root-to-leaf paths, diameter, LCA | **[14. Tree DFS](14-tree-dfs.md)** | $O(n)$ time |
| 2D grid islands, rotting oranges, flood fill | **[15. Matrix Traversal](15-matrix-traversal.md)** | $O(R \cdot C)$ time |
| Overlapping subproblems, 0/1 Knapsack, coin change, LCS | **[17. Dynamic Programming](17-dynamic-programming.md)** | $O(n \cdot W)$ / $O(n^2)$ |
| Valid parentheses, next greater element, daily temperatures | **[20. Stacks & Monotonic Stack](20-stacks-and-monotonic-stack.md)** | $O(n)$ time |

---

## 🎯 Tier 2: High-Leverage & Specialized Patterns

| Problem Clue / Trigger | Pattern | Typical Complexity |
| :--- | :--- | :--- |
| Running median from data stream, maximize capital | **[06. Two Heaps](06-two-heaps.md)** | $O(\log n)$ push, $O(1)$ peek |
| Merge `K` sorted lists/arrays, $K$-th smallest in sorted matrix | **[07. K-Way Merge](07-k-way-merge.md)** | $O(N \log K)$ time |
| Local optimal choice gives global optimum (jump game, gas station) | **[11. Greedy Techniques](11-greedy-techniques.md)** | $O(n)$ / $O(n \log n)$ |
| Single unique number, two unique numbers, complement bits | **[12. Bitwise XOR](12-bitwise-xor.md)** | $O(n)$ time, $O(1)$ space |
| Array contains numbers in range `1..n` or `0..n`, find missing/duplicate | **[16. Cyclic Sort](16-cyclic-sort.md)** | $O(n)$ time, $O(1)$ space |
| Task scheduling with prerequisites, alien dictionary (DAG) | **[18. Topological Sort](18-topological-sort.md)** | $O(V + E)$ time |
| Prefix search, autocomplete, wildcard dictionary | **[19. Trie](19-trie.md)** | $O(L)$ per word |
| Dynamic connectivity, cycle in undirected graph, connected components | **[21. Union-Find (Disjoint Set)](21-union-find.md)** | $O(\alpha(n))$ per op |
