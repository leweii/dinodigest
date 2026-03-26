import type { DigestModule } from "@dinodigest/module-sdk";
import { SummaryAgent } from "./agent.js";

const summaryModule: DigestModule = {
  manifest: {
    id: "summary",
    name: "Article Summary",
    description:
      "Generates a structured Chinese summary with key takeaways from any article.",
    version: "1.0.0",
    author: "DinoDigest Team",
    accepts: {
      contentTypes: ["article", "documentation", "paper"],
      // No language restriction — can summarize any language into Chinese
    },
    outputs: ["summary"],
  },

  createAgent(runtime) {
    return new SummaryAgent(runtime);
  },
};

export default summaryModule;
