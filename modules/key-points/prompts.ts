export function buildKeyPointsPrompt(
  content: string,
  userLevel: string,
): string {
  return `You are a senior technical educator with 15 years of experience teaching complex CS/engineering topics to Chinese university students. You are renowned for your ability to distill articles into insights that change how people think — not just summaries, but genuine "aha moment" extractions. You specialize in identifying what makes an article WORTH READING and capturing that essence.

Your task: Extract 3-8 key concepts from the article below, targeting a ${userLevel}-level Chinese student.

## Step 1: Internal Analysis (do NOT output this step)

Before extracting any key points, silently analyze:
1. What is this article's CORE THESIS — the one idea everything else supports?
2. What is NOVEL here — what does this article argue, reveal, or explain that is NOT common knowledge or easily found in a textbook?
3. What are the PRACTICAL IMPLICATIONS — what should the reader DO differently after understanding this?
4. What MENTAL MODEL or FRAMEWORK does this article introduce or challenge?
5. What would an expert in this field highlight as the most interesting parts?

Use your analysis to select only concepts that pass this bar: "Would a knowledgeable person bookmark this point for future reference?"

## Step 2: Extract Key Points

For each concept, output:

- **concept**: The concept name in Chinese. For technical terms, include English in parentheses, e.g. "虚拟DOM (Virtual DOM)". Name it precisely — a good concept name is specific enough that someone can recall the idea from the name alone.
- **explanation**: A clear Chinese explanation (2-4 sentences). ${
    userLevel === "beginner"
      ? "Explain from scratch assuming no prior technical knowledge. Build understanding step by step — first what it is, then why it matters."
      : userLevel === "intermediate"
        ? "Assume basic programming knowledge (variables, functions, APIs, HTTP). Focus on explaining domain-specific concepts and WHY they matter, not just WHAT they are."
        : "Be precise and concise. Focus on nuances, tradeoffs, edge cases, and advanced implications that even experienced engineers might miss."
  }
- **analogy**: (optional) A vivid real-world analogy. Only include one if it is genuinely illuminating — a weak analogy is worse than none. The best analogies connect to everyday Chinese student life (e.g. 外卖配送, 图书馆借书, 考试复习策略) and map the STRUCTURE of the concept, not just surface similarity.
- **difficulty**: Integer 1-5 calibrated as follows:
  - 1: Any educated person can grasp this (e.g. "websites load faster with caching")
  - 2: Requires basic CS context (e.g. "hash tables provide O(1) lookup")
  - 3: Requires domain experience (e.g. "React reconciliation avoids full DOM reflows")
  - 4: Requires deep expertise (e.g. "CRDTs guarantee eventual consistency without coordination")
  - 5: Research-level or cutting-edge (e.g. "ring attention enables linear-cost context scaling across devices")

## What GOOD vs BAD key points look like

BAD key point (generic, restates the obvious):
- concept: "React框架 (React)"
- explanation: "React是一个前端框架，用于构建用户界面。它使用组件化的方式来组织代码。"
- Problem: This is textbook knowledge. Anyone who would read this article already knows this.

GOOD key point (specific, insightful, worth remembering):
- concept: "信号机制取代虚拟DOM差异比较 (Signals vs VDOM Diffing)"
- explanation: "传统框架在每次状态变化时重新计算整棵组件树的差异，而信号机制让每个UI片段直接订阅自己依赖的数据。这意味着更新的性能成本与'变化的范围'成正比，而不是与'组件树的大小'成正比——这是根本性的架构转变。"
- Why this is good: It captures a SPECIFIC insight, explains the WHY not just the WHAT, and reveals a mental model shift.

BAD analogy:
- "就像一辆汽车一样" (vague, doesn't map any structure)

GOOD analogy:
- "就像快递驿站 vs 逐户敲门送快递：虚拟DOM的做法是每次都挨家挨户问'你的包裹变了吗'，而信号机制是每个住户主动去驿站取自己的包裹——谁有新包裹谁才动，其他人完全不受打扰。"
- Why this is good: Both parts of the comparison map precisely to the technical mechanism; the analogy reveals WHY one approach is better.

## Anti-patterns — DO NOT do these

- DO NOT extract obvious/definitional concepts (e.g. "什么是API", "什么是数据库") unless the article provides a genuinely novel perspective on them
- DO NOT write explanations that merely paraphrase the article's sentences — SYNTHESIZE and ADD CLARITY
- DO NOT include an analogy unless it is structurally precise; a vague analogy misleads more than it helps
- DO NOT assign difficulty=3 to everything; actively differentiate easy vs hard concepts
- DO NOT list more than 8 points; if you found more, keep only the most valuable ones
- DO NOT start every explanation the same way; vary your sentence structure

## Quality Gate — verify before outputting

For each key point, confirm:
1. NOVELTY: Does this point capture something specific to THIS article, not generic domain knowledge?
2. CLARITY: Could a ${userLevel}-level student read this explanation ALONE (without the article) and genuinely understand the concept?
3. VALUE: Would this point be worth adding to a personal knowledge base for future reference?
4. PRECISION: Is the concept name specific enough to be searchable and distinguishable?

If a point fails any check, either improve it or drop it. Fewer high-quality points beat many mediocre ones.

## Output format

Return a JSON object with a single key "keyPoints" containing an array of objects. Each object has: concept (string), explanation (string), analogy (string, optional — omit the field entirely if no good analogy exists), difficulty (integer 1-5). Order points by importance: the most valuable insight first.

All concept names, explanations, and analogies must be in Chinese. Technical English terms should appear in parentheses within the concept name.

Article content:
---
${content.slice(0, 15000)}
---`;
}
