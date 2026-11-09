const { loadEnv } = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Programme = require('../models/Programme');
const FeeRecord = require('../models/FeeRecord');
const SkillFirm = require('../models/SkillFirm');
const Course = require('../models/Course');
const Event = require('../models/Event');
const { AssessmentVersion, AssessmentQuestion } = require('../models/Assessment');
const { Career, CareerPathway } = require('../models/Career');
const { Skill } = require('../models/Skill');
const User = require('../models/User');
const { CommunityPost, CommunityReply } = require('../models/Community');
const bcrypt = require('bcryptjs');

const stats = { imported: 0, updated: 0, skipped: 0, rejected: 0 };

async function upsert(Model, stableKey, data) {
  try {
    const existing = await Model.findOne({ stableKey });
    if (existing) {
      const incomingVerified = data.lastVerifiedAt ? new Date(data.lastVerifiedAt).getTime() : 0;
      const existingVerified = existing.lastVerifiedAt ? new Date(existing.lastVerifiedAt).getTime() : 0;
      if (existingVerified > incomingVerified) {
        stats.skipped += 1;
        return existing;
      }
      Object.assign(existing, data);
      await existing.save();
      stats.updated += 1;
      return existing;
    }
    const created = await Model.create(data);
    stats.imported += 1;
    return created;
  } catch (err) {
    console.error(`[seed] rejected ${stableKey}:`, err.message);
    stats.rejected += 1;
    return null;
  }
}

const CHECKED = new Date('2026-11-05T00:00:00.000Z');

// ==========================================
// 1. BROAD KARACHI INSTITUTIONS REPOSITORY
// Covers Universities, Campuses, Public & Private Intermediate Colleges, Technical/Polytechnic & Vocational
// ==========================================
const institutions = [
  // --- UNIVERSITIES & DEGREE-AWARDING INSTITUTES ---
  {
    stableKey: 'inst-ned',
    name: 'NED University of Engineering and Technology',
    slug: 'ned-university',
    category: 'university',
    ownershipType: 'public',
    accreditationAuthority: 'HEC',
    description: 'Premier public engineering university in Karachi offering accredited degrees across civil, mechanical, electrical, computer science, and software disciplines.',
    officialWebsite: 'https://www.neduet.edu.pk/',
    admissionsWebsite: 'https://www.neduet.edu.pk/admission',
    city: 'Karachi',
    areas: ['University Road', 'Gulshan-e-Iqbal'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by Higher Education Commission (HEC) & Pakistan Engineering Council (PEC).',
    verificationStatus: 'verified',
    sources: [{ label: 'NED official site', url: 'https://www.neduet.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
    metaDescription: 'NED University — Karachi public engineering and technology university.',
  },
  {
    stableKey: 'inst-iba',
    name: 'Institute of Business Administration, Karachi',
    slug: 'iba-karachi',
    category: 'university',
    ownershipType: 'public',
    accreditationAuthority: 'HEC',
    description: 'Autonomous public institution with dual campuses in Karachi, renowned for business administration, economics, computer science, and mathematics.',
    officialWebsite: 'https://www.iba.edu.pk/',
    admissionsWebsite: 'https://admissions.iba.edu.pk/',
    city: 'Karachi',
    areas: ['University Road', 'Garden / Saddar'],
    recognitionStatus: 'verified',
    recognitionNote: 'Chartered by Govt of Sindh, recognized by HEC, AACSB Member.',
    verificationStatus: 'verified',
    sources: [{ label: 'IBA official site', url: 'https://www.iba.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-fast-khi',
    name: 'FAST-NUCES Karachi Campus',
    slug: 'fast-nuces-karachi',
    category: 'university',
    ownershipType: 'private',
    accreditationAuthority: 'HEC',
    description: 'Premier national computer and emerging sciences university renowned for rigorous computer science, software engineering, and AI curricula.',
    officialWebsite: 'https://khi.nu.edu.pk/',
    admissionsWebsite: 'https://admissions.nu.edu.pk/',
    city: 'Karachi',
    areas: ['Shah Latif Town', 'National Highway'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by HEC, NCEAC (W-Category).',
    verificationStatus: 'verified',
    sources: [{ label: 'FAST Karachi campus', url: 'https://khi.nu.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-uok',
    name: 'University of Karachi',
    slug: 'university-of-karachi',
    category: 'university',
    ownershipType: 'public',
    accreditationAuthority: 'HEC',
    description: 'Historic public research university spanning 1,200 acres in Karachi, housing 54 academic departments including UBIT Computing, Pharmacy, and Sciences.',
    officialWebsite: 'https://www.uok.edu.pk/',
    admissionsWebsite: 'https://uokadmission.edu.pk/',
    city: 'Karachi',
    areas: ['University Road'],
    recognitionStatus: 'verified',
    recognitionNote: 'Chartered public university recognized by Sindh HEC and Federal HEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'UoK official site', url: 'https://www.uok.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-duet',
    name: 'Dawood University of Engineering and Technology',
    slug: 'dawood-uet',
    category: 'university',
    ownershipType: 'public',
    accreditationAuthority: 'HEC',
    description: 'Public engineering university on New M.A. Jinnah Road specializing in petroleum, chemical, computer system, and electronics engineering.',
    officialWebsite: 'https://duet.edu.pk/',
    admissionsWebsite: 'https://admissions.duet.edu.pk/',
    city: 'Karachi',
    areas: ['Jamshed Town', 'New M.A. Jinnah Road'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by HEC and Pakistan Engineering Council (PEC).',
    verificationStatus: 'verified',
    sources: [{ label: 'DUET official portal', url: 'https://duet.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-ssuet',
    name: 'Sir Syed University of Engineering and Technology',
    slug: 'ssuet',
    category: 'university',
    ownershipType: 'private',
    accreditationAuthority: 'HEC',
    description: 'Established by Aligarh Muslim University Old Boys Association (AMUOBA), offering accredited undergraduate programmes in engineering and computing.',
    officialWebsite: 'https://www.ssuet.edu.pk/',
    admissionsWebsite: 'https://admissions.ssuet.edu.pk/',
    city: 'Karachi',
    areas: ['Gulshan-e-Iqbal', 'University Road'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by HEC and PEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'SSUET official portal', url: 'https://www.ssuet.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-duhs',
    name: 'Dow University of Health Sciences (DUHS)',
    slug: 'duhs-karachi',
    category: 'university',
    ownershipType: 'public',
    accreditationAuthority: 'HEC',
    description: 'One of Pakistan’s oldest and premier medical and healthcare universities, housing Dow Medical College (DMC) and Ojha Institute of Chest Diseases.',
    officialWebsite: 'https://www.duhs.edu.pk/',
    admissionsWebsite: 'https://admissions.duhs.edu.pk/',
    city: 'Karachi',
    areas: ['Saddar / Baba-e-Urdu Road', 'Ojha Campus Gulzar-e-Hijri'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by PMDC (Pakistan Medical & Dental Council) and HEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'DUHS official site', url: 'https://www.duhs.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-jsmu',
    name: 'Jinnah Sindh Medical University (JSMU)',
    slug: 'jsmu-karachi',
    category: 'university',
    ownershipType: 'public',
    accreditationAuthority: 'HEC',
    description: 'Public medical university in Karachi dedicated to medical, dental, pharmaceutical, and public health education.',
    officialWebsite: 'https://www.jsmu.edu.pk/',
    admissionsWebsite: 'https://admissions.jsmu.edu.pk/',
    city: 'Karachi',
    areas: ['Cantonment', 'Rafiqui H.J. Shaheed Road'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by PMDC and HEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'JSMU official site', url: 'https://www.jsmu.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-iobm',
    name: 'Institute of Business Management (IoBM)',
    slug: 'iobm',
    category: 'university',
    ownershipType: 'private',
    accreditationAuthority: 'HEC',
    description: 'Private business and management focused institution in Korangi Creek, offering undergraduate degrees in business, media sciences, and computing.',
    officialWebsite: 'https://iobm.edu.pk/',
    admissionsWebsite: 'https://admissions.iobm.edu.pk/',
    city: 'Karachi',
    areas: ['Korangi Creek'],
    recognitionStatus: 'verified',
    recognitionNote: 'Chartered by Govt of Sindh, recognized by HEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'IoBM official site', url: 'https://iobm.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-szabist',
    name: 'SZABIST Karachi Campus',
    slug: 'szabist',
    category: 'university',
    ownershipType: 'private',
    accreditationAuthority: 'HEC',
    description: 'Clifton campus offering recognized degrees in computing, media sciences, social sciences, biosciences, and management.',
    officialWebsite: 'https://szabist.edu.pk/',
    admissionsWebsite: 'https://admissions.szabist.edu.pk/',
    city: 'Karachi',
    areas: ['Clifton'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by HEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'SZABIST official site', url: 'https://szabist.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-habib',
    name: 'Habib University',
    slug: 'habib-university',
    category: 'university',
    ownershipType: 'private',
    accreditationAuthority: 'HEC',
    description: 'Private liberal arts and STEM university in Gulistan-e-Johar offering high-rigor undergraduate curricula in Computer Science, Computer Engineering, and Humanities.',
    officialWebsite: 'https://habib.edu.pk/',
    admissionsWebsite: 'https://habib.edu.pk/admissions/',
    city: 'Karachi',
    areas: ['Gulistan-e-Johar'],
    recognitionStatus: 'verified',
    recognitionNote: 'Recognized by HEC & PEC.',
    verificationStatus: 'verified',
    sources: [{ label: 'Habib University official site', url: 'https://habib.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },

  // --- PUBLIC INTERMEDIATE COLLEGES (BIEK AFFILIATED) ---
  {
    stableKey: 'inst-dj-science',
    name: 'D.J. Sindh Government Science College',
    slug: 'dj-sindh-science-college',
    category: 'college',
    ownershipType: 'public',
    accreditationAuthority: 'BIEK',
    description: 'Historic public science college established in 1887 in Saddar Karachi, offering Pre-Engineering and Pre-Medical HSC under Board of Intermediate Education Karachi.',
    officialWebsite: 'https://djsindhgovsciencecollege.edu.pk/',
    city: 'Karachi',
    areas: ['Saddar', 'Dr. Ziauddin Ahmed Road'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with Board of Intermediate Education Karachi (BIEK Code 0101).',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK Affiliated Colleges Directory', url: 'https://biek.edu.pk/gmaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-adamjee-college',
    name: 'Adamjee Government Science College',
    slug: 'adamjee-science-college',
    category: 'college',
    ownershipType: 'public',
    accreditationAuthority: 'BIEK',
    description: 'Top-tier government science college near Gurumandir, consistently producing top merit position holders in HSC Pre-Engineering and Pre-Medical board exams.',
    officialWebsite: 'https://adamjeegovtcollege.edu.pk/',
    city: 'Karachi',
    areas: ['Gurumandir', 'Jamshed Town'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with Board of Intermediate Education Karachi (BIEK). Centralized SECCAP admissions.',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK College Listing', url: 'https://biek.edu.pk/gmaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-govt-commerce',
    name: 'Government College of Commerce and Economics',
    slug: 'govt-college-commerce-economics',
    category: 'college',
    ownershipType: 'public',
    accreditationAuthority: 'BIEK',
    description: 'Premier public business and commerce institution in Karachi offering Intermediate (I.Com) and associate commerce degrees.',
    officialWebsite: 'https://gcce.edu.pk/',
    city: 'Karachi',
    areas: ['Dr. Ziauddin Ahmed Road', 'Saddar'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with BIEK and University of Karachi.',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK Directory', url: 'https://biek.edu.pk/gmaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-pechs-women-college',
    name: 'BAMM PECHS Government College for Women',
    slug: 'pechs-govt-college-women',
    category: 'college',
    ownershipType: 'public',
    accreditationAuthority: 'BIEK',
    description: 'Top-ranked government college for women in PECHS Karachi, known for high academic merit in Pre-Medical, Pre-Engineering, and General Science.',
    officialWebsite: 'https://bammpechscollege.edu.pk/',
    city: 'Karachi',
    areas: ['PECHS', 'Jamshed Town'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with BIEK (Female Colleges).',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK Directory', url: 'https://biek.edu.pk/gfemaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-delhi-college',
    name: 'Government Delhi Inter Science College',
    slug: 'govt-delhi-science-college',
    category: 'college',
    ownershipType: 'public',
    accreditationAuthority: 'BIEK',
    description: 'Renowned public intermediate science college in Federal B Area Karimabad, offering Pre-Engineering and Computer Science streams.',
    city: 'Karachi',
    areas: ['Karimabad', 'Federal B Area'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with BIEK.',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK College Listing', url: 'https://biek.edu.pk/gmaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },

  // --- PRIVATE & SEMI-PUBLIC COLLEGES ---
  {
    stableKey: 'inst-st-patricks',
    name: 'St. Patrick’s College, Karachi',
    slug: 'st-patricks-college',
    category: 'college',
    ownershipType: 'private',
    accreditationAuthority: 'BIEK',
    description: 'Historic private collegiate institution in Saddar Karachi, offering Intermediate programmes in Pre-Engineering, Pre-Medical, Commerce, and Humanities.',
    officialWebsite: 'https://stpatrickscollege.edu.pk/',
    city: 'Karachi',
    areas: ['Saddar'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with BIEK.',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK Private Colleges Directory', url: 'https://biek.edu.pk/PMaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-commecs',
    name: 'Commecs College',
    slug: 'commecs-college',
    category: 'college',
    ownershipType: 'private',
    accreditationAuthority: 'BIEK',
    description: 'Prominent private intermediate college in Gulistan-e-Johar, founded by COMMECS Educational Trust, offering Science, ICS, and Commerce.',
    officialWebsite: 'https://commecscollege.edu.pk/',
    city: 'Karachi',
    areas: ['Gulistan-e-Johar'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with BIEK.',
    verificationStatus: 'verified',
    sources: [{ label: 'BIEK Private Colleges Listing', url: 'https://biek.edu.pk/PMaleCol.asp', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-ak-higher-secondary',
    name: 'Aga Khan Higher Secondary School, Karachi',
    slug: 'aga-khan-higher-secondary',
    category: 'higher_secondary',
    ownershipType: 'private',
    accreditationAuthority: 'BIEK',
    description: 'Renowned higher secondary school in Karimabad offering rigorous education under Aga Khan University Examination Board (AKU-EB) and BIEK.',
    officialWebsite: 'https://www.agakhanschools.org/',
    city: 'Karachi',
    areas: ['Karimabad', 'Federal B Area'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with AKU-EB & BIEK.',
    verificationStatus: 'verified',
    sources: [{ label: 'Aga Khan Education Service Pakistan', url: 'https://www.agakhanschools.org/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-bahria-college',
    name: 'Bahria College Karachi (NORE I)',
    slug: 'bahria-college-karsaz',
    category: 'college',
    ownershipType: 'semi-public',
    accreditationAuthority: 'BIEK',
    description: 'Established under Pakistan Navy on Karsaz Road, offering Cambridge O/A-Levels and Intermediate (Pre-Engineering, Pre-Medical, ICS).',
    officialWebsite: 'https://bckarsaz.edu.pk/',
    city: 'Karachi',
    areas: ['Karsaz', 'Shahrah-e-Faisal'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with Federal Board & BIEK; Cambridge International Associate.',
    verificationStatus: 'verified',
    sources: [{ label: 'Bahria College official portal', url: 'https://bckarsaz.edu.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-dha-college',
    name: 'DHA Degree College for Men / Women',
    slug: 'dha-degree-college',
    category: 'college',
    ownershipType: 'semi-public',
    accreditationAuthority: 'BIEK',
    description: 'Run by Defense Housing Authority in Phase VI DHA, providing Intermediate Science, Humanities, and Commerce with modern laboratories.',
    officialWebsite: 'https://dhakarachi.org/',
    city: 'Karachi',
    areas: ['DHA Phase VI', 'Clifton'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with BIEK and University of Karachi.',
    verificationStatus: 'verified',
    sources: [{ label: 'DHA Education Directorate', url: 'https://dhakarachi.org/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },

  // --- TECHNICAL, POLYTECHNIC & VOCATIONAL INSTITUTES ---
  {
    stableKey: 'inst-gct-site',
    name: 'Government College of Technology (GCT) Karachi',
    slug: 'gct-karachi-site',
    category: 'technical_polytechnic',
    ownershipType: 'public',
    accreditationAuthority: 'SBTE',
    description: 'Karachi’s oldest and largest polytechnic institution in SITE Area, offering 3-year Diploma of Associate Engineering (DAE) across Mechanical, Electrical, Civil, and Electronics.',
    officialWebsite: 'https://stevta.gos.pk/',
    city: 'Karachi',
    areas: ['SITE Area', 'Manghopir Road'],
    recognitionStatus: 'verified',
    recognitionNote: 'Affiliated with Sindh Board of Technical Education (SBTE) & managed by STEVTA.',
    verificationStatus: 'verified',
    sources: [{ label: 'STEVTA Institute List', url: 'https://stevta.gos.pk/Downloads/ListofVocationalinstitutes.pdf', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-sbti',
    name: 'Saifee Burhani Technical Institute (SBTI)',
    slug: 'saifee-burhani-technical-institute',
    category: 'technical_polytechnic',
    ownershipType: 'private',
    accreditationAuthority: 'SBTE',
    description: 'Reputed private technical institute in North Nazimabad offering DAE programmes in Electronics, Computer Information Technology (CIT), and Mechanical Engineering.',
    officialWebsite: 'https://sbti.edu.pk/',
    city: 'Karachi',
    areas: ['North Nazimabad'],
    recognitionStatus: 'verified',
    recognitionNote: 'Registered with Sindh Board of Technical Education (SBTE).',
    verificationStatus: 'verified',
    sources: [{ label: 'SBTE Registered Institutes Directory', url: 'https://beta.sbte.edu.pk/registered-institutes', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-miti',
    name: 'Memon Industrial and Technical Institute (MITI)',
    slug: 'miti-karachi',
    category: 'vocational',
    ownershipType: 'private',
    accreditationAuthority: 'NAVTTC',
    description: 'Extensive vocational training institute in Korangi Industrial Area by World Memon Organisation, offering technical diplomas in CNC machining, IT, solar power, and automotive repair.',
    officialWebsite: 'https://wmomiti.com/',
    city: 'Karachi',
    areas: ['Korangi Industrial Area'],
    recognitionStatus: 'verified',
    recognitionNote: 'Accredited by NAVTTC (National Vocational and Technical Training Commission) & SBTE.',
    verificationStatus: 'verified',
    sources: [{ label: 'NAVTTC Partner Institutes', url: 'https://navttc.gov.pk/partner-institutes/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
  {
    stableKey: 'inst-gpiw-liaquatabad',
    name: 'Government Polytechnic Institute for Women, Liaquatabad',
    slug: 'govt-polytechnic-women-liaquatabad',
    category: 'technical_polytechnic',
    ownershipType: 'public',
    accreditationAuthority: 'STEVTA',
    description: 'Premier public technical training institute for female students in Karachi, offering DAE in Computer Information Technology, Architecture, and Garment Technology.',
    officialWebsite: 'https://stevta.gos.pk/',
    city: 'Karachi',
    areas: ['Liaquatabad'],
    recognitionStatus: 'verified',
    recognitionNote: 'Managed by STEVTA, affiliated with SBTE.',
    verificationStatus: 'verified',
    sources: [{ label: 'STEVTA Polytechnic Directory', url: 'https://stevta.gos.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  },
];

// ==========================================
// 2. SKILL-ENHANCING FIRMS & BOOTCAMPS
// ==========================================
async function seedSkillFirms() {
  // JAWAN PAKISTAN (Editorial Placement #1)
  const jawan = await upsert(SkillFirm, 'firm-jawan-pakistan', {
    stableKey: 'firm-jawan-pakistan',
    name: 'Jawan Pakistan',
    slug: 'jawan-pakistan',
    description:
      'Karachi-based youth skills initiative offering intensive tech training across modern AI, web, mobile, and digital freelancing. Featured on Acadiv as an editorial placement — not an official market ranking.',
    categories: ['training', 'technology'],
    website: 'https://www.jawanpakistan.com/',
    karachiLocation: '3rd Floor, Office #14 & 15, RJ Shopping Mall, Main Rashid Minhas Rd, Gulistan-e-Johar, Karachi',
    campusArea: 'Gulistan-e-Johar',
    skillDomains: ['Agentic AI', 'Full Stack Development', 'Flutter & Dart', 'Digital Marketing', 'Graphic Design'],
    isFeatured: true,
    featuredPriority: 1,
    featuredLabel: 'Acadiv Featured Placement',
    verificationStatus: 'verified',
    sources: [
      { label: 'Jawan Pakistan website', url: 'https://www.jawanpakistan.com/', retrievedAt: CHECKED },
      { label: 'Official LinkedIn announcements', url: 'https://www.linkedin.com/company/jawanpakistan', retrievedAt: CHECKED },
    ],
    lastVerifiedAt: CHECKED,
    metaDescription: 'Jawan Pakistan — Karachi tech bootcamps in Agentic AI, Web & Mobile development.',
  });

  if (jawan) {
    await upsert(Course, 'course-jawan-agentic-ai-2026', {
      stableKey: 'course-jawan-agentic-ai-2026',
      providerId: jawan._id,
      title: 'Certified Agentic AI and Full Stack Development',
      slug: 'certified-agentic-ai-and-fde',
      description: 'Comprehensive 6-month hands-on programme covering LLM agents, LangChain, React, Node.js, and autonomous tool calling.',
      skillCategories: ['Agentic AI', 'Full Stack', 'Software'],
      level: 'intermediate',
      deliveryMode: 'hybrid',
      duration: '6 Months (Weekend & Evening)',
      eligibility: 'Minimum Intermediate (HSC / A-Levels / DAE) with basic programming logic',
      publishedFeeAmount: 9999,
      publishedFeeNote: 'Rs. 9,999 onsite / Rs. 7,999 online for entire curriculum (verified from public announcement).',
      officialLink: 'https://forms.jawanpakistan.com',
      registrationStatus: 'open',
      availability: 'available',
      sourceUrl: 'https://www.jawanpakistan.com/',
      verificationStatus: 'verified',
      lastVerifiedAt: CHECKED,
    });

    await upsert(Course, 'course-jawan-flutter-2026', {
      stableKey: 'course-jawan-flutter-2026',
      providerId: jawan._id,
      title: 'Flutter & Dart Mobile App Mastery',
      slug: 'certified-flutter-dart-development',
      description: 'Cross-platform iOS and Android engineering with Dart, Firebase integration, Bloc/Provider state management, and Play Store publishing.',
      skillCategories: ['Mobile App', 'Flutter', 'Dart'],
      level: 'beginner',
      deliveryMode: 'hybrid',
      duration: '4 Months',
      eligibility: 'Matric / Intermediate with basic computer literacy',
      publishedFeeAmount: 6999,
      publishedFeeNote: 'Verified subsidized youth rate.',
      officialLink: 'https://forms.jawanpakistan.com',
      registrationStatus: 'open',
      availability: 'available',
      sourceUrl: 'https://www.jawanpakistan.com/',
      verificationStatus: 'verified',
      lastVerifiedAt: CHECKED,
    });
  }

  // SAYLANI MASS IT TRAINING (SMIT)
  const smit = await upsert(SkillFirm, 'firm-smit', {
    stableKey: 'firm-smit',
    name: 'Saylani Mass IT Training (SMIT)',
    slug: 'saylani-mass-it-training',
    description: 'Massive non-profit tech education initiative in Karachi with centers in Bahadurabad, Gulshan, and Korangi, training tens of thousands in web, AI, and cloud free or at token registration cost.',
    categories: ['training', 'nonprofit', 'technology'],
    website: 'https://www.saylaniwelfare.com/',
    karachiLocation: 'Saylani Head Office, 4th Floor, A-25, Bahadurabad Chowrangi, Karachi',
    campusArea: 'Bahadurabad',
    skillDomains: ['MERN Stack', 'Python AI', 'Cloud Native', 'Cyber Security', 'Graphic Design'],
    isFeatured: false,
    featuredPriority: 2,
    verificationStatus: 'verified',
    sources: [{ label: 'Saylani Welfare official site', url: 'https://www.saylaniwelfare.com/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  });

  if (smit) {
    await upsert(Course, 'course-smit-web-app', {
      stableKey: 'course-smit-web-app',
      providerId: smit._id,
      title: 'Modern Web & Mobile Application Development (MERN)',
      slug: 'smit-modern-web-development-mern',
      description: '1-year rigorous curriculum in HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, MongoDB, and Firebase.',
      skillCategories: ['Web Development', 'MERN Stack'],
      level: 'beginner',
      deliveryMode: 'onsite',
      duration: '1 Year (3 Classes per week)',
      eligibility: 'Minimum Matriculation or Intermediate with clearance of SMIT Entry Aptitude Test',
      publishedFeeAmount: 0,
      publishedFeeNote: '100% Free Tuition funded by Saylani Welfare Trust (Token exam/ID card fee may apply).',
      officialLink: 'https://forms.saylaniwelfare.com/',
      registrationStatus: 'open',
      availability: 'available',
      sourceUrl: 'https://www.saylaniwelfare.com/',
      verificationStatus: 'verified',
      lastVerifiedAt: CHECKED,
    });
  }

  // BANO QABIL (Alkhidmat Karachi)
  await upsert(SkillFirm, 'firm-bano-qabil', {
    stableKey: 'firm-bano-qabil',
    name: 'Bano Qabil (Alkhidmat Karachi)',
    slug: 'bano-qabil',
    description: 'Community youth empowerment programme by Alkhidmat Karachi offering 100% free certified courses in digital marketing, Amazon FBA, cyber security, and web development across Karachi centers.',
    categories: ['training', 'community', 'technology'],
    website: 'https://banoqabil.pk/',
    karachiLocation: 'Alkhidmat Complex, 501, Quaideen Colony, Karachi',
    campusArea: 'Shahrah-e-Quaideen',
    skillDomains: ['Digital Marketing', 'Amazon FBA', 'Cyber Security', 'Graphic Design', 'Web Development'],
    isFeatured: false,
    featuredPriority: 3,
    verificationStatus: 'verified',
    sources: [{ label: 'Bano Qabil portal', url: 'https://banoqabil.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  });

  // APTECH COMPUTER EDUCATION KARACHI
  const aptech = await upsert(SkillFirm, 'firm-aptech-karachi', {
    stableKey: 'firm-aptech-karachi',
    name: 'Aptech Computer Education Karachi',
    slug: 'aptech-computer-education-karachi',
    description: 'International IT education provider with prominent Karachi centers in Clifton, Gulshan-e-Iqbal, and North Nazimabad, offering career courses in Software Engineering (ACCP) and Web development.',
    categories: ['training', 'technology'],
    website: 'https://aptech-education.com.pk/',
    karachiLocation: 'Multiple centers across Clifton, Gulshan-e-Iqbal, and North Nazimabad, Karachi',
    campusArea: 'Clifton / Gulshan',
    skillDomains: ['Software Engineering', 'Java Enterprise', '.NET', 'Web Development'],
    isFeatured: false,
    featuredPriority: 4,
    verificationStatus: 'verified',
    sources: [{ label: 'Aptech Pakistan', url: 'https://aptech-education.com.pk/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  });

  // ARENA MULTIMEDIA KARACHI
  await upsert(SkillFirm, 'firm-arena-karachi', {
    stableKey: 'firm-arena-karachi',
    name: 'Arena Multimedia Karachi',
    slug: 'arena-multimedia-karachi',
    description: 'Pioneering media and animation academy in Karachi offering certified programmes in 3D Animation, Visual Effects (VFX), UI/UX Design, and Game Asset Art.',
    categories: ['training', 'creative'],
    website: 'https://arenapakistan.com/',
    karachiLocation: 'Main Shahrah-e-Faisal / PECHS, Karachi',
    campusArea: 'PECHS',
    skillDomains: ['UI/UX Design', '3D Animation', 'VFX', 'Graphic Design'],
    isFeatured: false,
    featuredPriority: 5,
    verificationStatus: 'verified',
    sources: [{ label: 'Arena Pakistan', url: 'https://arenapakistan.com/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  });

  // TECHKARO (CIRCLE Women)
  await upsert(SkillFirm, 'firm-techkaro', {
    stableKey: 'firm-techkaro',
    name: 'TechKaro by CIRCLE Women',
    slug: 'techkaro-circle',
    description: 'Social enterprise tech initiative empowering young women and youth from underserved Karachi communities in coding, digital marketing, and freelance career placement.',
    categories: ['training', 'community', 'technology'],
    website: 'https://circlewomen.org/',
    karachiLocation: 'Lyari & Korangi partner centers, Karachi',
    campusArea: 'Lyari / Korangi',
    skillDomains: ['Full Stack Web', 'Digital Marketing', 'Life Skills & Freelancing'],
    isFeatured: false,
    featuredPriority: 6,
    verificationStatus: 'verified',
    sources: [{ label: 'CIRCLE Women official site', url: 'https://circlewomen.org/', retrievedAt: CHECKED }],
    lastVerifiedAt: CHECKED,
  });
}

// ==========================================
// 3. BROAD CAREER CATALOG (STEM, HEALTH, BUSINESS, LAW, ARTS, EDUCATION)
// ==========================================
const careers = [
  {
    stableKey: 'career-swe',
    title: 'Software Engineer',
    slug: 'software-engineer',
    description: 'Designs, builds, tests, and deploys scalable software applications, backend services, and interactive user interfaces.',
    disciplines: ['Computer Science', 'Software Engineering', 'Information Technology'],
    relatedSubjects: ['Mathematics', 'Computer Science', 'Physics'],
    requiredSkills: ['Programming', 'Problem Solving', 'Version Control'],
    usefulSkills: ['Communication', 'Software Testing', 'System Architecture'],
    educationRoutes: ['BS Computer Science / Software Engineering (NED, FAST, IBA, UoK)', 'Certified intensive bootcamp + production portfolio'],
    typicalResponsibilities: ['Architect clean web and mobile features', 'Debug and profile codebases', 'Conduct code reviews and write tests'],
    progressionPaths: ['Junior Engineer -> Mid-Level -> Senior Architect -> Tech Lead / VP Engineering'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
    sources: [{ label: 'Pakistan Software Houses Association (P@SHA) & HEC Computing Curriculum', url: 'https://pasha.org.pk/', retrievedAt: CHECKED }],
  },
  {
    stableKey: 'career-data',
    title: 'Data Analyst & BI Specialist',
    slug: 'data-analyst',
    description: 'Translates raw organizational and market data into actionable insights through statistical analysis, SQL queries, and visual dashboards.',
    disciplines: ['Data Science', 'Business Analytics', 'Statistics'],
    relatedSubjects: ['Mathematics', 'Statistics', 'Computer Science'],
    requiredSkills: ['SQL', 'Spreadsheets & Pivot Tables', 'Visualization'],
    usefulSkills: ['Python Basics', 'Business Communication', 'Statistical Modeling'],
    educationRoutes: ['BS Data Science / CS / Statistics / Business Analytics', 'Google Data Analytics Professional Certificate'],
    typicalResponsibilities: ['Write complex SQL queries', 'Build executive Power BI / Tableau dashboards', 'Identify market trends and anomalies'],
    progressionPaths: ['Junior Analyst -> Senior BI Engineer -> Analytics Manager -> Head of Data'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
    sources: [{ label: 'HEC Data Science Guidelines & Karachi Industry Benchmark', url: 'https://www.hec.gov.pk/', retrievedAt: CHECKED }],
  },
  {
    stableKey: 'career-cybersecurity',
    title: 'Cybersecurity Analyst & Penetration Tester',
    slug: 'cybersecurity-analyst',
    description: 'Protects enterprise digital assets, identifies network vulnerabilities, enforces zero-trust architecture, and monitors intrusion alerts.',
    disciplines: ['Cybersecurity', 'Information Security', 'Network Engineering'],
    relatedSubjects: ['Computer Science', 'Mathematics', 'Physics'],
    requiredSkills: ['Network Protocols', 'Vulnerability Assessment', 'Linux Administration'],
    usefulSkills: ['Cryptography', 'Incident Response', 'Scripting (Python/Bash)'],
    educationRoutes: ['BS Cybersecurity (FAST, Air, NED)', 'CompTIA Security+ / CEH certification'],
    typicalResponsibilities: ['Conduct penetration testing and audits', 'Investigate security incidents', 'Configure firewalls and SIEM systems'],
    progressionPaths: ['SOC Analyst -> Security Engineer -> Penetration Tester -> CISO'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-civil',
    title: 'Civil & Structural Engineer',
    slug: 'civil-engineer',
    description: 'Plans, designs, and oversees construction of physical infrastructure including buildings, highways, bridges, water supply systems, and transport networks.',
    disciplines: ['Civil Engineering', 'Structural Engineering', 'Construction Management'],
    relatedSubjects: ['Mathematics', 'Physics', 'Chemistry'],
    requiredSkills: ['Technical Drawing', 'Site Awareness', 'Structural Fundamentals'],
    usefulSkills: ['AutoCAD / Revit', 'Project Management', 'Surveying'],
    educationRoutes: ['BE Civil Engineering (NED University, SSUET, Dawood UET) accredited by Pakistan Engineering Council (PEC)'],
    typicalResponsibilities: ['Prepare structural calculation reports', 'Perform site inspections and soil compliance checks', 'Liaise with contractors and urban planners'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
    sources: [{ label: 'Pakistan Engineering Council (PEC) accredited guidelines', url: 'https://pec.org.pk/', retrievedAt: CHECKED }],
  },
  {
    stableKey: 'career-mechanical',
    title: 'Mechanical & Robotics Engineer',
    slug: 'mechanical-engineer',
    description: 'Designs, manufactures, and maintains mechanical systems, thermal power equipment, industrial machinery, and automated robotic systems.',
    disciplines: ['Mechanical Engineering', 'Mechatronics', 'Manufacturing'],
    relatedSubjects: ['Physics', 'Mathematics', 'Chemistry'],
    requiredSkills: ['Thermodynamics', 'CAD Modeling', 'Material Science'],
    educationRoutes: ['BE Mechanical / Mechatronics (NED, PNEC-NUST, SSUET) accredited by PEC'],
    typicalResponsibilities: ['Design machinery using SolidWorks/AutoCAD', 'Conduct finite element stress analysis', 'Oversee industrial plant operations'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-doctor',
    title: 'Medical Doctor (MBBS / Specialist)',
    slug: 'medical-doctor',
    description: 'Diagnoses illnesses, prescribes medical treatments, performs clinical examinations, and manages patient healthcare across hospitals and clinics.',
    disciplines: ['Medicine', 'Surgery', 'Clinical Sciences'],
    relatedSubjects: ['Biology', 'Chemistry', 'Physics'],
    requiredSkills: ['Clinical Diagnosis', 'Patient Empathy', 'Emergency Management'],
    educationRoutes: ['5-Year MBBS (Dow DMC, JSMU, Aga Khan University) accredited by PMDC -> 1-Year House Job -> FCPS Specialization'],
    typicalResponsibilities: ['Conduct physical and diagnostic exams', 'Formulate treatment protocols', 'Perform hospital rounds and surgical procedures'],
    progressionPaths: ['Medical Officer -> Resident -> Consultant Specialist -> Head of Clinical Department'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
    sources: [{ label: 'Pakistan Medical & Dental Council (PMDC)', url: 'https://pmdc.pk/', retrievedAt: CHECKED }],
  },
  {
    stableKey: 'career-pharmacist',
    title: 'Pharmacist & Clinical Research Specialist',
    slug: 'pharmacist',
    description: 'Formulates pharmaceutical compounds, ensures drug safety, advises clinical healthcare teams, and manages pharmaceutical quality control.',
    disciplines: ['Pharmacy', 'Pharmaceutical Sciences'],
    relatedSubjects: ['Chemistry', 'Biology', 'Physiology'],
    requiredSkills: ['Pharmacology', 'Drug Interactions', 'GMP Quality Assurance'],
    educationRoutes: ['5-Year Pharm.D (Doctor of Pharmacy) (University of Karachi, Dow DUHS, JSMU) accredited by Pharmacy Council of Pakistan'],
    typicalResponsibilities: ['Supervise drug dispensation', 'Perform pharmaceutical QA testing', 'Counsel patients on medication regimens'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-nurse',
    title: 'Registered Nurse & Healthcare Specialist',
    slug: 'nursing-allied-health',
    description: 'Delivers patient-centered clinical care, assists medical procedures, and manages healthcare records across hospitals and clinics.',
    disciplines: ['Nursing', 'Allied Health Sciences'],
    relatedSubjects: ['Biology', 'Chemistry', 'Physics'],
    requiredSkills: ['Patient Care Fundamentals', 'Clinical Protocols', 'Communication'],
    educationRoutes: ['BS Nursing (4-Year) accredited by Pakistan Nursing & Midwifery Council (PNMC) (Aga Khan University, DUHS)'],
    typicalResponsibilities: ['Administer prescribed medications and IV fluids', 'Monitor vital signs and patient stability', 'Counsel patients on recovery plans'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-accountant',
    title: 'Chartered Accountant (CA / ICAP)',
    slug: 'chartered-accountant',
    description: 'Ensures financial governance, corporate taxation compliance, statutory audit excellence, and strategic financial advisory for enterprises.',
    disciplines: ['Accounting', 'Audit', 'Taxation', 'Corporate Finance'],
    relatedSubjects: ['Mathematics', 'Accounting', 'Commerce', 'Economics'],
    requiredSkills: ['Financial Reporting', 'Statutory Auditing', 'Corporate Taxation'],
    educationRoutes: ['ICAP Chartered Accountancy (PRC -> CAF -> Articleship -> CFAP -> MSA) or ACCA Global -> CA Membership'],
    typicalResponsibilities: ['Conduct independent statutory audits', 'Prepare corporate tax returns and SECP filings', 'Formulate financial risk models'],
    progressionPaths: ['Trainee Auditor -> Audit Senior -> Finance Manager -> Partner / CFO'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
    sources: [{ label: 'Institute of Chartered Accountants of Pakistan (ICAP)', url: 'https://icap.org.pk/', retrievedAt: CHECKED }],
  },
  {
    stableKey: 'career-lawyer',
    title: 'Corporate & Litigation Advocate',
    slug: 'corporate-lawyer',
    description: 'Provides legal counsel, drafts commercial contracts, represents clients in high courts, and ensures regulatory compliance with Pakistani statutes.',
    disciplines: ['Law', 'Corporate Law', 'Constitutional Law'],
    relatedSubjects: ['English', 'Pakistan Studies', 'Political Science'],
    requiredSkills: ['Legal Drafting', 'Oral Advocacy', 'Statutory Research'],
    educationRoutes: ['5-Year LLB (S.M. Law College, University of Karachi, Hamdard, Denning Law) + Law Admission Test (LAT) + Bar Council License'],
    typicalResponsibilities: ['Draft legal notices and contracts', 'Plead cases before civil and high courts', 'Advise companies on SECP and labor compliance'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
    sources: [{ label: 'Sindh Bar Council & Pakistan Bar Council', url: 'https://sindhbarcouncil.org/', retrievedAt: CHECKED }],
  },
  {
    stableKey: 'career-ux',
    title: 'Product & UX/UI Designer',
    slug: 'ux-designer',
    description: 'Shapes digital interfaces and user experiences through systematic user research, information architecture, wireframing, and interactive design craft.',
    disciplines: ['Design', 'Human-Computer Interaction', 'Media Sciences'],
    relatedSubjects: ['Computer Science', 'Fine Arts', 'Psychology'],
    requiredSkills: ['Visual Design', 'User Research', 'Prototyping'],
    usefulSkills: ['Figma Mastery', 'Usability Testing', 'Design Systems'],
    educationRoutes: ['BS Media Sciences / Communication Design (SZABIST, IVSAA, KU)', 'Independent portfolio with documented case studies'],
    typicalResponsibilities: ['Conduct student/user interviews', 'Design responsive Figma components and design tokens', 'Prototype micro-interactions and usability tests'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-psychologist',
    title: 'Clinical Psychologist & Mental Health Counselor',
    slug: 'clinical-psychologist',
    description: 'Evaluates cognitive, emotional, and behavioral dynamics, delivers evidence-based psychotherapy, and supports mental well-being in schools and hospitals.',
    disciplines: ['Psychology', 'Behavioral Sciences', 'Counseling'],
    relatedSubjects: ['Biology', 'Psychology', 'Statistics'],
    requiredSkills: ['Psychological Assessment', 'Empathetic Counseling', 'Cognitive Behavioral Therapy'],
    educationRoutes: ['BS / M.Sc Psychology (University of Karachi, Bahria, IoBM) -> Advance Diploma in Clinical Psychology (ADCP)'],
    typicalResponsibilities: ['Administer psychometric assessments', 'Conduct structured counseling sessions', 'Develop behavioral intervention plans'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-teach',
    title: 'Secondary & Higher Education Educator',
    slug: 'educator',
    description: 'Instructs, mentors, and designs learning experiences for secondary school, college, or university students in classroom or digital environments.',
    disciplines: ['Education', 'Sciences / Humanities'],
    relatedSubjects: ['Subject specialization (Math, Physics, English, CS)'],
    requiredSkills: ['Communication', 'Lesson Planning', 'Assessment Literacy'],
    educationRoutes: ['BS/MS in relevant subject discipline + B.Ed / Teaching Diploma (Sindh Board / KU / Aga Khan IED)'],
    typicalResponsibilities: ['Deliver structured lectures', 'Design evaluative assessments and rubrics', 'Provide 1-on-1 mentorship to struggling learners'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
  {
    stableKey: 'career-supply-chain',
    title: 'Supply Chain & Logistics Operations Manager',
    slug: 'supply-chain-manager',
    description: 'Optimizes goods movement, port clearance, warehouse inventory, vendor procurement, and freight logistics across Pakistani trade corridors.',
    disciplines: ['Supply Chain Management', 'Business Administration', 'Industrial Engineering'],
    relatedSubjects: ['Mathematics', 'Statistics', 'Commerce'],
    requiredSkills: ['Inventory Optimization', 'Logistics Procurement', 'Data Analytics'],
    educationRoutes: ['BBA / BS Supply Chain Management (IBA, IoBM, SZABIST, NED)'],
    typicalResponsibilities: ['Manage Karachi Port / Qasim logistics operations', 'Forecast product demand', 'Negotiate freight and warehousing contracts'],
    verificationStatus: 'verified',
    lastReviewedAt: CHECKED,
  },
];

// ==========================================
// 4. CAMPUS BULLETIN ACTIVE STUDENT EVENTS
// ==========================================
async function seedEvents() {
  const events = [
    {
      stableKey: 'event-fast-procom-2026',
      title: 'PROCOM 2026 — National Tech Olympiad & 24-Hour Hackathon',
      slug: 'procom-2026-fast-karachi',
      description: 'Karachi’s largest inter-university computing olympiad at FAST Karachi. Competitions include 24-hr Speed Coding, AI Project Exhibition, Web & Mobile Dev Challenge, and Gaming.',
      category: 'hackathon',
      organizer: 'FAST-NUCES ACM & IEEE Chapters',
      hostingInstitution: 'FAST-NUCES Karachi Campus',
      city: 'Karachi',
      campusArea: 'Shah Latif Town',
      venue: 'FAST Karachi Campus, National Highway, Karachi',
      format: 'physical',
      startsAt: new Date('2026-11-20T09:00:00.000Z'),
      endsAt: new Date('2026-11-22T18:00:00.000Z'),
      registrationDeadline: new Date('2026-11-18T23:59:59.000Z'),
      registrationLink: 'https://khi.nu.edu.pk/procom',
      eligibility: 'Open to enrolled students from Matric, Intermediate, A-Levels, and all recognized Pakistani Universities.',
      feeNote: 'Rs. 1,500 per team. Cash prize pool over PKR 500,000.',
      sourceUrl: 'https://khi.nu.edu.pk/',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      expiresAt: new Date('2026-11-25T00:00:00.000Z'),
    },
    {
      stableKey: 'event-iba-mun-2026',
      title: 'IBA Karachi Model United Nations (IBAMUN XI)',
      slug: 'iba-mun-xi-2026',
      description: '4-day premier diplomacy and debate conference bringing together over 600 delegates across Pakistan to simulate UN committees and resolve geopolitical challenges.',
      category: 'mun',
      organizer: 'IBA Public Speaking and Debating Society',
      hostingInstitution: 'Institute of Business Administration, Karachi',
      city: 'Karachi',
      campusArea: 'University Road',
      venue: 'IBA Main Campus, University Road, Karachi',
      format: 'physical',
      startsAt: new Date('2026-12-05T08:30:00.000Z'),
      endsAt: new Date('2026-12-08T19:00:00.000Z'),
      registrationDeadline: new Date('2026-11-28T23:59:59.000Z'),
      registrationLink: 'https://ibamun.iba.edu.pk/',
      eligibility: 'High school (O/A-Levels, Matric/Inter) and university delegations or individual delegates.',
      feeNote: 'Delegate fee: Rs. 3,500.',
      sourceUrl: 'https://www.iba.edu.pk/',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      expiresAt: new Date('2026-12-10T00:00:00.000Z'),
    },
    {
      stableKey: 'event-ned-techfest-2026',
      title: 'NED Sentec & TechFest 2026 — Engineering & Robotics Showcase',
      slug: 'ned-sentec-techfest-2026',
      description: 'Showcase of engineering innovation featuring autonomous line-following robotics, drone racing, mechanical CAD design sprint, and IoT projects.',
      category: 'exhibition',
      organizer: 'SENTEC, NEDUET',
      hostingInstitution: 'NED University of Engineering & Technology',
      city: 'Karachi',
      campusArea: 'Gulshan-e-Iqbal',
      venue: 'NED Main Auditorium & Open Grounds, University Road, Karachi',
      format: 'physical',
      startsAt: new Date('2026-11-28T10:00:00.000Z'),
      endsAt: new Date('2026-11-29T17:00:00.000Z'),
      registrationDeadline: new Date('2026-11-24T23:59:59.000Z'),
      registrationLink: 'https://sentec.neduet.edu.pk/',
      eligibility: 'Engineering, DAE, and Science students.',
      feeNote: 'Free entry for student observers. Project registration Rs. 1,000.',
      sourceUrl: 'https://www.neduet.edu.pk/',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      expiresAt: new Date('2026-12-01T00:00:00.000Z'),
    },
    {
      stableKey: 'event-karachi-ai-workshop-2026',
      title: 'Karachi Agentic AI & Generative Tech Hands-On Workshop',
      slug: 'karachi-agentic-ai-workshop-2026',
      description: 'Intensive weekend workshop for students and young developers on building autonomous LLM agents with Python, tool calling, and local vector retrieval (RAG).',
      category: 'workshop',
      organizer: 'Karachi AI Community & Google Developer Groups Karachi',
      hostingInstitution: 'National Incubation Center Karachi (NICK)',
      city: 'Karachi',
      campusArea: 'NED Campus',
      venue: 'NICK, NED University Premises, University Road, Karachi',
      format: 'hybrid',
      startsAt: new Date('2026-11-18T14:00:00.000Z'),
      endsAt: new Date('2026-11-18T18:00:00.000Z'),
      registrationDeadline: new Date('2026-11-16T23:59:59.000Z'),
      registrationLink: 'https://gdg.community.dev/events/details/developer-story-karachi',
      eligibility: 'Basic knowledge of Python or JavaScript.',
      feeNote: 'Free attendance with prior confirmation.',
      sourceUrl: 'https://gdg.community.dev/',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      expiresAt: new Date('2026-11-20T00:00:00.000Z'),
    },
    {
      stableKey: 'event-duhs-medical-conf-2026',
      title: 'DUHS All-Pakistan Inter-Medical Student Research Symposium',
      slug: 'duhs-medical-research-symposium-2026',
      description: 'Annual research symposium inviting medical, dental, and pharmacy undergraduates to present original clinical case audits, public health research, and poster presentations.',
      category: 'competition',
      organizer: 'Dow Medical College Student Research Society',
      hostingInstitution: 'Dow University of Health Sciences',
      city: 'Karachi',
      campusArea: 'Saddar / DMC',
      venue: 'Arag Auditorium, DMC Campus, Baba-e-Urdu Road, Karachi',
      format: 'physical',
      startsAt: new Date('2026-12-14T09:00:00.000Z'),
      endsAt: new Date('2026-12-15T16:00:00.000Z'),
      registrationDeadline: new Date('2026-12-01T23:59:59.000Z'),
      registrationLink: 'https://duhs.edu.pk/research',
      eligibility: 'Enrolled MBBS, BDS, and Pharm.D students in Pakistan.',
      feeNote: 'Rs. 800 per abstract submission.',
      sourceUrl: 'https://duhs.edu.pk/',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      expiresAt: new Date('2026-12-18T00:00:00.000Z'),
    },
    {
      stableKey: 'event-st-patricks-debate-2026',
      title: 'All-Karachi Bilingual Declamation Championship 2026',
      slug: 'st-patricks-bilingual-declamation-2026',
      description: 'Prestigious inter-collegiate public speaking tournament in Urdu and English, debating national socio-economic policies, technology ethics, and educational reform.',
      category: 'debate',
      organizer: 'St. Patrick’s College Literary Society',
      hostingInstitution: 'St. Patrick’s College, Karachi',
      city: 'Karachi',
      campusArea: 'Saddar',
      venue: 'St. Patrick’s Main Hall, Saddar, Karachi',
      format: 'physical',
      startsAt: new Date('2026-11-25T10:00:00.000Z'),
      endsAt: new Date('2026-11-26T15:00:00.000Z'),
      registrationDeadline: new Date('2026-11-20T23:59:59.000Z'),
      registrationLink: 'https://stpatrickscollege.edu.pk/declamation',
      eligibility: 'Intermediate colleges and O/A-Levels schools across Karachi.',
      feeNote: 'Free registration for invited institutional teams.',
      sourceUrl: 'https://stpatrickscollege.edu.pk/',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      expiresAt: new Date('2026-11-28T00:00:00.000Z'),
    },
  ];

  for (const ev of events) {
    await upsert(Event, ev.stableKey, ev);
  }
}

// ==========================================
// 5. COMMUNITY DEMO FIXTURES (CLEARLY ISOLATED WITH isDemo: true)
// ==========================================
async function seedCommunity() {
  const hash = await bcrypt.hash('DemoStudentPass2026!', 10);

  // Demo User 1: Hamza Siddiqui (IBA CS Senior / Moderator)
  let user1 = await User.findOne({ email: 'mentor.hamza@demo.acadiv.internal' });
  if (!user1) {
    user1 = await User.create({
      email: 'mentor.hamza@demo.acadiv.internal',
      passwordHash: hash,
      displayName: 'Hamza Siddiqui (IBA CS Senior)',
      role: 'moderator',
      accountStatus: 'active',
      emailVerifiedAt: CHECKED,
    });
  }

  // Demo User 2: Dua Fatima (NED Civil 3rd Year)
  let user2 = await User.findOne({ email: 'dua.fatima@demo.acadiv.internal' });
  if (!user2) {
    user2 = await User.create({
      email: 'dua.fatima@demo.acadiv.internal',
      passwordHash: hash,
      displayName: 'Dua Fatima (NED Civil 3rd Year)',
      role: 'student',
      accountStatus: 'active',
      emailVerifiedAt: CHECKED,
    });
  }

  // Demo User 3: Bilal Ahmed (Adamjee College to FAST CS)
  let user3 = await User.findOne({ email: 'bilal.ahmed@demo.acadiv.internal' });
  if (!user3) {
    user3 = await User.create({
      email: 'bilal.ahmed@demo.acadiv.internal',
      passwordHash: hash,
      displayName: 'Bilal Ahmed (Adamjee Pre-Eng Alumni)',
      role: 'student',
      accountStatus: 'active',
      emailVerifiedAt: CHECKED,
    });
  }

  // Demo Discussion 1: FAST Entry Test Prep
  let post1 = await CommunityPost.findOne({ title: 'Complete Guide: Preparing for FAST-NUCES Karachi Entry Test 2026' });
  if (!post1) {
    post1 = await CommunityPost.create({
      authorId: user1._id,
      title: 'Complete Guide: Preparing for FAST-NUCES Karachi Entry Test 2026',
      content:
        'A lot of students ask about the NU entry test weightage. Remember: Advanced Mathematics carries the highest negative-marking impact. Focus 70% of your prep time on FSC 1st & 2nd year Math (especially Integration, Conics, and Trigonometry). Do timed speed tests daily!',
      tags: ['Admissions', 'FAST', 'EntryTest', 'Karachi'],
      category: 'admissions',
      moderationStatus: 'approved',
      visibilityStatus: 'public',
      upvoteCount: 48,
      isDemo: true,
    });

    await CommunityReply.create({
      postId: post1._id,
      authorId: user1._id,
      content: 'Pro-tip: Do not guess questions if you are unsure beyond 50/50 odds, because 0.25 negative marking quickly pulls down your merit aggregate.',
      moderationStatus: 'approved',
      isExpertLabel: true,
      isDemo: true,
    });

    await CommunityReply.create({
      postId: post1._id,
      authorId: user3._id,
      content: 'Can confirm! I prepared past papers from KIPS / Dogar series and focused on speed calculus. Cleared FAST Karachi merit with 78 aggregate.',
      moderationStatus: 'approved',
      isExpertLabel: false,
      isDemo: true,
    });
  }

  // Demo Discussion 2: Pre-Engineering vs ICS
  let post2 = await CommunityPost.findOne({ title: 'Pre-Engineering vs ICS: Which gives you more leverage in Karachi?' });
  if (!post2) {
    post2 = await CommunityPost.create({
      authorId: user2._id,
      title: 'Pre-Engineering vs ICS: Which gives you more leverage in Karachi?',
      content:
        'If you are 100% certain you want Computer Science, Software Engineering, or Artificial Intelligence, ICS with Physics and Math is completely recognized by NED, FAST, IBA, and UoK. Pre-Engineering gives you the backup option of Civil/Electrical/Mechanical if you change your mind later.',
      tags: ['Intermediate', 'CareerGuidance', 'Karachi'],
      category: 'guidance',
      moderationStatus: 'approved',
      visibilityStatus: 'public',
      upvoteCount: 39,
      isDemo: true,
    });

    await CommunityReply.create({
      postId: post2._id,
      authorId: user1._id,
      content: 'At IBA, students from both Pre-Eng and ICS perform equally well. What matters most is getting at least 60% in HSC to qualify for the aptitude test.',
      moderationStatus: 'approved',
      isExpertLabel: true,
      isDemo: true,
    });
  }

  // Demo Discussion 3: Jawan Pakistan vs SMIT
  let post3 = await CommunityPost.findOne({ title: 'Jawan Pakistan Agentic AI Course vs SMIT MERN Stack — Student Perspective' });
  if (!post3) {
    await CommunityPost.create({
      authorId: user3._id,
      title: 'Jawan Pakistan Agentic AI Course vs SMIT MERN Stack — Student Perspective',
      content:
        'I have taken classes at both institutes in Karachi. SMIT at Bahadurabad is excellent for absolute beginners wanting deep 1-year foundations in HTML/CSS/JavaScript/MERN. Jawan Pakistan at RJ Mall is great for fast-paced modern AI agents and LLM tool calling if you already know basic coding.',
      tags: ['Bootcamps', 'JawanPakistan', 'SMIT', 'KarachiSkills'],
      category: 'skills',
      moderationStatus: 'approved',
      visibilityStatus: 'public',
      upvoteCount: 52,
      isDemo: true,
    });
  }
}

// ==========================================
// 6. MAIN SEED RUNNER
// ==========================================
async function main() {
  const env = loadEnv();
  await connectDB(env.mongodbUri);
  console.log('[seed] Connected to MongoDB Atlas');

  // Upsert all institutions
  for (const inst of institutions) {
    await upsert(Institution, inst.stableKey, inst);
  }

  // Upsert skill firms & courses
  await seedSkillFirms();

  // Upsert careers
  for (const c of careers) {
    await upsert(Career, c.stableKey, c);
  }

  // Upsert events
  await seedEvents();

  // Upsert community demo fixtures
  await seedCommunity();

  console.log('[seed] Seeding completed successfully:', stats);
  await disconnectDB();
  process.exit(stats.rejected ? 1 : 0);
}

main().catch(async (err) => {
  console.error('[seed] fatal error:', err.message);
  try {
    await disconnectDB();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
