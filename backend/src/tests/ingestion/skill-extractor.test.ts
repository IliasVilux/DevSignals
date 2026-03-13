import { describe, it, expect } from "vitest";
import { extractSkills } from "../../ingestion/skill-extractor/skill-extractor";
import { SkillCategory } from "../../../generated/prisma/client";

describe("extractSkills", () => {
  it("extracts a skill from the title", () => {
    const result = extractSkills("Senior React Developer", null);
    expect(result).toContainEqual({ name: "React", category: SkillCategory.FRAMEWORK });
  });

  it("extracts a skill from the description", () => {
    const result = extractSkills("Backend Engineer", "We use Node.js and PostgreSQL");
    expect(result).toContainEqual({ name: "Node.js", category: SkillCategory.FRAMEWORK });
    expect(result).toContainEqual({ name: "PostgreSQL", category: SkillCategory.DATABASE });
  });

  it("normalizes aliases to the canonical name", () => {
    const result = extractSkills("ReactJS developer needed", null);
    expect(result).toContainEqual({ name: "React", category: SkillCategory.FRAMEWORK });
    const reactMatches = result.filter((s) => s.name === "React");
    expect(reactMatches).toHaveLength(1);
  });

  it("is case insensitive", () => {
    const result = extractSkills("TYPESCRIPT AND PYTHON REQUIRED", null);
    expect(result).toContainEqual({ name: "TypeScript", category: SkillCategory.LANGUAGE });
    expect(result).toContainEqual({ name: "Python", category: SkillCategory.LANGUAGE });
  });

  it("does not match partial words (word boundary check)", () => {
    const result = extractSkills("Django developer with MongoDB experience", null);
    expect(result).not.toContainEqual({ name: "Go", category: SkillCategory.LANGUAGE });
  });

  it("matches Go when it appears as a standalone word", () => {
    const result = extractSkills("Backend developer with Go and Docker", null);
    expect(result).toContainEqual({ name: "Go", category: SkillCategory.LANGUAGE });
  });

  it("extracts cloud skills", () => {
    const result = extractSkills("DevOps Engineer", "Experience with AWS and GCP required");
    expect(result).toContainEqual({ name: "AWS", category: SkillCategory.CLOUD });
    expect(result).toContainEqual({ name: "GCP", category: SkillCategory.CLOUD });
  });

  it("returns empty array when no skills are found", () => {
    const result = extractSkills("General Manager", "Responsible for team coordination");
    expect(result).toEqual([]);
  });

  it("handles null description gracefully", () => {
    const result = extractSkills("Python Developer", null);
    expect(result).toContainEqual({ name: "Python", category: SkillCategory.LANGUAGE });
  });

  it("handles undefined description gracefully", () => {
    const result = extractSkills("Python Developer", undefined);
    expect(result).toContainEqual({ name: "Python", category: SkillCategory.LANGUAGE });
  });

  it("extracts multiple skills from a realistic job description", () => {
    const title = "Full Stack Developer";
    const description = `
      We are looking for a Full Stack Developer with experience in React, Node.js,
      TypeScript, PostgreSQL, and Docker. Familiarity with AWS and CI/CD pipelines
      is a plus.
    `;

    const result = extractSkills(title, description);
    const names = result.map((s) => s.name);

    expect(names).toContain("React");
    expect(names).toContain("Node.js");
    expect(names).toContain("TypeScript");
    expect(names).toContain("PostgreSQL");
    expect(names).toContain("Docker");
    expect(names).toContain("AWS");
    expect(names).toContain("CI/CD");
  });
});
