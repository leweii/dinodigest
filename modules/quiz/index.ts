import type { DigestModule } from "@dinodigest/module-sdk";
import { QuizAgent } from "./agent.js";

const quizModule: DigestModule = {
  manifest: {
    id: "quiz",
    name: "Comprehension Quiz",
    description:
      "Generates multiple-choice comprehension questions to verify understanding of the article.",
    version: "1.0.0",
    author: "DinoDigest Team",
    accepts: {
      contentTypes: ["article", "documentation", "paper"],
    },
    outputs: ["quiz"],
  },

  createAgent(runtime) {
    return new QuizAgent(runtime);
  },
};

export default quizModule;
