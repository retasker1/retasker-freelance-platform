export const categories = [
  { value: "web", label: "Веб-разработка" },
  { value: "mobile", label: "Мобильная разработка" },
  { value: "design", label: "Дизайн" },
  { value: "marketing", label: "Маркетинг" },
  { value: "writing", label: "Копирайтинг" },
  { value: "translation", label: "Переводы" },
  { value: "data", label: "Анализ данных" },
  { value: "ai", label: "ИИ и машинное обучение" },
  { value: "blockchain", label: "Блокчейн" },
  { value: "other", label: "Другое" },
];

export const tagsByCategory = {
  web: [
    "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Svelte", "HTML/CSS", "JavaScript", "TypeScript",
    "Node.js", "Express", "NestJS", "PHP", "Laravel", "Symfony", "Python", "Django", "Flask",
    "Ruby", "Ruby on Rails", "Java", "Spring Boot", "C#", "ASP.NET", "Go", "Gin", "Echo",
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Vercel", "Netlify"
  ],
  mobile: [
    "React Native", "Flutter", "Xamarin", "Ionic", "Cordova", "iOS", "Android", "Swift", "Kotlin",
    "Java", "Objective-C", "Dart", "C#", "Xamarin.Forms", "Expo", "Firebase", "Push Notifications",
    "App Store", "Google Play", "Mobile UI/UX", "Responsive Design", "Cross-platform"
  ],
  design: [
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro",
    "UI Design", "UX Design", "Web Design", "Mobile Design", "Logo Design", "Branding", "Wireframing",
    "Prototyping", "User Research", "Usability Testing", "Design Systems", "Material Design", "Human Interface Guidelines"
  ],
  marketing: [
    "SEO", "SEM", "Google Ads", "Facebook Ads", "Instagram Marketing", "LinkedIn Marketing", "Content Marketing",
    "Email Marketing", "Social Media", "Analytics", "Google Analytics", "Facebook Pixel", "Conversion Optimization",
    "A/B Testing", "Lead Generation", "CRM", "Salesforce", "HubSpot", "Mailchimp", "Hootsuite"
  ],
  writing: [
    "Copywriting", "Content Writing", "Technical Writing", "Blog Writing", "SEO Writing", "Email Marketing",
    "Social Media Content", "Press Releases", "White Papers", "Case Studies", "Product Descriptions",
    "Landing Pages", "Sales Copy", "Creative Writing", "Editing", "Proofreading", "Research"
  ],
  translation: [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese",
    "Korean", "Arabic", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech",
    "Technical Translation", "Legal Translation", "Medical Translation", "Marketing Translation", "Localization"
  ],
  data: [
    "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras",
    "Jupyter", "Tableau", "Power BI", "Excel", "Google Analytics", "Machine Learning", "Deep Learning",
    "Data Visualization", "Statistics", "A/B Testing", "Data Mining", "Big Data", "Hadoop", "Spark"
  ],
  ai: [
    "Machine Learning", "Deep Learning", "Neural Networks", "TensorFlow", "PyTorch", "Keras", "Scikit-learn",
    "Natural Language Processing", "Computer Vision", "OpenAI", "GPT", "ChatGPT", "Claude", "Anthropic",
    "Python", "R", "Jupyter", "Pandas", "NumPy", "Data Science", "AI Ethics", "Model Training", "Fine-tuning"
  ],
  blockchain: [
    "Solidity", "Ethereum", "Bitcoin", "Web3", "Smart Contracts", "DeFi", "NFT", "IPFS", "Polygon",
    "Binance Smart Chain", "Cardano", "Polkadot", "Cosmos", "Hyperledger", "Truffle", "Hardhat", "Remix",
    "MetaMask", "Wallet Integration", "DApp Development", "Token Development", "Crypto Trading", "Yield Farming"
  ],
  other: [
    "Project Management", "Agile", "Scrum", "Jira", "Trello", "Asana", "Notion", "Slack", "Discord",
    "Video Editing", "Audio Editing", "3D Modeling", "Animation", "Photography", "Videography",
    "Consulting", "Training", "Coaching", "Mentoring", "Research", "Analysis", "Strategy", "Planning"
  ]
};

// Функция для получения всех уникальных тегов из всех категорий
export const getAllTags = () => {
  const allTags = new Set<string>();
  Object.values(tagsByCategory).forEach(tags => {
    tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

// Функция для получения тегов по категории
export const getTagsByCategory = (category: string) => {
  return tagsByCategory[category as keyof typeof tagsByCategory] || tagsByCategory.other;
};

// Функция для получения русского названия категории по английскому значению
export const getCategoryLabel = (categoryValue: string) => {
  const category = categories.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

// Функция для получения английского значения категории по русскому названию
export const getCategoryValue = (categoryLabel: string) => {
  const category = categories.find(cat => cat.label === categoryLabel);
  return category ? category.value : categoryLabel;
};
