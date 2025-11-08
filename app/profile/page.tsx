"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SkillInput } from "@/components/SkillInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserSkills, updateUserRole, updateUserResume } from "@/lib/firebase/realtime";
import { debounce } from "@/lib/utils/debounce";
import { normalizeSkill } from "@/lib/skills";
import { Code, Heart, DollarSign, Scale, GraduationCap, Wrench, PenTool, TrendingUp, ShieldCheck, Users, User, Briefcase, FileText, CheckCircle2, ArrowLeft } from "lucide-react";

// Career paths data (trimmed from user's provided data) with icons mapped to lucide-react components
const CAREER_PATHS = {
  technology: {
    name: "Technology & Engineering",
    icon: Code,
    color: "blue",
    roles: [
      {
        title: "Software Engineer",
        description: "Design, develop, and maintain software applications and systems.",
        responsibilities: [
          "Write clean, maintainable, and efficient code",
          "Collaborate with cross-functional teams to define and ship new features",
          "Debug and troubleshoot software issues",
          "Participate in code reviews and provide constructive feedback",
          "Stay updated with emerging technologies and best practices"
        ],
        requiredSkills: ["Programming Languages", "Data Structures", "Algorithms", "Version Control", "Software Architecture"]
      },
      {
        title: "Data Scientist",
        description: "Analyze complex data to help companies make better decisions.",
        responsibilities: [
          "Collect, clean, and preprocess large datasets",
          "Build and deploy machine learning models",
          "Create data visualizations and reports for stakeholders",
          "Conduct statistical analysis and hypothesis testing",
          "Collaborate with engineering teams to implement data solutions"
        ],
        requiredSkills: ["Python/R", "Machine Learning", "Statistics", "SQL", "Data Visualization"]
      },
      {
        title: "DevOps Engineer",
        description: "Bridge development and operations to improve deployment frequency and reliability.",
        responsibilities: [
          "Automate infrastructure provisioning and configuration",
          "Implement CI/CD pipelines",
          "Monitor system performance and reliability",
          "Manage cloud infrastructure and services",
          "Implement security best practices"
        ],
        requiredSkills: ["Linux/Unix", "Docker", "Kubernetes", "AWS/Azure/GCP", "Scripting"]
      },
      {
        title: "Product Manager",
        description: "Define product vision and strategy to deliver value to customers.",
        responsibilities: [
          "Define product roadmap and prioritize features",
          "Conduct market research and competitive analysis",
          "Gather and analyze user feedback",
          "Coordinate with engineering, design, and marketing teams",
          "Track key product metrics and KPIs"
        ],
        requiredSkills: ["Product Strategy", "Data Analysis", "User Research", "Agile/Scrum", "Communication"]
      },
      {
        title: "UX/UI Designer",
        description: "Create intuitive and engaging user experiences for digital products.",
        responsibilities: [
          "Conduct user research and usability testing",
          "Create wireframes, prototypes, and high-fidelity designs",
          "Design user interfaces following best practices",
          "Collaborate with developers to implement designs",
          "Maintain design systems and style guides"
        ],
        requiredSkills: ["Figma/Sketch", "User Research", "Prototyping", "Visual Design", "Interaction Design"]
      },
      {
        title: "Cybersecurity Analyst",
        description: "Protect organizations from cyber threats and security breaches.",
        responsibilities: [
          "Monitor networks for security breaches",
          "Conduct security assessments and penetration testing",
          "Respond to security incidents",
          "Implement security measures and policies",
          "Stay updated on latest security threats and trends"
        ],
        requiredSkills: ["Network Security", "Penetration Testing", "Security Frameworks", "Incident Response", "Cryptography"]
      }
    ]
  },
  healthcare: {
    name: "Healthcare & Medicine",
    icon: Heart,
    color: "red",
    roles: [
      {
        title: "Registered Nurse",
        description: "Provide patient care and support in various healthcare settings.",
        responsibilities: [
          "Assess patient conditions and monitor vital signs",
          "Administer medications and treatments",
          "Collaborate with physicians and healthcare team",
          "Educate patients and families on health conditions",
          "Maintain accurate medical records"
        ],
        requiredSkills: ["Patient Care", "Medical Knowledge", "Communication", "Critical Thinking", "Compassion"]
      },
      {
        title: "Physician Assistant",
        description: "Practice medicine under the supervision of physicians and surgeons.",
        responsibilities: [
          "Examine and diagnose patients",
          "Order and interpret diagnostic tests",
          "Prescribe medications and treatments",
          "Assist in surgeries and procedures",
          "Counsel patients on preventive healthcare"
        ],
        requiredSkills: ["Clinical Medicine", "Diagnostic Skills", "Patient Assessment", "Medical Ethics", "Teamwork"]
      },
      {
        title: "Medical Laboratory Technician",
        description: "Perform laboratory tests to help diagnose and treat diseases.",
        responsibilities: [
          "Collect and analyze blood, tissue, and bodily fluid samples",
          "Operate and maintain laboratory equipment",
          "Record and report test results",
          "Follow safety and quality control procedures",
          "Assist in research and development activities"
        ],
        requiredSkills: ["Laboratory Techniques", "Analytical Skills", "Attention to Detail", "Medical Knowledge", "Quality Control"]
      },
      {
        title: "Physical Therapist",
        description: "Help patients recover from injuries and improve mobility.",
        responsibilities: [
          "Evaluate patient conditions and develop treatment plans",
          "Implement therapeutic exercises and interventions",
          "Use equipment and technology for rehabilitation",
          "Monitor patient progress and adjust treatments",
          "Educate patients on injury prevention"
        ],
        requiredSkills: ["Anatomy & Physiology", "Rehabilitation Techniques", "Patient Assessment", "Manual Therapy", "Communication"]
      },
      {
        title: "Healthcare Administrator",
        description: "Manage operations and services in healthcare facilities.",
        responsibilities: [
          "Oversee daily operations of healthcare facilities",
          "Manage budgets and financial planning",
          "Ensure compliance with healthcare regulations",
          "Coordinate between departments and staff",
          "Implement policies to improve patient care quality"
        ],
        requiredSkills: ["Healthcare Management", "Financial Planning", "Regulatory Compliance", "Leadership", "Strategic Planning"]
      }
    ]
  },
  business: {
    name: "Business & Finance",
    icon: DollarSign,
    color: "green",
    roles: [
      {
        title: "Financial Analyst",
        description: "Analyze financial data to guide business decisions and investments.",
        responsibilities: [
          "Create financial models and forecasts",
          "Analyze financial statements and market trends",
          "Prepare reports and presentations for stakeholders",
          "Conduct valuation and risk analysis",
          "Monitor investment performance"
        ],
        requiredSkills: ["Financial Modeling", "Excel", "Accounting Principles", "Data Analysis", "Business Intelligence"]
      },
      {
        title: "Marketing Manager",
        description: "Develop and execute marketing strategies to promote products and services.",
        responsibilities: [
          "Create and implement marketing campaigns",
          "Analyze market trends and consumer behavior",
          "Manage marketing budget and ROI",
          "Oversee brand positioning and messaging",
          "Coordinate with sales and product teams"
        ],
        requiredSkills: ["Digital Marketing", "Brand Strategy", "Analytics", "Content Marketing", "Project Management"]
      },
      {
        title: "Human Resources Manager",
        description: "Oversee recruitment, employee relations, and organizational development.",
        responsibilities: [
          "Manage recruitment and onboarding processes",
          "Develop and implement HR policies",
          "Handle employee relations and conflict resolution",
          "Coordinate training and development programs",
          "Ensure compliance with labor laws"
        ],
        requiredSkills: ["Recruitment", "Employee Relations", "HR Laws", "Performance Management", "Communication"]
      },
      {
        title: "Business Consultant",
        description: "Provide expert advice to improve business performance and efficiency.",
        responsibilities: [
          "Analyze business operations and identify improvement areas",
          "Develop strategic recommendations and solutions",
          "Present findings to client leadership",
          "Implement change management initiatives",
          "Track and measure project outcomes"
        ],
        requiredSkills: ["Strategic Thinking", "Problem Solving", "Business Analysis", "Presentation Skills", "Change Management"]
      },
      {
        title: "Accountant",
        description: "Manage financial records and ensure accuracy of financial reporting.",
        responsibilities: [
          "Prepare and examine financial records",
          "Ensure tax compliance and filing",
          "Conduct audits and financial reviews",
          "Advise on financial strategies and cost reduction",
          "Maintain accounting systems and procedures"
        ],
        requiredSkills: ["Accounting Principles", "Tax Law", "Auditing", "Financial Software", "Attention to Detail"]
      },
      {
        title: "Sales Executive",
        description: "Drive revenue growth by selling products and services to clients.",
        responsibilities: [
          "Identify and pursue new business opportunities",
          "Build and maintain client relationships",
          "Present product demonstrations and proposals",
          "Negotiate contracts and close deals",
          "Meet and exceed sales targets"
        ],
        requiredSkills: ["Sales Techniques", "Negotiation", "CRM Software", "Communication", "Relationship Building"]
      }
    ]
  },
  legal: {
    name: "Legal & Law",
    icon: Scale,
    color: "purple",
    roles: [
      {
        title: "Corporate Lawyer",
        description: "Advise businesses on legal rights, responsibilities, and obligations.",
        responsibilities: [
          "Draft and review contracts and agreements",
          "Advise on mergers, acquisitions, and corporate restructuring",
          "Ensure regulatory compliance",
          "Represent clients in negotiations",
          "Manage legal risks and disputes"
        ],
        requiredSkills: ["Contract Law", "Corporate Law", "Legal Research", "Negotiation", "Analytical Thinking"]
      },
      {
        title: "Paralegal",
        description: "Assist lawyers in legal research, documentation, and case preparation.",
        responsibilities: [
          "Conduct legal research and gather evidence",
          "Draft legal documents and correspondence",
          "Organize and maintain case files",
          "Assist in trial preparation",
          "Communicate with clients and witnesses"
        ],
        requiredSkills: ["Legal Research", "Document Preparation", "Case Management", "Attention to Detail", "Communication"]
      },
      {
        title: "Criminal Defense Attorney",
        description: "Represent clients accused of criminal offenses in court.",
        responsibilities: [
          "Investigate case facts and gather evidence",
          "Develop defense strategies",
          "Represent clients in court proceedings",
          "Negotiate plea bargains with prosecutors",
          "Advise clients on legal options and rights"
        ],
        requiredSkills: ["Criminal Law", "Trial Advocacy", "Legal Research", "Persuasion", "Critical Thinking"]
      },
      {
        title: "Legal Compliance Officer",
        description: "Ensure organizations comply with laws and regulations.",
        responsibilities: [
          "Monitor and enforce compliance with regulations",
          "Develop and implement compliance policies",
          "Conduct risk assessments and audits",
          "Provide compliance training to staff",
          "Investigate and resolve compliance violations"
        ],
        requiredSkills: ["Regulatory Compliance", "Risk Management", "Policy Development", "Auditing", "Communication"]
      }
    ]
  },
  education: {
    name: "Education & Teaching",
    icon: GraduationCap,
    color: "yellow",
    roles: [
      {
        title: "High School Teacher",
        description: "Educate and mentor students in specific subject areas.",
        responsibilities: [
          "Plan and deliver engaging lessons",
          "Assess student progress and provide feedback",
          "Create a positive learning environment",
          "Communicate with parents and guardians",
          "Participate in curriculum development"
        ],
        requiredSkills: ["Subject Knowledge", "Classroom Management", "Communication", "Lesson Planning", "Assessment"]
      },
      {
        title: "College Professor",
        description: "Teach courses, conduct research, and publish academic work.",
        responsibilities: [
          "Teach undergraduate and graduate courses",
          "Conduct original research in field of expertise",
          "Publish research findings in academic journals",
          "Mentor and advise students",
          "Serve on academic committees"
        ],
        requiredSkills: ["Subject Expertise", "Research Methodology", "Public Speaking", "Academic Writing", "Mentorship"]
      },
      {
        title: "Instructional Designer",
        description: "Design and develop educational content and learning experiences.",
        responsibilities: [
          "Analyze learning needs and objectives",
          "Design curriculum and learning materials",
          "Develop e-learning courses and multimedia content",
          "Evaluate effectiveness of training programs",
          "Stay updated on educational technology trends"
        ],
        requiredSkills: ["Curriculum Design", "E-Learning Tools", "Learning Theories", "Project Management", "Creativity"]
      },
      {
        title: "School Counselor",
        description: "Support students' academic, career, and personal development.",
        responsibilities: [
          "Provide individual and group counseling",
          "Assist with college and career planning",
          "Address behavioral and social issues",
          "Collaborate with teachers and parents",
          "Develop intervention programs"
        ],
        requiredSkills: ["Counseling Techniques", "Active Listening", "Empathy", "Crisis Intervention", "Communication"]
      },
      {
        title: "Training and Development Specialist",
        description: "Create and deliver training programs for organizations.",
        responsibilities: [
          "Assess training needs and gaps",
          "Design and deliver training programs",
          "Develop training materials and resources",
          "Evaluate training effectiveness",
          "Manage learning management systems"
        ],
        requiredSkills: ["Training Delivery", "Adult Learning Principles", "Presentation Skills", "Assessment", "LMS Platforms"]
      }
    ]
  },
  trades: {
    name: "Skilled Trades & Construction",
    icon: Wrench,
    color: "orange",
    roles: [
      {
        title: "Electrician",
        description: "Install, maintain, and repair electrical systems and equipment.",
        responsibilities: [
          "Install electrical wiring and fixtures",
          "Troubleshoot and repair electrical issues",
          "Ensure compliance with electrical codes",
          "Read and interpret blueprints",
          "Perform safety inspections"
        ],
        requiredSkills: ["Electrical Systems", "Blueprint Reading", "Troubleshooting", "Safety Protocols", "Hand Tools"]
      },
      {
        title: "Plumber",
        description: "Install and repair plumbing systems in residential and commercial buildings.",
        responsibilities: [
          "Install pipes, fixtures, and appliances",
          "Diagnose and repair plumbing issues",
          "Read blueprints and specifications",
          "Ensure code compliance",
          "Perform preventive maintenance"
        ],
        requiredSkills: ["Plumbing Systems", "Blueprint Reading", "Problem Solving", "Physical Stamina", "Customer Service"]
      },
      {
        title: "HVAC Technician",
        description: "Install and service heating, ventilation, and air conditioning systems.",
        responsibilities: [
          "Install HVAC systems and equipment",
          "Diagnose and repair system malfunctions",
          "Perform routine maintenance",
          "Test system performance and efficiency",
          "Provide customer service and recommendations"
        ],
        requiredSkills: ["HVAC Systems", "Electrical Knowledge", "Refrigeration", "Troubleshooting", "Customer Service"]
      },
      {
        title: "Construction Manager",
        description: "Oversee construction projects from planning to completion.",
        responsibilities: [
          "Plan and coordinate construction activities",
          "Manage budgets and schedules",
          "Supervise construction workers and subcontractors",
          "Ensure safety and quality standards",
          "Communicate with clients and stakeholders"
        ],
        requiredSkills: ["Project Management", "Construction Knowledge", "Budgeting", "Leadership", "Problem Solving"]
      },
      {
        title: "Carpenter",
        description: "Construct, install, and repair structures and fixtures made of wood.",
        responsibilities: [
          "Build frameworks and structures",
          "Install cabinets, flooring, and trim",
          "Read and follow blueprints",
          "Use hand and power tools safely",
          "Ensure quality and precision in work"
        ],
        requiredSkills: ["Carpentry Techniques", "Blueprint Reading", "Precision Measurement", "Tool Proficiency", "Physical Strength"]
      }
    ]
  },
  creative: {
    name: "Creative & Media",
    icon: PenTool,
    color: "pink",
    roles: [
      {
        title: "Graphic Designer",
        description: "Create visual concepts to communicate ideas that inspire and inform.",
        responsibilities: [
          "Design graphics for marketing materials and websites",
          "Create brand identities and style guides",
          "Collaborate with clients and team members",
          "Use design software to produce final products",
          "Present design concepts to stakeholders"
        ],
        requiredSkills: ["Adobe Creative Suite", "Visual Design", "Typography", "Branding", "Creativity"]
      },
      {
        title: "Content Writer",
        description: "Create engaging written content for various platforms and audiences.",
        responsibilities: [
          "Write articles, blog posts, and marketing copy",
          "Research topics and gather information",
          "Optimize content for SEO",
          "Edit and proofread content",
          "Collaborate with marketing teams"
        ],
        requiredSkills: ["Writing Skills", "SEO", "Research", "Editing", "Creativity"]
      },
      {
        title: "Video Editor",
        description: "Edit and assemble recorded footage into compelling video content.",
        responsibilities: [
          "Edit raw footage into polished videos",
          "Add effects, graphics, and sound",
          "Ensure continuity and narrative flow",
          "Collaborate with directors and producers",
          "Manage video assets and archives"
        ],
        requiredSkills: ["Video Editing Software", "Storytelling", "Color Grading", "Audio Editing", "Creativity"]
      },
      {
        title: "Social Media Manager",
        description: "Develop and implement social media strategies for brands.",
        responsibilities: [
          "Create and schedule social media content",
          "Engage with followers and community",
          "Analyze metrics and adjust strategies",
          "Manage social media advertising campaigns",
          "Stay updated on social media trends"
        ],
        requiredSkills: ["Social Media Platforms", "Content Creation", "Analytics", "Community Management", "Copywriting"]
      },
      {
        title: "Art Director",
        description: "Lead creative vision and design direction for projects.",
        responsibilities: [
          "Develop visual concepts and creative strategies",
          "Oversee design team and projects",
          "Present ideas to clients and stakeholders",
          "Ensure brand consistency across materials",
          "Manage budgets and timelines"
        ],
        requiredSkills: ["Creative Direction", "Leadership", "Visual Design", "Project Management", "Communication"]
      }
    ]
  },
  sales: {
    name: "Sales & Customer Service",
    icon: TrendingUp,
    color: "indigo",
    roles: [
      {
        title: "Retail Sales Associate",
        description: "Assist customers with purchases and provide excellent service.",
        responsibilities: [
          "Greet and assist customers on sales floor",
          "Process transactions and handle payments",
          "Maintain product knowledge and inventory",
          "Handle customer inquiries and complaints",
          "Meet individual sales goals"
        ],
        requiredSkills: ["Customer Service", "Sales Techniques", "Product Knowledge", "Communication", "POS Systems"]
      },
      {
        title: "Customer Success Manager",
        description: "Ensure customers achieve desired outcomes using products or services.",
        responsibilities: [
          "Onboard new customers and provide training",
          "Build strong customer relationships",
          "Monitor customer health and engagement",
          "Identify upsell and cross-sell opportunities",
          "Advocate for customer needs internally"
        ],
        requiredSkills: ["Relationship Management", "Problem Solving", "Product Knowledge", "Communication", "Analytics"]
      },
      {
        title: "Call Center Representative",
        description: "Handle inbound and outbound calls to assist customers.",
        responsibilities: [
          "Answer customer calls and inquiries",
          "Resolve customer issues and complaints",
          "Process orders and provide information",
          "Document call details in CRM system",
          "Meet performance metrics and quality standards"
        ],
        requiredSkills: ["Communication", "Active Listening", "Problem Solving", "Computer Skills", "Patience"]
      },
      {
        title: "Account Executive",
        description: "Manage client accounts and drive revenue growth.",
        responsibilities: [
          "Develop new business opportunities",
          "Manage existing client relationships",
          "Create proposals and presentations",
          "Negotiate contracts and pricing",
          "Collaborate with internal teams to deliver solutions"
        ],
        requiredSkills: ["Sales Strategy", "Account Management", "Negotiation", "CRM Software", "Presentation Skills"]
      }
    ]
  },
  public: {
    name: "Public Service & Government",
    icon: ShieldCheck,
    color: "teal",
    roles: [
      {
        title: "Police Officer",
        description: "Protect citizens, enforce laws, and maintain public safety.",
        responsibilities: [
          "Patrol designated areas and respond to calls",
          "Enforce laws and investigate crimes",
          "Make arrests and issue citations",
          "Testify in court proceedings",
          "Build community relationships"
        ],
        requiredSkills: ["Law Enforcement", "Physical Fitness", "Communication", "Critical Thinking", "Integrity"]
      },
      {
        title: "Social Worker",
        description: "Help individuals and families cope with challenges in their lives.",
        responsibilities: [
          "Assess client needs and situations",
          "Develop and implement intervention plans",
          "Connect clients with community resources",
          "Advocate for client rights and services",
          "Maintain case documentation and records"
        ],
        requiredSkills: ["Counseling", "Case Management", "Empathy", "Communication", "Crisis Intervention"]
      },
      {
        title: "Firefighter",
        description: "Respond to fires and emergencies to protect lives and property.",
        responsibilities: [
          "Respond to fire and emergency calls",
          "Operate firefighting equipment and vehicles",
          "Conduct fire prevention inspections",
          "Provide emergency medical care",
          "Participate in training and drills"
        ],
        requiredSkills: ["Firefighting Techniques", "Physical Fitness", "Teamwork", "Emergency Response", "Problem Solving"]
      },
      {
        title: "Urban Planner",
        description: "Develop plans and programs for land use in communities.",
        responsibilities: [
          "Analyze community needs and demographics",
          "Develop zoning and land use plans",
          "Review development proposals",
          "Conduct public meetings and hearings",
          "Collaborate with government officials and developers"
        ],
        requiredSkills: ["Urban Planning", "GIS Software", "Policy Analysis", "Public Speaking", "Project Management"]
      },
      {
        title: "Policy Analyst",
        description: "Research and analyze policies to inform government decisions.",
        responsibilities: [
          "Research policy issues and options",
          "Analyze data and evaluate policy impacts",
          "Write reports and policy briefs",
          "Present findings to stakeholders",
          "Monitor policy implementation"
        ],
        requiredSkills: ["Policy Analysis", "Research Methods", "Data Analysis", "Writing", "Critical Thinking"]
      }
    ]
  },
  science: {
    name: "Science & Research",
    icon: Users,
    color: "cyan",
    roles: [
      {
        title: "Research Scientist",
        description: "Conduct research to advance knowledge in scientific fields.",
        responsibilities: [
          "Design and conduct experiments",
          "Analyze and interpret research data",
          "Write research papers and grant proposals",
          "Present findings at conferences",
          "Collaborate with other researchers"
        ],
        requiredSkills: ["Research Methodology", "Data Analysis", "Scientific Writing", "Critical Thinking", "Laboratory Techniques"]
      },
      {
        title: "Environmental Scientist",
        description: "Study and protect the environment and human health.",
        responsibilities: [
          "Conduct environmental assessments",
          "Collect and analyze environmental samples",
          "Develop conservation and remediation plans",
          "Ensure compliance with environmental regulations",
          "Educate public on environmental issues"
        ],
        requiredSkills: ["Environmental Science", "Field Research", "Data Analysis", "Regulatory Knowledge", "Problem Solving"]
      },
      {
        title: "Biomedical Engineer",
        description: "Design medical devices and equipment to improve healthcare.",
        responsibilities: [
          "Design and develop medical devices",
          "Test prototypes and ensure safety",
          "Collaborate with healthcare professionals",
          "Document design processes and specifications",
          "Stay updated on medical technology advances"
        ],
        requiredSkills: ["Engineering Principles", "CAD Software", "Biomechanics", "Problem Solving", "Regulatory Compliance"]
      },
      {
        title: "Chemist",
        description: "Study substances and develop new products and processes.",
        responsibilities: [
          "Conduct chemical experiments and analyses",
          "Develop new chemical products and processes",
          "Ensure quality control of products",
          "Document findings and maintain lab records",
          "Follow safety protocols and regulations"
        ],
        requiredSkills: ["Chemistry Knowledge", "Laboratory Techniques", "Analytical Skills", "Attention to Detail", "Safety Protocols"]
      }
    ]
  }
};


export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleRequirements, setRoleRequirements] = useState<{
    requiredSkills: string[];
    description: string;
    responsibilities: string[];
  } | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("skills");

  // Initialize from userProfile
  useEffect(() => {
    if (userProfile && !isInitialized) {
      setUserSkills(userProfile.skills || []);
      setSelectedRole(userProfile.selectedRole || null);
      setRoleRequirements(userProfile.roleRequirements || null);
      setResumeText(userProfile.resumeText || "");
      setIsInitialized(true);
    }
  }, [userProfile, isInitialized]);

  // Debounced update functions
  const debouncedUpdateSkills = useMemo(
    () =>
      debounce(async (skills: string[]) => {
        if (user) {
          await updateUserSkills(user.uid, skills);
        }
      }, 1000),
    [user]
  );

  const debouncedUpdateResume = useMemo(
    () =>
      debounce(async (text: string) => {
        if (user) {
          await updateUserResume(user.uid, text);
        }
      }, 1000),
    [user]
  );

  // Update Firestore with debounce
  useEffect(() => {
    if (user && isInitialized && userSkills.length >= 0) {
      debouncedUpdateSkills(userSkills);
    }
  }, [userSkills, user, isInitialized, debouncedUpdateSkills]);

  useEffect(() => {
    if (user && isInitialized && resumeText) {
      debouncedUpdateResume(resumeText);
    }
  }, [resumeText, user, isInitialized, debouncedUpdateResume]);

  const handleSkillsChange = useCallback((skills: string[]) => {
    setUserSkills(skills);
  }, []);

  // New helper to select a role from the local CAREER_PATHS data (no fetch)
  const selectRoleFromData = async (roleObj: any) => {
    const title = roleObj.title;
    const requirements = {
      requiredSkills: roleObj.requiredSkills || [],
      description: roleObj.description || "",
      responsibilities: roleObj.responsibilities || [],
    };
    setSelectedRole(title);
    setRoleRequirements(requirements);
    if (user) {
      try {
        await updateUserRole(user.uid, title, requirements);
      } catch (err) {
        console.error("Error saving selected role:", err);
      }
    }
  };

  const handleResumeParsed = useCallback((text: string) => {
    setResumeText(text);
  }, []);

  const handleSkillsExtracted = useCallback((skills: string[]) => {
    setUserSkills((prev) => {
      const allSkills = [...prev, ...skills];
      const normalizedSkills = allSkills.map(normalizeSkill);
      return Array.from(new Set(normalizedSkills));
    });
    setActiveTab("skills");
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
          <p className="text-foreground/70">
            Manage your skills, target role, and resume to personalize your experience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Target Role
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>
                  Add your technical and professional skills. You can also upload your resume to auto-extract skills.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillInput skills={userSkills} onSkillsChange={handleSkillsChange} />
                {userSkills.length > 0 && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-foreground/80">
                      {userSkills.length} skill{userSkills.length !== 1 ? "s" : ""} saved
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Target Role</CardTitle>
                <CardDescription>
                  Select your target role to see personalized requirements and gap analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Industry list or drill-down to a single industry's roles */}
                {!selectedIndustry ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(CAREER_PATHS).map(([key, path]) => {
                      const Icon = path.icon;
                      return (
                        <div
                          key={key}
                          className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                          onClick={() => setSelectedIndustry(key)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md bg-gray-100 dark:bg-gray-800`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{path.name}</h4>
                              <p className="text-sm text-foreground/70">{(path.roles || []).length} roles</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    const path = (CAREER_PATHS as any)[selectedIndustry!];
                    if (!path) return <div className="text-sm">No data for this industry.</div>;
                    const Icon = path.icon;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <button
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setSelectedIndustry(null)}
                            aria-label="Back to industries"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md bg-gray-100 dark:bg-gray-800`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{path.name}</h4>
                              <p className="text-sm text-foreground/70">{(path.roles || []).length} roles</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(path.roles || []).map((role: any) => (
                            <Button
                              key={role.title}
                              variant={selectedRole === role.title ? "default" : "outline"}
                              onClick={() => selectRoleFromData(role)}
                              className="h-auto py-2 px-3 text-sm"
                            >
                              {role.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}

                {selectedRole && roleRequirements && (
                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h3 className="font-semibold mb-2">{selectedRole}</h3>
                    <p className="text-sm text-foreground/70 mb-3">{roleRequirements.description}</p>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(roleRequirements?.requiredSkills ?? []).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-500/20 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Upload</CardTitle>
                <CardDescription>
                  Upload your resume to extract skills and text. The resume will be saved to your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUpload
                  onResumeParsed={handleResumeParsed}
                  onSkillsExtracted={handleSkillsExtracted}
                  resumeText={resumeText}
                  selectedRole={selectedRole}
                />
                {resumeText && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="font-semibold mb-2">Resume Text Extracted</h3>
                    <p className="text-sm text-foreground/70 line-clamp-3">{resumeText.substring(0, 200)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 glass-effect rounded-lg">
          <h3 className="font-semibold mb-2">Profile Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-foreground/70">Skills:</span>{" "}
              <span className="font-medium">{userSkills.length}</span>
            </div>
            <div>
              <span className="text-foreground/70">Target Role:</span>{" "}
              <span className="font-medium">{selectedRole || "Not set"}</span>
            </div>
            <div>
              <span className="text-foreground/70">Resume:</span>{" "}
              <span className="font-medium">{resumeText ? "Uploaded" : "Not uploaded"}</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
