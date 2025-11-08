// Centralized jobs database with roles and required skills
export interface JobRole {
  id: string;
  title: string;
  category: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  salaryRange?: string;
  experienceLevel?: string;
}

export const JOBS_DATABASE: JobRole[] = [
  // Technology & Engineering
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Technology & Engineering",
    description: "Design, develop, and maintain software applications and systems.",
    responsibilities: [
      "Write clean, maintainable, and efficient code",
      "Collaborate with cross-functional teams to define and ship new features",
      "Debug and troubleshoot software issues",
      "Participate in code reviews and provide constructive feedback",
      "Stay updated with emerging technologies and best practices"
    ],
    requiredSkills: ["Programming Languages", "Data Structures", "Algorithms", "Version Control", "Software Architecture"],
    salaryRange: "$80k - $150k",
    experienceLevel: "Entry to Senior"
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Technology & Engineering",
    description: "Analyze complex data to help companies make better decisions.",
    responsibilities: [
      "Collect, clean, and preprocess large datasets",
      "Build and deploy machine learning models",
      "Create data visualizations and reports for stakeholders",
      "Conduct statistical analysis and hypothesis testing",
      "Collaborate with engineering teams to implement data solutions"
    ],
    requiredSkills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
    salaryRange: "$90k - $160k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    category: "Technology & Engineering",
    description: "Bridge development and operations to improve deployment frequency and reliability.",
    responsibilities: [
      "Automate infrastructure provisioning and configuration",
      "Implement CI/CD pipelines",
      "Monitor system performance and reliability",
      "Manage cloud infrastructure and services",
      "Implement security best practices"
    ],
    requiredSkills: ["Linux/Unix", "Docker", "Kubernetes", "AWS", "CI/CD"],
    salaryRange: "$95k - $165k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Technology & Engineering",
    description: "Define product vision and strategy to deliver value to customers.",
    responsibilities: [
      "Define product roadmap and prioritize features",
      "Conduct market research and competitive analysis",
      "Gather and analyze user feedback",
      "Coordinate with engineering, design, and marketing teams",
      "Track key product metrics and KPIs"
    ],
    requiredSkills: ["Product Strategy", "Data Analysis", "User Research", "Agile/Scrum", "Communication"],
    salaryRange: "$100k - $180k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "ux-ui-designer",
    title: "UX/UI Designer",
    category: "Technology & Engineering",
    description: "Create intuitive and engaging user experiences for digital products.",
    responsibilities: [
      "Conduct user research and usability testing",
      "Create wireframes, prototypes, and high-fidelity designs",
      "Design user interfaces following best practices",
      "Collaborate with developers to implement designs",
      "Maintain design systems and style guides"
    ],
    requiredSkills: ["Figma", "User Research", "Prototyping", "Visual Design", "Interaction Design"],
    salaryRange: "$70k - $140k",
    experienceLevel: "Entry to Senior"
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "Technology & Engineering",
    description: "Protect organizations from cyber threats and security breaches.",
    responsibilities: [
      "Monitor networks for security breaches",
      "Conduct security assessments and penetration testing",
      "Respond to security incidents",
      "Implement security measures and policies",
      "Stay updated on latest security threats and trends"
    ],
    requiredSkills: ["Network Security", "Penetration Testing", "Security Frameworks", "Incident Response", "Cryptography"],
    salaryRange: "$85k - $150k",
    experienceLevel: "Entry to Senior"
  },

  // Healthcare & Medicine
  {
    id: "registered-nurse",
    title: "Registered Nurse",
    category: "Healthcare & Medicine",
    description: "Provide patient care and support in various healthcare settings.",
    responsibilities: [
      "Assess patient conditions and monitor vital signs",
      "Administer medications and treatments",
      "Collaborate with physicians and healthcare team",
      "Educate patients and families on health conditions",
      "Maintain accurate medical records"
    ],
    requiredSkills: ["Patient Care", "Medical Knowledge", "Communication", "Critical Thinking", "Compassion"],
    salaryRange: "$60k - $95k",
    experienceLevel: "Entry to Mid"
  },
  {
    id: "physician-assistant",
    title: "Physician Assistant",
    category: "Healthcare & Medicine",
    description: "Practice medicine under the supervision of physicians and surgeons.",
    responsibilities: [
      "Examine and diagnose patients",
      "Order and interpret diagnostic tests",
      "Prescribe medications and treatments",
      "Assist in surgeries and procedures",
      "Counsel patients on preventive healthcare"
    ],
    requiredSkills: ["Clinical Medicine", "Diagnostic Skills", "Patient Assessment", "Medical Ethics", "Teamwork"],
    salaryRange: "$95k - $125k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "medical-lab-tech",
    title: "Medical Laboratory Technician",
    category: "Healthcare & Medicine",
    description: "Perform laboratory tests to help diagnose and treat diseases.",
    responsibilities: [
      "Collect and analyze blood, tissue, and bodily fluid samples",
      "Operate and maintain laboratory equipment",
      "Record and report test results",
      "Follow safety and quality control procedures",
      "Assist in research and development activities"
    ],
    requiredSkills: ["Laboratory Techniques", "Analytical Skills", "Attention to Detail", "Medical Knowledge", "Quality Control"],
    salaryRange: "$45k - $65k",
    experienceLevel: "Entry to Mid"
  },
  {
    id: "physical-therapist",
    title: "Physical Therapist",
    category: "Healthcare & Medicine",
    description: "Help patients recover from injuries and improve mobility.",
    responsibilities: [
      "Evaluate patient conditions and develop treatment plans",
      "Implement therapeutic exercises and interventions",
      "Use equipment and technology for rehabilitation",
      "Monitor patient progress and adjust treatments",
      "Educate patients on injury prevention"
    ],
    requiredSkills: ["Anatomy & Physiology", "Rehabilitation Techniques", "Patient Assessment", "Manual Therapy", "Communication"],
    salaryRange: "$75k - $95k",
    experienceLevel: "Entry to Senior"
  },
  {
    id: "healthcare-admin",
    title: "Healthcare Administrator",
    category: "Healthcare & Medicine",
    description: "Manage operations and services in healthcare facilities.",
    responsibilities: [
      "Oversee daily operations of healthcare facilities",
      "Manage budgets and financial planning",
      "Ensure compliance with healthcare regulations",
      "Coordinate between departments and staff",
      "Implement policies to improve patient care quality"
    ],
    requiredSkills: ["Healthcare Management", "Financial Planning", "Regulatory Compliance", "Leadership", "Strategic Planning"],
    salaryRange: "$80k - $130k",
    experienceLevel: "Mid to Senior"
  },

  // Business & Finance
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    category: "Business & Finance",
    description: "Analyze financial data to guide business decisions and investments.",
    responsibilities: [
      "Create financial models and forecasts",
      "Analyze financial statements and market trends",
      "Prepare reports and presentations for stakeholders",
      "Conduct valuation and risk analysis",
      "Monitor investment performance"
    ],
    requiredSkills: ["Financial Modeling", "Excel", "Accounting Principles", "Data Analysis", "Business Intelligence"],
    salaryRange: "$65k - $110k",
    experienceLevel: "Entry to Senior"
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    category: "Business & Finance",
    description: "Develop and execute marketing strategies to promote products and services.",
    responsibilities: [
      "Create and implement marketing campaigns",
      "Analyze market trends and consumer behavior",
      "Manage marketing budget and ROI",
      "Oversee brand positioning and messaging",
      "Coordinate with sales and product teams"
    ],
    requiredSkills: ["Digital Marketing", "Brand Strategy", "Analytics", "Content Marketing", "Project Management"],
    salaryRange: "$70k - $130k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "hr-manager",
    title: "Human Resources Manager",
    category: "Business & Finance",
    description: "Oversee recruitment, employee relations, and organizational development.",
    responsibilities: [
      "Manage recruitment and onboarding processes",
      "Develop and implement HR policies",
      "Handle employee relations and conflict resolution",
      "Coordinate training and development programs",
      "Ensure compliance with labor laws"
    ],
    requiredSkills: ["Recruitment", "Employee Relations", "HR Laws", "Performance Management", "Communication"],
    salaryRange: "$75k - $125k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "business-consultant",
    title: "Business Consultant",
    category: "Business & Finance",
    description: "Provide expert advice to improve business performance and efficiency.",
    responsibilities: [
      "Analyze business operations and identify improvement areas",
      "Develop strategic recommendations and solutions",
      "Present findings to client leadership",
      "Implement change management initiatives",
      "Track and measure project outcomes"
    ],
    requiredSkills: ["Strategic Thinking", "Problem Solving", "Business Analysis", "Presentation Skills", "Change Management"],
    salaryRange: "$80k - $150k",
    experienceLevel: "Mid to Senior"
  },
  {
    id: "accountant",
    title: "Accountant",
    category: "Business & Finance",
    description: "Manage financial records and ensure accuracy of financial reporting.",
    responsibilities: [
      "Prepare and examine financial records",
      "Ensure tax compliance and filing",
      "Conduct audits and financial reviews",
      "Advise on financial strategies and cost reduction",
      "Maintain accounting systems and procedures"
    ],
    requiredSkills: ["Accounting Principles", "Tax Law", "Auditing", "Financial Software", "Attention to Detail"],
    salaryRange: "$55k - $85k",
    experienceLevel: "Entry to Senior"
  },
  {
    id: "sales-executive",
    title: "Sales Executive",
    category: "Business & Finance",
    description: "Drive revenue growth by selling products and services to clients.",
    responsibilities: [
      "Identify and pursue new business opportunities",
      "Build and maintain client relationships",
      "Present product demonstrations and proposals",
      "Negotiate contracts and close deals",
      "Meet and exceed sales targets"
    ],
    requiredSkills: ["Sales Techniques", "Negotiation", "CRM Software", "Communication", "Relationship Building"],
    salaryRange: "$50k - $120k",
    experienceLevel: "Entry to Senior"
  },

  // Creative & Media
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    category: "Creative & Media",
    description: "Create visual concepts to communicate ideas that inspire and inform.",
    responsibilities: [
      "Design graphics for marketing materials and websites",
      "Create brand identities and style guides",
      "Collaborate with clients and team members",
      "Use design software to produce final products",
      "Present design concepts to stakeholders"
    ],
    requiredSkills: ["Adobe Creative Suite", "Visual Design", "Typography", "Branding", "Creativity"],
    salaryRange: "$45k - $85k",
    experienceLevel: "Entry to Senior"
  },
  {
    id: "content-writer",
    title: "Content Writer",
    category: "Creative & Media",
    description: "Create engaging written content for various platforms and audiences.",
    responsibilities: [
      "Write articles, blog posts, and marketing copy",
      "Research topics and gather information",
      "Optimize content for SEO",
      "Edit and proofread content",
      "Collaborate with marketing teams"
    ],
    requiredSkills: ["Writing Skills", "SEO", "Research", "Editing", "Creativity"],
    salaryRange: "$40k - $75k",
    experienceLevel: "Entry to Mid"
  },
  {
    id: "video-editor",
    title: "Video Editor",
    category: "Creative & Media",
    description: "Edit and assemble recorded footage into compelling video content.",
    responsibilities: [
      "Edit raw footage into polished videos",
      "Add effects, graphics, and sound",
      "Ensure continuity and narrative flow",
      "Collaborate with directors and producers",
      "Manage video assets and archives"
    ],
    requiredSkills: ["Video Editing Software", "Storytelling", "Color Grading", "Audio Editing", "Creativity"],
    salaryRange: "$45k - $80k",
    experienceLevel: "Entry to Mid"
  },
  {
    id: "social-media-manager",
    title: "Social Media Manager",
    category: "Creative & Media",
    description: "Develop and implement social media strategies for brands.",
    responsibilities: [
      "Create and schedule social media content",
      "Engage with followers and community",
      "Analyze metrics and adjust strategies",
      "Manage social media advertising campaigns",
      "Stay updated on social media trends"
    ],
    requiredSkills: ["Social Media Platforms", "Content Creation", "Analytics", "Community Management", "Copywriting"],
    salaryRange: "$50k - $90k",
    experienceLevel: "Entry to Mid"
  },
  {
    id: "art-director",
    title: "Art Director",
    category: "Creative & Media",
    description: "Lead creative vision and design direction for projects.",
    responsibilities: [
      "Develop visual concepts and creative strategies",
      "Oversee design team and projects",
      "Present ideas to clients and stakeholders",
      "Ensure brand consistency across materials",
      "Manage budgets and timelines"
    ],
    requiredSkills: ["Creative Direction", "Leadership", "Visual Design", "Project Management", "Communication"],
    salaryRange: "$70k - $130k",
    experienceLevel: "Senior"
  }
];

/**
 * Get all unique job categories
 */
export function getJobCategories(): string[] {
  const categories = new Set(JOBS_DATABASE.map(job => job.category));
  return Array.from(categories).sort();
}

/**
 * Get jobs by category
 */
export function getJobsByCategory(category: string): JobRole[] {
  return JOBS_DATABASE.filter(job => job.category === category);
}

/**
 * Get a specific job by ID
 */
export function getJobById(id: string): JobRole | undefined {
  return JOBS_DATABASE.find(job => job.id === id);
}

/**
 * Get all jobs
 */
export function getAllJobs(): JobRole[] {
  return JOBS_DATABASE;
}
