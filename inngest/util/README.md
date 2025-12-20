# 🧠 Problem Setup (Realistic Workflow)

### Nodes in DB

Assume you have **7 nodes** in a workflow:

| ID  | Meaning        |
| --- | -------------- |
| A   | Trigger        |
| B   | HTTP Request   |
| C   | Transform      |
| D   | Database Write |
| E   | Logger         |
| F   | Notification   |
| G   | Cleanup        |

```ts
nodes = [A, B, C, D, E, F, G];
```

---

### Connections in DB

```text
A → B
A → C
C → D
B → E
```

Graphically:

```
A
├── B ──► E
└── C ──► D

F   (standalone)
G   (standalone)
```

---

# 🔁 Step 1: Build edges from connections

```ts
const edges = connections.map(...)
```

Result:

```ts
edges = [
  ["A", "B"],
  ["A", "C"],
  ["C", "D"],
  ["B", "E"],
];
```

So far, **F and G are missing**.

---

# ⚠️ Why this is a problem

`toposort(edges)` **only knows about nodes that appear in edges**.

If you run it now, the result will be something like:

```ts
["A", "C", "D", "B", "E"];
```

❌ **F and G are gone**

That’s unacceptable — standalone workflow steps must still execute.

---

# 🧩 Step 2: Collect node IDs that appear in connections

```ts
const connectionNodeIds = new Set();
```

Looping connections:

```ts
connectionNodeIds = {
  "A", "B", "C", "D", "E"
}
```

Still missing:

```
F, G
```

---

# ➕ Step 3: Add self-edges for standalone nodes

```ts
edges.push([node.id, node.id]);
```

For nodes **not in `connectionNodeIds`**:

```ts
edges.push(["F", "F"]);
edges.push(["G", "G"]);
```

Now edges become:

```ts
edges = [
  ["A", "B"],
  ["A", "C"],
  ["C", "D"],
  ["B", "E"],
  ["F", "F"],
  ["G", "G"],
];
```

---

## 🧠 Why self-edges work

A self-edge:

```
F → F
```

Means:

- F exists
- F has no dependency on others
- But must be included in the graph

Toposort includes it — but **twice**.

---

# 🔀 Step 4: Run toposort

```ts
sortedNodeIds = toposort(edges);
```

A **valid output** could be:

```ts
["A", "C", "D", "B", "E", "F", "F", "G", "G"];
```

💥 **Duplicates appear because of self-edges**

This is **expected behavior**.

---

# 🧹 Step 5: Remove duplicates

```ts
sortedNodeIds = [...new Set(sortedNodeIds)];
```

Now:

```ts
sortedNodeIds = ["A", "C", "D", "B", "E", "F", "G"];
```

✅ All nodes included
✅ Order respects dependencies
✅ Standalone nodes preserved

---

# 🔁 Step 6: Map IDs → Node objects

```ts
const nodeMap = new Map(nodes.map((n) => [n.id, n]));
```

Then:

```ts
sortedNodes = sortedNodeIds.map((id) => nodeMap.get(id));
```

Final result:

```ts
[Node(A), Node(C), Node(D), Node(B), Node(E), Node(F), Node(G)];
```

This is now:

- Execution-safe
- Complete
- Deterministic

---

# ❌ What would happen WITHOUT duplicate removal

If you skip:

```ts
[...new Set()];
```

You get:

```ts
[A, C, D, B, E, F, F, G, G];
```

💥 Effects:

- F runs twice
- G runs twice
- Side effects duplicate
- Workflow becomes invalid

---

# 🧠 Mental Model (remember this)

> **Edges define order, not execution**
> **IDs define identity**
> **New references define changes**
> **Self-edges force inclusion**
> **Sets clean the mess**

---

# TL;DR

- Toposort ignores isolated nodes → you add self-edges
- Self-edges duplicate IDs → you dedupe
- IDs → mapped back to ORM nodes
- Cycles → rejected
- Final list → safe execution order
