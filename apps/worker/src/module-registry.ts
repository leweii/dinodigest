import type { DigestModule, ContentInput } from "@dinodigest/module-sdk";

/**
 * Registry for digest modules ("digestive enzymes").
 * Manages module discovery and applicability filtering.
 */
export class ModuleRegistry {
  private modules = new Map<string, DigestModule>();

  /** Register a module */
  register(mod: DigestModule): void {
    if (this.modules.has(mod.manifest.id)) {
      console.warn(
        `[ModuleRegistry] Module "${mod.manifest.id}" already registered, overwriting`,
      );
    }
    this.modules.set(mod.manifest.id, mod);
    console.log(
      `[ModuleRegistry] Registered: ${mod.manifest.id} (${mod.manifest.name})`,
    );
  }

  /** Get a module by ID */
  get(id: string): DigestModule | undefined {
    return this.modules.get(id);
  }

  /** Get all registered modules */
  getAll(): DigestModule[] {
    return [...this.modules.values()];
  }

  /**
   * Find all modules that can process the given content.
   * Filters by contentType, language, and minContentLength.
   */
  findApplicable(input: ContentInput): DigestModule[] {
    return [...this.modules.values()].filter((mod) => {
      const { accepts } = mod.manifest;

      // Check content type
      if (!accepts.contentTypes.includes(input.contentType)) {
        return false;
      }

      // Check language (if module specifies languages)
      if (accepts.languages && !accepts.languages.includes(input.language)) {
        return false;
      }

      // Check minimum content length
      if (
        accepts.minContentLength &&
        input.wordCount < accepts.minContentLength
      ) {
        return false;
      }

      return true;
    });
  }
}
