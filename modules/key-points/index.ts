import type { DigestModule } from "@dinodigest/module-sdk";
import { KeyPointsAgent } from "./agent.js";

const keyPointsModule: DigestModule = {
  manifest: {
    id: "key-points",
    name: "Key Points Extraction",
    description:
      "Breaks down articles into individual knowledge points with simple explanations and analogies.",
    version: "1.0.0",
    author: "DinoDigest Team",
    accepts: {
      contentTypes: ["article", "documentation", "paper"],
    },
    outputs: ["key_point"],
  },

  createAgent(runtime) {
    return new KeyPointsAgent(runtime);
  },
};

export default keyPointsModule;
