import { SkillCategory } from "../../../generated/prisma/client";
import { SKILLS_DICTIONARY } from "./skills-dictionary";

export type ExtractedSkill = {
  name: string;
  category: SkillCategory;
};

/**
 * Builds a regex that matches any alias of a skill entry as a whole word.
 * We lowercase the text before matching, so all aliases are also lowercase.
 *
 * Some aliases already include \b anchors (e.g. "\bgo\b") — we pass them
 * through as-is. Others get wrapped with \b automatically.
 */
function buildPattern(aliases: string[]): RegExp {
  const parts = aliases.map((alias) => {
    const alreadyAnchored = alias.startsWith("\\b") || alias.endsWith("\\b");
    return alreadyAnchored ? alias : `\\b${alias}\\b`;
  });
  return new RegExp(parts.join("|"), "i");
}

// Pre-compile all patterns once at module load time — not on every function call.
// This is a performance best practice: regex compilation is expensive.
const COMPILED_DICTIONARY = SKILLS_DICTIONARY.map((entry) => ({
  name: entry.name,
  category: entry.category,
  pattern: buildPattern(entry.aliases),
}));

/**
 * Extracts known skills from a job's title and description.
 *
 * @param title - The job title (role field)
 * @param description - The full job description (may be undefined)
 * @returns Deduplicated list of matched skills with their categories
 */
export function extractSkills(
  title: string,
  description: string | null | undefined
): ExtractedSkill[] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const found: ExtractedSkill[] = [];

  for (const entry of COMPILED_DICTIONARY) {
    if (entry.pattern.test(text)) {
      found.push({ name: entry.name, category: entry.category });
    }
  }

  return found;
}
