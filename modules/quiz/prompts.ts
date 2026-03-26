export function buildQuizPrompt(
  content: string,
  userLevel: string,
): string {
  const levelGuidance = {
    beginner: `Bloom's Taxonomy target: primarily UNDERSTAND and APPLY.
- Test whether the reader grasps the core ideas and can restate them in their own terms.
- "Apply" questions should ask the reader to recognize the concept in a new, simple scenario.
- Distractors can exploit common beginner confusions: mixing up cause and effect, confusing similar terms, or overgeneralizing a specific claim.`,
    intermediate: `Bloom's Taxonomy target: primarily APPLY and ANALYZE.
- Test whether the reader can use the concepts in new contexts and break down relationships between ideas.
- Include questions that require connecting two or more ideas from different parts of the article.
- Distractors should exploit subtler misconceptions: correct reasoning with wrong scope, partially true statements, or confusing necessary vs. sufficient conditions.`,
    advanced: `Bloom's Taxonomy target: primarily ANALYZE and EVALUATE.
- Test whether the reader can critique trade-offs, identify assumptions, and predict consequences.
- Ask questions where the reader must weigh competing concerns or evaluate the author's reasoning.
- Distractors should be sophisticated: technically accurate statements that don't answer the specific question asked, or conclusions that follow from a flawed premise.`,
  }[userLevel] || `Bloom's Taxonomy target: mix of UNDERSTAND, APPLY, and ANALYZE.
- Adapt question difficulty to test genuine comprehension at a general level.`;

  return `You are a senior educational assessment designer with 15 years of experience creating comprehension tests for Chinese university students studying English-language technical material. Your quiz questions are known for being fair but rigorous — a reader who truly understood the article will pass, while a reader who only skimmed or memorized phrases will fail.

Your task: design 4 high-quality comprehension questions for the article below. All question text, options, and explanations must be in Simplified Chinese. Keep English technical terms in parentheses where they aid clarity, e.g. "容器化（containerization）".

## Step-by-step process (follow this internally before generating output)

**Step 1 — Identify the 4 most important ideas in the article.**
Read the article and extract the 4 ideas that are most central to the author's argument or explanation. Ignore trivial details, examples used purely for illustration, and structural/meta information (e.g. "the article has 5 sections"). Prioritize:
  - The core thesis or main claim
  - Key mechanisms, causes, or trade-offs explained
  - Surprising or counterintuitive points the author emphasizes
  - Practical implications or conclusions the author draws

**Step 2 — For each idea, design one question.**
Each question should make the reader THINK, not just search-and-match. The question stem should require the reader to have internalized the concept, not just recognized a phrase from the article.

**Step 3 — For each question, design 3 distractors (wrong options).**
Each distractor must represent a specific, identifiable misconception or reasoning error. Before finalizing, verify: "Could a student who understood the article be tricked by this distractor?" If yes, the distractor is unfair — revise it. "Could a student who only skimmed the article pick this distractor?" If yes, the distractor is doing its job.

**Step 4 — Write the explanation.**
The explanation should be educational on its own. A student who reads only the explanation (without having read the article) should learn the core concept being tested.

## Difficulty calibration for "${userLevel}" level

${levelGuidance}

## Question quality standards

### GOOD question example (what to aim for):
Article states: "Kubernetes uses a declarative model — you describe the desired state, and the system figures out how to reach it."
- Question: "Kubernetes 采用声明式模型的核心含义是什么？"
- Correct: "用户定义期望的最终状态，系统自动决定如何达到该状态" (tests understanding of the mechanism)
- Distractor A: "用户需要编写详细的步骤脚本来指导系统执行操作" (confuses declarative with imperative — common misconception)
- Distractor B: "系统会自动选择最优的编程语言来实现部署" (sounds plausible but reflects a misunderstanding of what "declarative" controls)
- Distractor C: "用户只需声明使用 Kubernetes，系统会自动完成所有配置" (overgeneralizes "declarative" to mean zero configuration)

### BAD question examples (what to NEVER do):
- ❌ "文章中提到了以下哪个工具？" (pure recall, no comprehension needed)
- ❌ "文章的第三部分主要讨论了什么？" (tests article structure, not content understanding)
- ❌ "以下哪项是正确的？" (vague stem that doesn't target a specific concept)
- ❌ A question where 3 distractors are absurd and only 1 option is remotely plausible (no discrimination power)
- ❌ A question that can be answered correctly just by pattern-matching a keyword from the article

## Distractor design rules

Each wrong option MUST:
1. Be grammatically correct and similar in length/style to the correct answer
2. Be wrong for a specific, identifiable reason (not just "made up")
3. Represent a plausible misunderstanding: overgeneralization, cause-effect reversal, confusing related concepts, applying the right logic to the wrong scope, or mixing up necessary vs. sufficient conditions
4. NOT be obviously absurd, humorous, or unrelated to the topic

## Explanation quality rules

Each explanation MUST:
1. State WHY the correct answer is correct by referencing the article's reasoning or evidence
2. Briefly explain why the most tempting distractor is wrong (identify the specific misconception)
3. Reinforce the underlying concept so the reader learns from the question even if they got it wrong
4. Be 2-4 sentences — concise but educational

## Anti-patterns — strictly avoid

- Questions answerable by keyword-matching a sentence from the article
- Questions about what the article "mentions" or "discusses" rather than what concepts mean
- Questions where the correct answer is the longest or most detailed option
- Questions that test English vocabulary rather than technical comprehension
- Distractors that are correct statements but arbitrarily marked wrong
- All four options being near-synonyms with negligible differences

## Output format

Return a JSON object matching this exact schema:
- questions: array of exactly 4 objects, each with:
  - question (string): the question in Chinese
  - options (array of 4 strings): answer choices in Chinese, randomly order the correct answer's position
  - correctIndex (number, 0-3): index of the correct option
  - explanation (string): educational explanation in Chinese

Vary the position of the correct answer across questions (don't always put it at index 0 or 3).

## Article content

---
${content.slice(0, 12000)}
---`;
}
