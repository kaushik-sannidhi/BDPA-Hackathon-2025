// Comprehensive skill grouping for accurate, hard-coded matching
export const SKILL_GROUPS: { [canonical: string]: string[] } = {
  // Programming Languages
  "JavaScript": ["javascript", "js", "es6", "ecmascript"],
  "TypeScript": ["typescript", "ts"],
  "Python": ["python", "python3", "py"],
  "Java": ["java"],
  "C#": ["c#", "csharp"],
  "C++": ["c++", "cpp"],
  "Go": ["go", "golang"],
  "Rust": ["rust"],
  "PHP": ["php"],
  "Ruby": ["ruby"],
  "Swift": ["swift"],
  "Kotlin": ["kotlin"],
  "HTML": ["html", "html5"],
  "CSS": ["css", "css3", "scss", "sass", "less"],

  // Frontend Frameworks & Libraries
  "React": ["react", "react.js", "reactjs"],
  "Next.js": ["next.js", "nextjs"],
  "Vue.js": ["vue", "vue.js", "vuejs"],
  "Angular": ["angular", "angular.js", "angularjs"],
  "Svelte": ["svelte"],
  "jQuery": ["jquery"],
  "Redux": ["redux", "redux toolkit"],
  "Zustand": ["zustand"],
  "Tailwind CSS": ["tailwind css", "tailwind"],
  "Bootstrap": ["bootstrap"],
  "Material-UI": ["material-ui", "mui"],

  // Backend Frameworks & Libraries
  "Node.js": ["node.js", "nodejs"],
  "Express.js": ["express", "express.js"],
  "Django": ["django"],
  "Flask": ["flask"],
  "FastAPI": ["fastapi"],
  "Spring Boot": ["spring boot", "spring"],
  "Ruby on Rails": ["ruby on rails", "rails"],
  "Laravel": ["laravel"],

  // Databases & Caching
  "SQL": ["sql"],
  "PostgreSQL": ["postgresql", "postgres"],
  "MySQL": ["mysql"],
  "SQLite": ["sqlite"],
  "Microsoft SQL Server": ["mssql", "sql server"],
  "NoSQL": ["nosql"],
  "MongoDB": ["mongodb", "mongo"],
  "Redis": ["redis"],
  "Cassandra": ["cassandra"],
  "DynamoDB": ["dynamodb"],
  "Firebase": ["firebase", "firestore"],

  // Cloud & DevOps
  "AWS": ["aws", "amazon web services"],
  "Azure": ["azure", "microsoft azure"],
  "Google Cloud": ["gcp", "google cloud platform"],
  "Docker": ["docker"],
  "Kubernetes": ["kubernetes", "k8s"],
  "Terraform": ["terraform"],
  "Ansible": ["ansible"],
  "CI/CD": ["ci/cd", "continuous integration", "continuous delivery", "jenkins", "circleci", "travis ci", "github actions"],
  "Version Control": ["version control", "git", "github", "gitlab", "bitbucket", "vcs"],
  "Linux": ["linux", "unix", "ubuntu", "centos"],
  "Nginx": ["nginx"],
  "Apache": ["apache"],
  
  // Data Science & ML
  "Machine Learning": ["machine learning", "ml"],
  "Deep Learning": ["deep learning", "neural networks"],
  "TensorFlow": ["tensorflow", "tf"],
  "PyTorch": ["pytorch"],
  "Scikit-learn": ["scikit-learn", "sklearn"],
  "Pandas": ["pandas"],
  "NumPy": ["numpy"],
  "Jupyter": ["jupyter", "jupyter notebooks"],
  "Natural Language Processing": ["nlp", "natural language processing"],
  "Computer Vision": ["computer vision", "cv"],
  
  // APIs & Communication
  "REST": ["rest", "restful apis", "rest apis"],
  "GraphQL": ["graphql"],
  "gRPC": ["grpc"],
  "WebSockets": ["websockets"],

  // Testing
  "Jest": ["jest"],
  "Mocha": ["mocha"],
  "Cypress": ["cypress"],
  "Selenium": ["selenium"],
  "Unit Testing": ["unit testing", "unit tests"],
  "Integration Testing": ["integration testing"],

  // Soft Skills & Methodologies
  "Agile": ["agile", "scrum", "kanban"],
  "Communication": ["communication"],
  "Problem Solving": ["problem solving"],
  "Teamwork": ["teamwork", "collaboration"],
  "Leadership": ["leadership"],
};

// Create a reverse map for quick lookups
const skillToCanonicalMap: { [skill: string]: string } = {};
for (const canonical in SKILL_GROUPS) {
  for (const skill of SKILL_GROUPS[canonical]) {
    skillToCanonicalMap[skill] = canonical;
  }
}

/**
 * Normalizes a skill string to its canonical name using the SKILL_GROUPS mapping.
 * @param skill The skill string to normalize.
 * @returns The canonical skill name or the original skill, title-cased, if not found.
 */
export function normalizeSkill(skill: string): string {
  const lowerSkill = skill.toLowerCase().trim();
  if (skillToCanonicalMap[lowerSkill]) {
    return skillToCanonicalMap[lowerSkill];
  }
  // Fallback for skills not in our map
  return skill.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()).join(' ');
}

/**
 * A comprehensive list of common skills for suggestions, derived from the canonical keys of SKILL_GROUPS.
 */
export const commonSkills = Object.keys(SKILL_GROUPS);

/**
 * Matches user skills against required skills using the canonical mapping.
 * @param userSkills The list of skills the user has.
 * @param requiredSkills The list of skills required for a job.
 * @returns An object containing matched skills, missing skills, and the match percentage.
 */
export function matchSkills(userSkills: string[] = [], requiredSkills: string[] = []): {
  matched: string[];
  missing: string[];
  matchPercentage: number;
} {
  const canonicalUserSkills = new Set(
    (userSkills || []).map(skill => normalizeSkill(skill))
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const required of (requiredSkills || [])) {
    const canonicalRequired = normalizeSkill(required);
    if (canonicalUserSkills.has(canonicalRequired)) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  }

  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matched.length / requiredSkills.length) * 100)
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
    "React", "Vue.js", "Angular", "Next.js", "Express.js", "Django", "Flask", "Spring Boot", "Laravel", "Ruby on Rails"
  ];
  
  const softSkills = [
    "Communication", "Problem Solving", "Teamwork", "Leadership", "Time Management", "Adaptability", "Creativity", "Agile"
  ];
  
  const categorized = {
    programmingLanguages: [] as string[],
    frameworks: [] as string[],
    tools: [] as string[],
    softSkills: [] as string[],
  };
  
  for (const skill of skills) {
    const normalized = normalizeSkill(skill);
    
    if (programmingLanguages.includes(normalized)) {
      categorized.programmingLanguages.push(normalized);
    } else if (frameworks.includes(normalized)) {
      categorized.frameworks.push(normalized);
    } else if (softSkills.includes(normalized)) {
      categorized.softSkills.push(normalized);
    } else {
      categorized.tools.push(normalized);
    }
  }
  
  return categorized;
}