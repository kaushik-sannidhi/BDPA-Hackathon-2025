// Common skill variations mapping
export const skillVariations: Record<string, string> = {
  "js": "JavaScript",
  "javascript": "JavaScript",
  "ts": "TypeScript",
  "typescript": "TypeScript",
  "react.js": "React",
  "reactjs": "React",
  "vue.js": "Vue",
  "vuejs": "Vue",
  "angular.js": "Angular",
  "angularjs": "Angular",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "python3": "Python",
  "py": "Python",
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "html5": "HTML",
  "css3": "CSS",
  "git": "Git",
  "github": "Git",
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "azure": "Azure",
  "microsoft azure": "Azure",
};

// Common skills for autocomplete
export const commonSkills = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "Next.js",
  "Django",
  "Flask",
  "Spring Boot",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Bootstrap",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud",
  "Azure",
  "Linux",
  "REST APIs",
  "GraphQL",
  "Microservices",
  "CI/CD",
  "Agile",
  "Scrum",
  "Communication",
  "Problem Solving",
  "Teamwork",
  "Leadership",
];

export function normalizeSkill(skill: string): string {
  const trimmed = skill.trim();
  const lower = trimmed.toLowerCase();
  
  // Check variations
  if (skillVariations[lower]) {
    return skillVariations[lower];
  }
  
  // Capitalize first letter of each word
  return trimmed
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function matchSkills(userSkills: string[], requiredSkills: string[]): {
  matched: string[];
  missing: string[];
  matchPercentage: number;
} {
  const normalizedUser = userSkills.map(normalizeSkill);
  const normalizedRequired = requiredSkills.map(normalizeSkill);
  
  const matched: string[] = [];
  const missing: string[] = [];
  
  for (const required of normalizedRequired) {
    const found = normalizedUser.some(user => 
      user.toLowerCase() === required.toLowerCase() ||
      user.toLowerCase().includes(required.toLowerCase()) ||
      required.toLowerCase().includes(user.toLowerCase())
    );
    
    if (found) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  }
  
  const matchPercentage = normalizedRequired.length > 0
    ? Math.round((matched.length / normalizedRequired.length) * 100)
    : 0;
  
  return { matched, missing, matchPercentage };
}

export function categorizeSkills(skills: string[]): {
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
} {
  const programmingLanguages = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "PHP", "Swift", "Kotlin"
  ];
  
  const frameworks = [
    "React", "Vue", "Angular", "Next.js", "Express", "Django", "Flask", "Spring Boot", "Laravel", "Rails"
  ];
  
  const softSkills = [
    "Communication", "Problem Solving", "Teamwork", "Leadership", "Time Management", "Adaptability", "Creativity"
  ];
  
  const categorized = {
    programmingLanguages: [] as string[],
    frameworks: [] as string[],
    tools: [] as string[],
    softSkills: [] as string[],
  };
  
  for (const skill of skills) {
    const normalized = normalizeSkill(skill);
    const lower = normalized.toLowerCase();
    
    if (programmingLanguages.some(lang => lower.includes(lang.toLowerCase()))) {
      categorized.programmingLanguages.push(normalized);
    } else if (frameworks.some(fw => lower.includes(fw.toLowerCase()))) {
      categorized.frameworks.push(normalized);
    } else if (softSkills.some(ss => lower.includes(ss.toLowerCase()))) {
      categorized.softSkills.push(normalized);
    } else {
      categorized.tools.push(normalized);
    }
  }
  
  return categorized;
}

