/**
 * Simple language detection based on character analysis.
 * Returns ISO 639-1 code ('en', 'zh', etc.)
 *
 * This is a lightweight heuristic — good enough for MVP.
 * For production, consider using the `franc` library.
 */
export function detectLanguage(text: string): string {
  // Sample the first 1000 characters for efficiency
  const sample = text.slice(0, 1000);

  // Count CJK characters (Chinese/Japanese/Korean)
  const cjkPattern = /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f]/g;
  const cjkMatches = sample.match(cjkPattern);
  const cjkRatio = (cjkMatches?.length ?? 0) / sample.length;

  // If more than 10% CJK characters, it's likely Chinese
  if (cjkRatio > 0.1) {
    return "zh";
  }

  // Count Japanese-specific characters (Hiragana/Katakana)
  const jpPattern = /[\u3040-\u309f\u30a0-\u30ff]/g;
  const jpMatches = sample.match(jpPattern);
  if ((jpMatches?.length ?? 0) > 10) {
    return "ja";
  }

  // Count Korean-specific characters (Hangul)
  const krPattern = /[\uac00-\ud7af\u1100-\u11ff]/g;
  const krMatches = sample.match(krPattern);
  if ((krMatches?.length ?? 0) > 10) {
    return "ko";
  }

  // Default to English
  return "en";
}
