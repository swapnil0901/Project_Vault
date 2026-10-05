import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './db.js'

dotenv.config()

const academicYear = '2025-2026'
const department = 'Computer Science & Engineering'
const college = 'N. B. Navale Sinhgad College of Engineering, Solapur'

const projects = [
  {
    projectCode: 'PV001',
    name: 'AgroCare - An Integrated ML System for Plant Disease Recommendation and Price Prediction',
    description: 'An integrated agricultural decision-support system combining plant disease detection, crop recommendation, and crop price forecasting. The source describes early leaf-image disease identification, recommendations based on soil NPK, pH, and climate, and time-series analysis of historical market prices to help farmers choose crops and selling times.',
    abstract: 'AgroCare combines machine learning, image processing, and data analysis to reduce uncertainty in farming, support sustainable agriculture, and improve farmer outcomes. The OCR also refers to the project as Smart AgroCare.',
    problemStatement: 'Farmers often rely on manual observation and experience while facing disease, soil, climate, and market uncertainty. These factors can reduce crop yield and profitability.',
    solution: 'Provide one web application for leaf disease detection, crop recommendation from soil and climate inputs, and historical-price forecasting. IoT and mobile deployment are mentioned as future enhancements, not delivered features.',
    type: 'Agriculture / Machine Learning',
    tech: ['Deep Learning', 'Image Processing', 'NPK and pH inputs', 'Weather data', 'Time-Series Forecasting'],
    tags: ['agriculture', 'machine-learning', 'plant-disease', 'crop-recommendation', 'price-prediction'],
    mentor: '',
    students: [],
    tasks: ['Collect and prepare leaf-image, soil, weather, and market-price datasets', 'Develop disease detection and crop recommendation modules', 'Build and evaluate historical crop-price forecasting'],
  },
  {
    projectCode: 'PV002',
    name: 'CarbonMeter - AI-Based Carbon Footprint Tracker',
    description: 'A full-stack application to track, analyse, predict, and reduce personal carbon emissions. It covers transport, household energy, food, shopping, and waste; interactive emission charts; AI-based predictions using Llama 3; virtual IoT logging; carbon avatars and achievements; carbon-credit tokens using Ethers.js; a community feed, leaderboard, and downloadable reports.',
    abstract: 'CarbonMeter aims to turn carbon tracking into a continued activity by combining footprint calculation, personalised AI suggestions, gamification, community features, and a carbon-credit token system. The report presents the system as a response to limited awareness and static, one-time carbon calculators.',
    problemStatement: 'People have limited access to practical tools for measuring and understanding emissions from daily activities. Existing calculators often provide little personalised insight or incentive for continued engagement.',
    solution: 'Offer a web platform for activity-based carbon calculations, historical analysis, AI-supported predictions and suggestions, virtual data logging, community engagement, and carbon-credit tracking.',
    type: 'Climate / Sustainability / AI',
    tech: ['Next.js 14', 'TypeScript', 'React 18', 'Supabase', 'Tailwind CSS', 'Radix UI', 'Recharts', 'Llama 3', 'Ethers.js'],
    tags: ['carbon-footprint', 'sustainability', 'climate', 'ai', 'iot', 'carbon-credits'],
    mentor: 'Prof. Amruta D. Ruikar',
    students: [
      { name: 'Ms. Rathod Pooja Vilas', rollNo: '17' },
      { name: 'Ms. Patil Vaishnavi Sudhakar', rollNo: '18' },
      { name: 'Mr. Waghmare Yash Dattatray', rollNo: '19' },
      { name: 'Ms. Kamble Vaishnavi Ashok', rollNo: '20' },
    ],
    tasks: ['Implement activity-based emissions calculation for transport, energy, food, shopping, and waste', 'Build emissions analysis, AI prediction, and personalised reduction suggestions', 'Add virtual IoT logging, community features, achievements, and carbon-credit tracking'],
  },
  {
    projectCode: 'PV003',
    name: 'ShopSage - Intelligent E-commerce Buyer Assistant',
    description: 'An e-commerce decision-support system that analyses customer reviews and price trends. The OCR describes sentiment classification into positive, negative, and neutral categories, automatic review summarisation, and time-series price forecasting to help users evaluate products and purchase timing.',
    abstract: 'ShopSage combines qualitative review analysis with quantitative price forecasting to turn product information into concise consumer insights and reduce the effort of comparing products manually.',
    problemStatement: 'Consumers face information overload from large volumes of reviews, ratings, and changing prices. Star ratings and manually reading reviews may be insufficient, time-consuming, or misleading.',
    solution: 'Analyse review sentiment, summarise recurring feedback, and forecast price trends in a unified decision-support interface.',
    type: 'E-Commerce / NLP / Machine Learning',
    tech: ['Natural Language Processing', 'Sentiment Analysis', 'Review Summarisation', 'Time-Series Forecasting', 'Data Visualisation'],
    tags: ['ecommerce', 'reviews', 'sentiment-analysis', 'summarisation', 'price-forecasting'],
    mentor: 'Prof. L. C. Maindargi',
    students: [
      { name: 'Mr. Aditya Ashok Boddu', rollNo: '60' },
      { name: 'Mr. Kirtan Dhanraj Karwa', rollNo: '61' },
      { name: 'Mr. Paras Vishal Dhajal', rollNo: '62' },
      { name: 'Mr. Sagar Jagdish Hulle', rollNo: '63' },
    ],
    tasks: ['Collect and analyse product review and historical price data', 'Implement sentiment classification and review summarisation', 'Develop price forecasting and a combined product-insights view'],
  },
  {
    projectCode: 'PV004',
    name: 'WhatsApp Chat Analyzer',
    description: 'A data-driven application for analysing exported WhatsApp conversations. Reported analysis includes message statistics, word frequency, emoji usage, sentiment, timelines, user behaviour, and interaction patterns, presented through visual and textual summaries.',
    abstract: 'The project aims to process chat data into understandable patterns and demonstrate the use of data analytics, visualisation, and machine learning for personal or research analysis.',
    problemStatement: 'Manually reviewing large chat histories to find communication trends and meaningful statistics is time-consuming.',
    solution: 'Process an exported chat dataset and present message, word, emoji, sentiment, and timeline analyses.',
    type: 'Data Analytics / NLP',
    tech: ['Data Analytics', 'Data Visualisation', 'Sentiment Analysis', 'Machine Learning'],
    tags: ['whatsapp', 'chat-analysis', 'sentiment-analysis', 'visualisation'],
    mentor: 'Prof. A. G. Gund',
    students: [{ name: 'Mr. Deepak Parameshwar Nagur', rollNo: '37' }],
    tasks: ['Parse exported chat data and calculate message and participant statistics', 'Implement word-frequency, emoji, and sentiment analysis', 'Create timeline and interaction visualisations'],
  },
  {
    projectCode: 'PV005',
    name: 'CyberSentinel - Automated Vulnerability Scanner and Security Report Generator',
    description: 'A web-based vulnerability-scanning system for websites and network targets. The report describes web checks for HTTP headers, server information exposure, and error messages; network scans using Nmap; severity classification; and reports containing vulnerability descriptions and suggested remedies.',
    abstract: 'CyberSentinel is intended to help users identify security weaknesses early through a simple interface for initiating scans and reviewing findings. The OCR lists Python with Flask, HTML, CSS, SQLite, Nmap, and ReportLab.',
    problemStatement: 'Web applications and network systems can expose open ports, missing security headers, server details, and other weaknesses that may go unnoticed without regular testing.',
    solution: 'Provide authorised web and network scans, classify findings by severity, store scan history, and generate PDF or HTML reports with remediation guidance.',
    type: 'Cybersecurity',
    tech: ['Python', 'Flask', 'HTML', 'CSS', 'SQLite', 'Nmap', 'ReportLab'],
    tags: ['cybersecurity', 'vulnerability-scanning', 'network-security', 'security-reporting'],
    mentor: 'Prof. S. S. Shelke',
    students: [],
    tasks: ['Implement target input and web or network scan workflows', 'Classify scan findings and add remediation descriptions', 'Store scan history and generate PDF or HTML reports'],
  },
  {
    projectCode: 'PV006',
    name: 'Nirbhaya - A Smart Mobile Application for Women Safety',
    description: 'A smart mobile application project focused on women’s safety and emergency assistance.',
    abstract: 'The supplied OCR identifies the project title, final-year student team, and guide, but does not reliably expose further feature or technology details. No additional capabilities are inferred here.',
    problemStatement: '',
    solution: 'Develop a mobile application for women’s safety. Specific workflows and implementation details were not legible in the supplied OCR.',
    type: 'Mobile Application / Safety',
    tech: ['Mobile Application'],
    tags: ['women-safety', 'mobile-application'],
    mentor: 'Prof. A. G. Gund',
    students: [
      { name: 'Ms. Vaibhavi Vivek Belamkar', rollNo: '25' },
      { name: 'Ms. Asawari Anand Jambhale', rollNo: '26' },
      { name: 'Ms. Laya Arvind Kokkul', rollNo: '27' },
      { name: 'Ms. Teja Vasant Shevale', rollNo: '28' },
    ],
    tasks: ['Confirm safety workflows and user requirements from the complete report', 'Implement the mobile application features specified in the report', 'Test safety workflows and document verified behaviour'],
  },
  {
    projectCode: 'PV007',
    name: 'Cloud Ready Billing Software for Retail Shop',
    description: 'A cloud-ready retail billing application intended to combine persistent cloud data with a local interface and cloud synchronisation. The OCR describes a streamlined billing tool for shop owners, cashiers, and administrators, with a planned 12-week development timeline.',
    abstract: 'The project addresses limitations of existing billing systems and seeks a cloud-agnostic, dual-mode web application accessible through a browser while preserving a local interface and cloud data synchronisation.',
    problemStatement: 'Retail billing systems may introduce complexity, latency, and connectivity concerns, while shop owners need a reliable and flexible billing workflow.',
    solution: 'Build a browser-accessible billing application with local operation and cloud synchronisation. The OCR mentions JDBC and support for MySQL, Firebase, and MongoDB; the exact final configuration is unclear.',
    type: 'Retail / Cloud Software',
    tech: ['Web Application', 'JDBC', 'MySQL', 'Firebase', 'MongoDB'],
    tags: ['retail', 'billing', 'cloud', 'point-of-sale'],
    mentor: '',
    students: [],
    tasks: ['Define the billing workflow and local/cloud data requirements', 'Implement billing and database synchronisation workflows', 'Test connectivity, persistence, and billing operations'],
  },
  {
    projectCode: 'PV008',
    name: 'NavRail - An Integrated Platform by Using AI',
    description: 'An AI-assisted railway information platform intended to bring railway-related services together. OCR-supported features include train and platform information, ticket-related guidance, station navigation assistance, and responses to passenger queries.',
    abstract: 'The project seeks to make railway travel easier by consolidating information and providing intelligent assistance through an interactive web platform.',
    problemStatement: 'Passengers often rely on multiple sources, enquiry counters, and public announcements for train updates, platform details, and navigation, which can be confusing or delayed.',
    solution: 'Provide a unified railway information interface with AI-assisted passenger query support and access to travel information.',
    type: 'Transportation / Artificial Intelligence',
    tech: ['React.js', 'Node.js', 'Express.js', 'Artificial Intelligence'],
    tags: ['railway', 'transportation', 'passenger-information', 'ai'],
    mentor: '',
    students: [],
    tasks: ['Gather railway information and passenger query requirements', 'Implement railway information and AI-assisted query workflows', 'Validate passenger responses and station-navigation information'],
  },
  {
    projectCode: 'PV009',
    name: 'CareFusion - A Unified Platform for Intelligent Patient Care',
    description: 'A unified healthcare platform concept covering hospital administration, pharmacy management, appointments, electronic prescriptions, inventory management, and predictive analytics.',
    abstract: 'The supplied OCR describes a modular, patient-centred system intended to connect patients and hospital administrators, reduce waiting times, anticipate medicine demand, and support clinical decisions. More detailed pages were not legible.',
    problemStatement: 'Healthcare workflows can be fragmented across hospital administration, appointments, prescriptions, and pharmacy inventory.',
    solution: 'Bring the described patient-care and hospital workflows into one platform with role-based access and analytics. Specific implementation details require the original report.',
    type: 'Healthcare / Artificial Intelligence',
    tech: ['Web Platform', 'Predictive Analytics'],
    tags: ['healthcare', 'patient-care', 'hospital-management', 'pharmacy'],
    mentor: '',
    students: [],
    tasks: ['Confirm user roles and healthcare workflows from the complete report', 'Model appointment, prescription, and pharmacy inventory data', 'Implement and validate the described patient-care workflows'],
  },
  {
    projectCode: 'PV010',
    name: 'ConstitutionGPT - AI Powered Law Guide',
    description: 'An AI-powered legal information guide focused on constitutional and law-related assistance.',
    abstract: 'The OCR reliably provides the project title, team roll numbers, and guide name, but the detailed project pages were marked unreadable. Features, datasets, and implementation technologies are therefore not inferred.',
    problemStatement: '',
    solution: 'Provide an AI-powered law guide. Specific legal coverage and system behaviour require transcription from the original report.',
    type: 'Legal Technology / Artificial Intelligence',
    tech: ['Artificial Intelligence'],
    tags: ['law', 'constitution', 'legal-technology', 'ai'],
    mentor: 'Prof. H. T. Gurme',
    students: [],
    tasks: ['Transcribe the project requirements and supported legal topics', 'Implement the verified law-guide workflows', 'Test responses against the documented project scope'],
  },
  {
    projectCode: 'PV011',
    name: 'Sign Language Conversion Using AI',
    description: 'An AI-based sign-language conversion project intended to support communication through sign-language recognition and conversion.',
    abstract: 'The supplied OCR exposes a project cover page and subsequent technical text, but the title, team names, and some technical passages are corrupted. The project is retained with only the reliably recoverable subject and purpose.',
    problemStatement: '',
    solution: 'Develop sign-language recognition and conversion support. The exact language, direction of conversion, and model details need checking against the original PDF.',
    type: 'Accessibility / Artificial Intelligence',
    tech: ['Artificial Intelligence', 'Sign Language Recognition'],
    tags: ['sign-language', 'accessibility', 'ai'],
    mentor: '',
    students: [],
    tasks: ['Confirm supported sign language and conversion direction from the original report', 'Prepare the documented sign-language data and recognition workflow', 'Evaluate recognition and conversion against the verified scope'],
  },
  {
    projectCode: 'PV012',
    name: 'Unlocking Real Estate - A Platform to Overcome Discovery and Broker Challenges',
    description: 'A digital property platform concept focused on verified listings, personalised discovery, and direct connections between genuine buyers and sellers.',
    abstract: 'The OCR describes AI-driven recommendations, real-time data management, cloud hosting, secure property verification, and advanced search as intended platform capabilities.',
    problemStatement: 'Property information can be fragmented across platforms, inaccurate or duplicated, and difficult to verify. Buyers and sellers may also face broker-related costs and inefficiencies.',
    solution: 'Create a platform for verified property information, advanced discovery, recommendations, and direct buyer-seller connections.',
    type: 'Real Estate Technology',
    tech: ['AI Recommendations', 'Real-Time Data Management', 'Cloud Hosting'],
    tags: ['real-estate', 'property-discovery', 'verification', 'recommendations'],
    mentor: '',
    students: [],
    tasks: ['Define property verification and buyer/seller workflows', 'Implement property discovery, search, and recommendation features', 'Validate listing quality and direct-contact workflows'],
  },
  {
    projectCode: 'PV013',
    name: 'Evaluating Students’ Descriptive Answers Using NLP and Artificial Neural Networks',
    description: 'An educational assessment project that evaluates descriptive answers using Natural Language Processing and Artificial Neural Networks.',
    abstract: 'The supplied OCR describes subjective manual evaluation as time-consuming and inconsistent at scale, and proposes automated assessment of descriptive answers and multiple-choice questions. The project title and portions of the introduction are recoverable; detailed model results are not.',
    problemStatement: 'Manual evaluation of large numbers of student answers requires substantial time and can vary between evaluators.',
    solution: 'Apply NLP and neural-network methods to assess student answers. Exact model architecture, datasets, and measured accuracy were not legible in the supplied OCR.',
    type: 'Education Technology / NLP / Neural Networks',
    tech: ['Natural Language Processing', 'Artificial Neural Networks', 'Machine Learning'],
    tags: ['education', 'answer-evaluation', 'nlp', 'artificial-neural-networks'],
    mentor: '',
    students: [],
    tasks: ['Confirm question formats, evaluation criteria, and datasets from the full report', 'Implement the documented NLP and neural-network evaluation pipeline', 'Evaluate scoring consistency against the report’s stated methodology'],
  },
  {
    projectCode: 'PV014',
    name: 'College Grievance Redressal System',
    description: 'A centralised system for the grievance lifecycle with a student dashboard for filing complaints, attaching evidence, and tracking status; a faculty and department portal for review and updates; and an administration dashboard for oversight and analytics.',
    abstract: 'The OCR also describes automated classification, fraud detection, and Grievance Resolution Log (GRL) credit management. The intended result is improved transparency and reduced resolution delays in academic institutions.',
    problemStatement: 'Paper-based and manual grievance mechanisms can fragment complaint handling, delay resolutions, and make progress difficult to track.',
    solution: 'Consolidate complaint submission, evidence, status tracking, staff review, administration, classification, fraud detection, and resolution records.',
    type: 'Education / Grievance Management',
    tech: ['React.js', 'Node.js', 'Firebase', 'Python ML Services'],
    tags: ['college', 'grievance', 'student-services', 'classification', 'fraud-detection'],
    mentor: 'Prof. S. S. Shelke',
    students: [],
    tasks: ['Implement student grievance filing, evidence, and status tracking', 'Build faculty review and administrator oversight workflows', 'Integrate and validate classification, fraud detection, and GRL records'],
  },
  {
    projectCode: 'PV015',
    name: 'SPARTAN AI - An Intelligent Orchestration System for Multi-Domain AI Assistants',
    description: 'An AI personal-companion platform with specialised assistants for fitness, professional communication, software development, content creation, and financial planning. The OCR describes 11+ prebuilt companions, custom companions, conversation memory, encrypted storage, streamed responses, multiple AI models, Razorpay subscriptions, and a multi-companion orchestrator.',
    abstract: 'SPARTAN AI aims to provide personalised, context-aware assistance through specialised companions and coordinated responses. The report lists Next.js, React, TypeScript, Convex, Google OAuth, AES-GCM encryption, and multiple language-model providers.',
    problemStatement: 'Users need specialised AI help across domains while preserving useful conversation context and managing privacy, model choice, and service access.',
    solution: 'Provide domain-specific and user-created assistants, automatic memory, encrypted data, streaming and multi-model responses, subscriptions, and orchestration across assistants.',
    type: 'Artificial Intelligence / Personal Assistant',
    tech: ['Next.js', 'React', 'TypeScript', 'Convex', 'Google OAuth', 'AES-GCM', 'Razorpay', 'Multi-Model AI'],
    tags: ['spartan-ai', 'ai-companion', 'orchestration', 'memory', 'encryption'],
    mentor: 'Prof. Sunil S. Shakapure',
    students: [
      { name: 'Uday Kishor More', rollNo: '' },
      { name: 'Bhargav Govind Katkam', rollNo: '' },
      { name: 'Rohit Dattatraya Shalgar', rollNo: '' },
      { name: 'Anuja Suresh Narsale', rollNo: '' },
    ],
    tasks: ['Implement specialised and user-created AI companion workflows', 'Add conversation memory, encryption, and streaming multi-model responses', 'Build orchestrator, subscription, and payment workflows'],
  },
  {
    projectCode: 'PV016',
    name: 'AI-Based Interview Preparation and Performance Evaluation',
    description: 'An AI interview preparation platform described as providing personalised mock interview sessions, domain-specific questions, voice-based answers, and performance feedback.',
    abstract: 'The OCR identifies speech-to-text (STT), text-to-speech (TTS), GPT-4-generated questions, personalised interview practice, performance reports, and feedback on communication, confidence, and readiness. It describes candidate responses being evaluated with NLP in real time.',
    problemStatement: 'Traditional interview preparation may rely on generic questions and limited structured feedback, making it difficult for candidates to practise realistic interviews and assess performance.',
    solution: 'Generate domain-specific interview questions, accept spoken answers, evaluate responses, and return structured performance feedback. Exact implementation technologies beyond GPT-4, STT, and TTS were not reliably legible.',
    type: 'Education / Interview Preparation / AI',
    tech: ['GPT-4', 'Speech-to-Text (STT)', 'Text-to-Speech (TTS)', 'Natural Language Processing'],
    tags: ['interview-preparation', 'mock-interview', 'speech', 'nlp', 'ai'],
    mentor: '',
    students: [],
    tasks: ['Implement domain-specific mock interview question generation', 'Integrate speech input, transcription, and spoken question playback', 'Evaluate responses and generate structured interview performance feedback'],
  },
  {
    projectCode: 'PV017',
    name: 'InternStatus - Easy and Intelligent Internship Ecosystem',
    description: 'A role-based internship platform connecting students, faculty, companies, mentors, colleges, and administrators. OCR-supported student features include profiles, skill-based recommendations, one-click applications, and status tracking; faculty can monitor progress and ABC credits; companies can post verified opportunities and manage applicants; mentors can track interns and provide feedback; college and admin roles manage institutional records and platform integrity.',
    abstract: 'InternStatus aims to centralise the internship lifecycle and replace fragmented applications, manual tracking, and scattered company workflows. The report references the National Education Policy and Academic Bank of Credits, as well as ML-based fraud detection, resume-to-internship matching, and recommendations.',
    problemStatement: 'Internship applications and progress records are fragmented, faculty tracking is manual, company applications are scattered, and fraudulent postings can put students at risk.',
    solution: 'Provide role-based dashboards and workflows for internship discovery, applications, verification, progress review, mentoring, ABC updates, and administration.',
    type: 'Education / Internship Management',
    tech: ['Node.js', 'Express.js', 'MongoDB', 'HTML', 'CSS', 'JavaScript', 'React.js', 'JWT', 'Machine Learning'],
    tags: ['internships', 'education', 'abc-credits', 'fraud-detection', 'recommendations'],
    mentor: '',
    students: [],
    tasks: ['Implement role-based student, faculty, company, mentor, college, and admin workflows', 'Build verified internship listings, applications, recommendations, and progress tracking', 'Integrate fraud detection, resume matching, and ABC-credit management'],
  },
  {
    projectCode: 'PV018',
    name: 'AyurSutra - Panchakarma Patient Management and Therapy Scheduling Software',
    description: 'A web-based system for managing Panchakarma patient records, therapy schedules, appointments, and treatment progress in Ayurvedic clinics.',
    abstract: 'The OCR describes patient, practitioner, and administrator roles; appointment management and reminders; pre- and post-therapy precaution alerts through SMS, email, or in-app notifications; real-time dashboards; patient feedback; and practitioner access to patient data and treatment updates. The OCR text is incomplete, so further technical details are not inferred.',
    problemStatement: 'Manual therapy and patient-record management can lead to overlapping appointments, weak patient communication, and limited real-time treatment tracking.',
    solution: 'Provide an organised platform for therapy scheduling, patient records, reminders, precaution alerts, progress tracking, and communication between patients and practitioners.',
    type: 'Healthcare / Ayurvedic Therapy Management',
    tech: ['Web-Based Platform'],
    tags: ['ayurveda', 'panchakarma', 'patient-management', 'therapy-scheduling', 'healthcare'],
    mentor: '',
    students: [],
    tasks: ['Model patient, practitioner, administrator, therapy, and appointment workflows', 'Implement scheduling, reminders, precaution alerts, and treatment progress tracking', 'Add practitioner updates and patient feedback, then validate end-to-end workflows'],
  },
]

const mentorRecords = new Map()
for (const project of projects) {
  if (!project.mentor) continue
  const mentor = mentorRecords.get(project.mentor) || { name: project.mentor, designation: 'Project guide', projects: [] }
  mentor.projects.push(project.projectCode)
  mentorRecords.set(project.mentor, mentor)
}

function createSeedRecords() {
  const now = new Date()
  const seededProjects = projects.map((project, index) => {
    const { students, tasks, ...record } = project
    return {
      ...record,
      abstract: record.abstract || record.description,
      year: academicYear,
      progress: 0,
      color: ['green', 'blue', 'coral', 'amber'][index % 4],
      members: students.map((student) => student.name),
      memberDetails: students.map((student) => ({
        name: student.name,
        rollNo: student.rollNo,
        email: '',
        batch: 'Final Year B.Tech',
        department,
      })),
      gallery: [],
      completed: false,
      createdAt: now,
      updatedAt: now,
    }
  })

  const seededTasks = projects.flatMap((project) => project.tasks.map((title) => ({
    title,
    project: project.name,
    priority: 'Medium',
    done: false,
    approved: false,
    userId: '',
    seedKey: `${project.projectCode}-task-${project.tasks.indexOf(title) + 1}`,
    createdAt: now,
    updatedAt: now,
  })))

  const seededGuidances = projects.map((project) => ({
    project: project.name,
    message: `Source reference: ${project.abstract}${project.mentor ? ` Named project guide in OCR: ${project.mentor}.` : ' A project guide was not reliably identified in the supplied OCR.'}`,
    from: project.mentor || 'Project source record',
    status: 'Reference',
    seedKey: `${project.projectCode}-source-guidance`,
    createdAt: now,
    updatedAt: now,
  }))

  const seededKnowledge = projects.map((project) => ({
    title: `${project.name} - Source Summary`,
    type: 'Project dissertation OCR summary',
    tag: project.tags.join(', '),
    owner: project.mentor || college,
    year: academicYear,
    description: [project.abstract, project.problemStatement, project.solution, `Technologies: ${project.tech.join(', ')}.`].filter(Boolean).join('\n\n'),
    seedKey: `${project.projectCode}-source-summary`,
    createdAt: now,
    updatedAt: now,
  }))

  const seededMentors = [...mentorRecords.values()].map((mentor) => ({
    ...mentor,
    college,
    department,
    source: 'Named as project guide in supplied OCR',
    createdAt: now,
    updatedAt: now,
  }))

  const seededProcess = [{
    key: 'default',
    steps: ['Requirement analysis', 'System design', 'Implementation', 'Testing', 'Documentation', 'Deployment'],
    updatedBy: 'Project source import',
    createdAt: now,
    updatedAt: now,
  }]

  return {
    projects: seededProjects,
    tasks: seededTasks,
    guidances: seededGuidances,
    knowledges: seededKnowledge,
    mentors: seededMentors,
    processes: seededProcess,
  }
}

function validateSeedRecords(records) {
  if (projects.length !== 18) throw new Error(`Expected 18 OCR-backed projects, found ${projects.length}.`)
  if (new Set(projects.map(({ projectCode }) => projectCode)).size !== projects.length) throw new Error('Project codes must be unique.')
  for (const project of projects) {
    if (!project.name || !project.description || project.tasks.length < 1) throw new Error(`Incomplete seed data for ${project.projectCode}.`)
    if (!records.projects.some((record) => record.projectCode === project.projectCode)) throw new Error(`Missing project document for ${project.projectCode}.`)
  }
}

async function seedWithoutReplacing(records) {
  for (const collectionName of Object.keys(records)) {
    for (const record of records[collectionName]) {
      const { seedKey } = record
      const filter = seedKey ? { seedKey } : collectionName === 'projects' ? { projectCode: record.projectCode } : collectionName === 'mentors' ? { name: record.name } : { key: record.key }
      const { createdAt, ...fields } = record
      await mongoose.connection.collection(collectionName).updateOne(
        filter,
        { $set: { ...fields, updatedAt: new Date() }, $setOnInsert: { createdAt: createdAt || new Date() } },
        { upsert: true },
      )
    }
  }
}

async function replaceDatabase(records) {
  const expectedDatabase = process.env.CONFIRM_DATABASE_NAME
  const replaceRequested = process.argv.includes('--replace')
  if (!replaceRequested) return seedWithoutReplacing(records)
  if (!expectedDatabase || expectedDatabase !== mongoose.connection.name) {
    throw new Error(`Refusing replacement: set CONFIRM_DATABASE_NAME to the exact selected database name (${mongoose.connection.name}).`)
  }

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const existing = await mongoose.connection.db.listCollections().toArray()
      for (const collection of existing) {
        await mongoose.connection.db.collection(collection.name).deleteMany({}, { session })
      }
      for (const [collectionName, documents] of Object.entries(records)) {
        await mongoose.connection.db.collection(collectionName).insertMany(documents, { session })
      }
    })
  } finally {
    await session.endSession()
  }
}

const records = createSeedRecords()
validateSeedRecords(records)

try {
  await connectDB()
  await replaceDatabase(records)
  const counts = {}
  for (const collectionName of Object.keys(records)) {
    counts[collectionName] = await mongoose.connection.db.collection(collectionName).countDocuments()
  }
  console.log('ProjectVault data import completed:', JSON.stringify({ database: mongoose.connection.name, projects: projects.length, counts }))
} catch (error) {
  console.error('ProjectVault data import failed:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
