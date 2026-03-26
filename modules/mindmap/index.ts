import type { DigestModule } from "@dinodigest/module-sdk";
import { MindMapAgent } from "./agent.js";

const mindmapModule: DigestModule = {
  manifest: {
    id: "mindmap",
    name: "Mind Map",
    description:
      "Generates a hierarchical mind map showing the article's knowledge structure and concept relationships.",
    version: "1.0.0",
    author: "DinoDigest Team",
    accepts: {
      contentTypes: ["article", "documentation", "paper"],
    },
    outputs: ["mind_map"],
  },

  createAgent(runtime) {
    return new MindMapAgent(runtime);
  },
};

export default mindmapModule;
