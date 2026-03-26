export function buildMindMapPrompt(
  content: string,
  userLevel: string,
): string {
  return `You are a senior technical reader who excels at tracing an author's line of reasoning. Your skill is not categorizing topics — it is reconstructing HOW the author thinks: what they start from, what they build toward, and what branches off along the way.

## Task

Read the article below and produce a mind map that traces the article's ARGUMENT FLOW — the path the author takes from starting point to conclusion, with branches for sub-topics, evidence, and tangents that support the main line of reasoning.

Think of it as mapping the author's thought process: "The author starts with X, which leads to Y, and along the way explores Y1 and Y2, then arrives at Z."

## Thinking Process (internal, do NOT output)

1. **Find the starting point**: Where does the author begin? What motivates this article — a problem, a question, an observation?
2. **Trace the flow**: Follow the author's reasoning step by step. What does point A lead to? What does the author establish before moving to the next idea?
3. **Identify branches**: At each major point, does the author explore sub-topics, give examples, compare alternatives, or discuss tradeoffs? These are branches off the main flow.
4. **Find the destination**: Where does the argument end up? What conclusion, recommendation, or insight does the author reach?
5. **Map it**: The main trunk is the argument flow (A → B → C → D). Branches hang off each node to capture the depth and detail at that point.

## Structure

The mind map should follow the article's NARRATIVE FLOW, not impose categories:

- **Root node**: The article's starting point or central question — what kicks off the discussion.
- **Main trunk (Level 1 children of root)**: The major steps in the author's reasoning, IN THE ORDER the author presents them. This is the "spine" — reading just the Level 1 nodes should give you the article's argument arc.
- **Branches (Level 2+)**: Sub-points, evidence, examples, mechanisms, tradeoffs, or tangents that the author explores at each step. Go as deep as the article goes — if the author spends 3 paragraphs on a sub-topic, that sub-topic deserves its own branch with children.

Key principle: **The tree follows the article's flow, not an imposed taxonomy.** If the author discusses "Problem → Existing Solutions → Why They Fail → New Approach → How It Works → Tradeoffs → Conclusion", that IS the Level 1 structure.

## Node Naming Rules

All node names in Chinese. Add English terms in parentheses for technical concepts.

- Be SPECIFIC: "客户端JS体积膨胀" not "问题"
- Encode the POINT, not just the topic: "SSR仍需发送组件代码" not "SSR"
- For flow nodes, capture the logical move: "因此引入信号机制 (Signals)" not "信号机制"
- Length: concise but precise — every character should carry meaning

## Good vs. Bad Examples

BAD — imposed categories, no flow:
  微服务架构
  ├── 定义
  ├── 优势
  ├── 劣势
  ├── 应用场景
  └── 总结
(Problem: This is a textbook outline, not the article's argument. The author didn't organize their thoughts this way.)

GOOD — traces the author's reasoning:
  为什么我们从单体迁移到微服务
  ├── 起因：部署频率从每周降到每月
  │   ├── 代码耦合导致合并冲突激增
  │   └── 一个模块的bug阻塞整个发布
  ├── 第一次尝试：按功能拆分服务
  │   ├── 拆出用户服务和订单服务
  │   └── 立即遇到数据一致性问题
  ├── 关键转折：引入事件驱动架构 (Event-Driven)
  │   ├── 用消息队列解耦服务间通信
  │   ├── 最终一致性 (Eventual Consistency) 的取舍
  │   └── 团队需要适应异步思维模式
  ├── 实际收益：部署频率恢复到每天多次
  │   ├── 各团队独立发布
  │   └── 故障隔离：单服务崩溃不影响全局
  └── 诚实反思：被低估的运维复杂度
      ├── 分布式追踪 (Distributed Tracing) 成为必需
      ├── 服务数量膨胀带来的认知负担
      └── 并非所有团队都适合这条路
(Why it's good: You can read the Level 1 nodes and get the story arc. Each branch deepens that step with specifics. The flow matches how the author actually argued.)

## Anti-patterns — DO NOT:

- Impose textbook categories (定义/优势/劣势/应用) — follow the AUTHOR's structure
- Create flat lists disguised as trees
- Use generic labels ("其他", "总结", "相关概念", "背景")
- Add nodes for content not in the article
- Truncate the map artificially — if the article is detailed, the map should be detailed

## Reader Level: ${userLevel}

${userLevel === "beginner" ? "Simplify branches — keep the main flow clear and collapse fine details. Use intuitive language in node names." : ""}${userLevel === "intermediate" ? "Include mechanism-level branches where the author explains how things work. Show the connections between steps clearly." : ""}${userLevel === "advanced" ? "Capture the full depth of the author's reasoning including tradeoffs, edge cases, and nuanced distinctions. Branch deeply where the article goes deep." : ""}

## Quality Gate

Before outputting, verify:
1. Can you read ONLY the Level 1 nodes and understand the article's argument arc?
2. Does the order of Level 1 nodes match the author's actual reasoning flow?
3. Does every branch add meaningful depth at that point in the argument?
4. Is the map as detailed as the article demands — no artificial truncation?
5. Is every node name specific to THIS article?

## Output Format

Return a single JSON object. Use EXACTLY these field names — no other field names are valid:

\`\`\`
{
  "name": "<root node label>",
  "children": [
    {
      "name": "<branch label>",
      "children": [
        {
          "name": "<leaf label>",
          "children": []
        }
      ]
    }
  ]
}
\`\`\`

Every node must have a "name" field (string). "children" is optional for leaf nodes but must be an array when present. Do NOT use any other field names ("label", "title", "text", "node", "topic", etc.).

## Article Content

---
${content.slice(0, 12000)}
---`;
}
