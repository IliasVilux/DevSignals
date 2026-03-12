import { SkillCategory } from "../../../generated/prisma/client";

export type SkillEntry = {
  name: string;
  category: SkillCategory;
  aliases: string[];
};

export const SKILLS_DICTIONARY: SkillEntry[] = [
  // Languages
  {
    name: "JavaScript",
    category: SkillCategory.LANGUAGE,
    aliases: ["javascript", "js"],
  },
  {
    name: "TypeScript",
    category: SkillCategory.LANGUAGE,
    aliases: ["typescript", "ts"],
  },
  {
    name: "Python",
    category: SkillCategory.LANGUAGE,
    aliases: ["python", "python3", "python 3"],
  },
  {
    name: "Java",
    category: SkillCategory.LANGUAGE,
    aliases: ["java"],
  },
  {
    name: "C#",
    category: SkillCategory.LANGUAGE,
    aliases: ["c#", "csharp", "c sharp"],
  },
  {
    name: "C++",
    category: SkillCategory.LANGUAGE,
    aliases: ["c\\+\\+", "cpp"],
  },
  {
    name: "Go",
    category: SkillCategory.LANGUAGE,
    aliases: ["golang", "\\bgo\\b"],
  },
  {
    name: "Rust",
    category: SkillCategory.LANGUAGE,
    aliases: ["rust", "rustlang"],
  },
  {
    name: "PHP",
    category: SkillCategory.LANGUAGE,
    aliases: ["php"],
  },
  {
    name: "Ruby",
    category: SkillCategory.LANGUAGE,
    aliases: ["ruby"],
  },
  {
    name: "Kotlin",
    category: SkillCategory.LANGUAGE,
    aliases: ["kotlin"],
  },
  {
    name: "Swift",
    category: SkillCategory.LANGUAGE,
    aliases: ["swift"],
  },
  {
    name: "Scala",
    category: SkillCategory.LANGUAGE,
    aliases: ["scala"],
  },
  {
    name: "R",
    category: SkillCategory.LANGUAGE,
    aliases: ["\\br\\b"],
  },

  // Frameworks & Libraries
  {
    name: "React",
    category: SkillCategory.FRAMEWORK,
    aliases: ["react", "react\\.js", "reactjs"],
  },
  {
    name: "Next.js",
    category: SkillCategory.FRAMEWORK,
    aliases: ["next\\.js", "nextjs", "next js"],
  },
  {
    name: "Vue",
    category: SkillCategory.FRAMEWORK,
    aliases: ["vue", "vue\\.js", "vuejs"],
  },
  {
    name: "Angular",
    category: SkillCategory.FRAMEWORK,
    aliases: ["angular", "angularjs"],
  },
  {
    name: "Svelte",
    category: SkillCategory.FRAMEWORK,
    aliases: ["svelte", "sveltekit"],
  },
  {
    name: "Node.js",
    category: SkillCategory.FRAMEWORK,
    aliases: ["node\\.js", "nodejs", "node js", "\\bnode\\b"],
  },
  {
    name: "Express",
    category: SkillCategory.FRAMEWORK,
    aliases: ["express", "express\\.js", "expressjs"],
  },
  {
    name: "NestJS",
    category: SkillCategory.FRAMEWORK,
    aliases: ["nestjs", "nest\\.js", "nest js"],
  },
  {
    name: "Django",
    category: SkillCategory.FRAMEWORK,
    aliases: ["django"],
  },
  {
    name: "FastAPI",
    category: SkillCategory.FRAMEWORK,
    aliases: ["fastapi", "fast api"],
  },
  {
    name: "Flask",
    category: SkillCategory.FRAMEWORK,
    aliases: ["flask"],
  },
  {
    name: "Spring Boot",
    category: SkillCategory.FRAMEWORK,
    aliases: ["spring boot", "spring-boot", "springboot"],
  },
  {
    name: "Laravel",
    category: SkillCategory.FRAMEWORK,
    aliases: ["laravel"],
  },
  {
    name: "Ruby on Rails",
    category: SkillCategory.FRAMEWORK,
    aliases: ["ruby on rails", "rails", "ror"],
  },
  {
    name: "GraphQL",
    category: SkillCategory.FRAMEWORK,
    aliases: ["graphql", "graph ql"],
  },
  {
    name: "REST API",
    category: SkillCategory.FRAMEWORK,
    aliases: ["rest api", "restful", "rest"],
  },
  {
    name: "gRPC",
    category: SkillCategory.FRAMEWORK,
    aliases: ["grpc", "g rpc"],
  },

  // Databases
  {
    name: "PostgreSQL",
    category: SkillCategory.DATABASE,
    aliases: ["postgresql", "postgres", "\\bpg\\b"],
  },
  {
    name: "MySQL",
    category: SkillCategory.DATABASE,
    aliases: ["mysql"],
  },
  {
    name: "MongoDB",
    category: SkillCategory.DATABASE,
    aliases: ["mongodb", "mongo"],
  },
  {
    name: "Redis",
    category: SkillCategory.DATABASE,
    aliases: ["redis"],
  },
  {
    name: "Elasticsearch",
    category: SkillCategory.DATABASE,
    aliases: ["elasticsearch", "elastic search", "elastic"],
  },
  {
    name: "SQLite",
    category: SkillCategory.DATABASE,
    aliases: ["sqlite", "sqlite3"],
  },
  {
    name: "Cassandra",
    category: SkillCategory.DATABASE,
    aliases: ["cassandra", "apache cassandra"],
  },
  {
    name: "DynamoDB",
    category: SkillCategory.DATABASE,
    aliases: ["dynamodb", "dynamo db"],
  },
  {
    name: "SQL",
    category: SkillCategory.DATABASE,
    aliases: ["\\bsql\\b"],
  },

  // DevOps & Infrastructure
  {
    name: "Docker",
    category: SkillCategory.DEVOPS,
    aliases: ["docker"],
  },
  {
    name: "Kubernetes",
    category: SkillCategory.DEVOPS,
    aliases: ["kubernetes", "k8s"],
  },
  {
    name: "CI/CD",
    category: SkillCategory.DEVOPS,
    aliases: [
      "ci/cd",
      "ci cd",
      "cicd",
      "continuous integration",
      "continuous deployment",
    ],
  },
  {
    name: "Terraform",
    category: SkillCategory.DEVOPS,
    aliases: ["terraform"],
  },
  {
    name: "Ansible",
    category: SkillCategory.DEVOPS,
    aliases: ["ansible"],
  },
  {
    name: "GitHub Actions",
    category: SkillCategory.DEVOPS,
    aliases: ["github actions", "gh actions"],
  },
  {
    name: "Jenkins",
    category: SkillCategory.DEVOPS,
    aliases: ["jenkins"],
  },
  {
    name: "Linux",
    category: SkillCategory.DEVOPS,
    aliases: ["linux", "ubuntu", "debian"],
  },
  {
    name: "Nginx",
    category: SkillCategory.DEVOPS,
    aliases: ["nginx"],
  },

  // Cloud
  {
    name: "AWS",
    category: SkillCategory.CLOUD,
    aliases: ["\\baws\\b", "amazon web services"],
  },
  {
    name: "GCP",
    category: SkillCategory.CLOUD,
    aliases: ["\\bgcp\\b", "google cloud", "google cloud platform"],
  },
  {
    name: "Azure",
    category: SkillCategory.CLOUD,
    aliases: ["\\bazure\\b", "microsoft azure"],
  },
  {
    name: "Vercel",
    category: SkillCategory.CLOUD,
    aliases: ["vercel"],
  },
  {
    name: "Supabase",
    category: SkillCategory.CLOUD,
    aliases: ["supabase"],
  },
];
