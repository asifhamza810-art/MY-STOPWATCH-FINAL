const mongoose = require('mongoose');
require('dotenv').config();

const CAREER_DATA = {
  'software-engineer': {
    domain: 'Computing & IT',
    profile: { R: 60, I: 95, A: 40, S: 25, E: 45, C: 85 },
    strengths: ['Algorithmic Logic', 'Full-Stack Implementation', 'System Architecture'],
    growthAreas: ['Collaborative Code Reviews', 'Technical Communication'],
    requiredSkills: ['JavaScript / TypeScript', 'React / Modern Frontend', 'Node.js & API Engineering', 'Relational & Document Databases', 'Data Structures & Algorithms'],
    usefulSkills: ['Docker & Containerization', 'CI/CD Pipelines', 'System Design', 'Cloud Deployment (AWS/GCP)']
  },
  'data-analyst': {
    domain: 'Computing & IT',
    profile: { R: 35, I: 95, A: 35, S: 30, E: 55, C: 90 },
    strengths: ['Statistical Modeling', 'SQL Querying', 'BI Dashboards'],
    growthAreas: ['Business Domain Acumen', 'Executive Storytelling'],
    requiredSkills: ['SQL & Query Optimization', 'Python / Pandas for Data Science', 'Power BI / Tableau Dashboards', 'Statistical Hypothesis Testing', 'Excel Advanced Modeling'],
    usefulSkills: ['Machine Learning Basics', 'Data Pipeline ETL', 'A/B Testing Methodology', 'Cloud Data Warehouses (BigQuery)']
  },
  'cybersecurity-analyst': {
    domain: 'Computing & IT',
    profile: { R: 65, I: 95, A: 30, S: 20, E: 40, C: 85 },
    strengths: ['Network Security', 'Vulnerability Auditing', 'Threat Mitigation'],
    growthAreas: ['Compliance Documentation', 'Cloud Security Protocols'],
    requiredSkills: ['TCP/IP & Network Protocols', 'Linux System Administration', 'Vulnerability Assessment (Nessus/Wireshark)', 'SIEM Monitoring & Incident Response', 'Web App Security (OWASP Top 10)'],
    usefulSkills: ['Penetration Testing (Kali Linux)', 'SOC Operations', 'Cryptography Fundamentals', 'ISO 27001 Compliance']
  },
  'mechanical-engineer': {
    domain: 'Engineering',
    profile: { R: 95, I: 85, A: 30, S: 25, E: 35, C: 65 },
    strengths: ['CAD Modeling', 'Thermodynamic Analysis', 'Machinery Troubleshooting'],
    growthAreas: ['Industrial Automation & PLC', 'Project Estimation'],
    requiredSkills: ['SolidWorks / AutoCAD Modeling', 'Engineering Thermodynamics', 'Fluid Mechanics & Heat Transfer', 'Manufacturing Processes & CNC', 'Mechanical Stress Analysis'],
    usefulSkills: ['ANSYS FEA Simulation', 'PLC & Industrial Automation', 'Preventive Maintenance Scheduling', 'Six Sigma Quality Control']
  },
  'civil-engineer': {
    domain: 'Engineering',
    profile: { R: 95, I: 80, A: 40, S: 30, E: 50, C: 70 },
    strengths: ['Structural Calculation', 'Site Project Supervision', 'Materials Testing'],
    growthAreas: ['BIM & Revit Simulation', 'Contract Law'],
    requiredSkills: ['Structural Analysis (ETABS / SAP2000)', 'AutoCAD Civil 3D', 'Concrete & Soil Mechanics', 'Site Supervision & Quality Assurance', 'Construction Estimation & BOQ'],
    usefulSkills: ['Revit BIM Modeling', 'Primavera P6 Project Scheduling', 'Surveying & Total Station', 'FIDIC Contract Management']
  },
  'medical-doctor': {
    domain: 'Medical & Health Sciences',
    profile: { R: 45, I: 95, A: 25, S: 90, E: 50, C: 70 },
    strengths: ['Clinical Diagnosis', 'Patient Empathy', 'Pathology Comprehension'],
    growthAreas: ['Emergency Ward Triage', 'Continuous Board Certification'],
    requiredSkills: ['Human Anatomy & Physiology', 'Clinical Pathology & Diagnostics', 'Pharmacology & Drug Administration', 'Patient History & Clinical Examination', 'Emergency First Response & BLS'],
    usefulSkills: ['Medical Ethics & Consent Protocols', 'Electronic Medical Records (EMR)', 'Public Health Epidemiology', 'Clinical Research & Case Audit']
  },
  'pharmacist': {
    domain: 'Medical & Health Sciences',
    profile: { R: 40, I: 90, A: 25, S: 65, E: 40, C: 85 },
    strengths: ['Pharmacological Chemistry', 'GMP Quality Assurance', 'Drug Interaction Analysis'],
    growthAreas: ['Clinical Trial Protocols', 'Healthcare Supply Chain'],
    requiredSkills: ['Pharmacology & Toxicology', 'Pharmaceutics & Formulation Science', 'Hospital & Community Pharmacy Dispensing', 'Drug Interaction & Adverse Event Monitoring', 'Quality Control & Assay Techniques'],
    usefulSkills: ['Current Good Manufacturing Practice (cGMP)', 'Clinical Trial Protocol Design', 'Pharmaceutical Supply Chain', 'Regulatory Affairs (DRAP Compliance)']
  },
  'nursing-allied-health': {
    domain: 'Medical & Health Sciences',
    profile: { R: 55, I: 75, A: 25, S: 95, E: 40, C: 70 },
    strengths: ['Direct Clinical Care', 'Patient Vital Monitoring', 'Empathetic Communication'],
    growthAreas: ['Intensive Care Procedures', 'Healthcare Team Leadership'],
    requiredSkills: ['Patient Vitals & Clinical Assessment', 'Infection Prevention & Sterilization', 'Medication Administration & IV Therapy', 'Wound Management & Post-Op Care', 'Empathetic Patient & Family Communication'],
    usefulSkills: ['ICU / CCU Patient Monitoring', 'Basic & Advanced Cardiac Life Support (ACLS)', 'Healthcare Documentation', 'Palliative & Geriatric Care']
  },
  'chartered-accountant': {
    domain: 'Business & Commerce',
    profile: { R: 20, I: 75, A: 20, S: 35, E: 70, C: 95 },
    strengths: ['Statutory Auditing', 'Financial Reporting', 'Corporate Tax Structuring'],
    growthAreas: ['Automated ERP Integration', 'Strategic Advisory'],
    requiredSkills: ['International Financial Reporting Standards (IFRS)', 'Statutory Financial Auditing (ISAs)', 'Direct & Indirect Corporate Taxation', 'Cost & Management Accounting', 'Advanced Financial Modeling in Excel'],
    usefulSkills: ['SAP ERP & Oracle Financials', 'Corporate Law & SECP Compliance', 'Financial Due Diligence', 'Treasury & Risk Management']
  },
  'corporate-lawyer': {
    domain: 'Law & Public Services',
    profile: { R: 20, I: 85, A: 35, S: 60, E: 90, C: 80 },
    strengths: ['Statutory Research', 'Contract Drafting', 'Oral Advocacy & Litigation'],
    growthAreas: ['Commercial Arbitration', 'Tech Regulation & IP'],
    requiredSkills: ['Corporate Contract Drafting & Review', 'Pakistani Statutory & Case Law Research', 'Civil & Commercial Procedure', 'Legal Opinion Writing', 'Regulatory Compliance (SECP/Competition Law)'],
    usefulSkills: ['Alternative Dispute Resolution (ADR)', 'Intellectual Property Protection', 'Mergers & Acquisitions Due Diligence', 'Cross-Border Trade Law']
  },
  'ux-designer': {
    domain: 'Creative & Design Industries',
    profile: { R: 30, I: 65, A: 95, S: 70, E: 55, C: 50 },
    strengths: ['User Interview Research', 'Design Systems & Figma', 'Interactive Prototyping'],
    growthAreas: ['Design ROI Metrics', 'Advanced Frontend Integration'],
    requiredSkills: ['Figma Component Systems & Auto-Layout', 'User Research & Persona Synthesis', 'Information Architecture & Wireframing', 'Interactive Micro-Prototyping', 'Design Heuristic & Usability Testing'],
    usefulSkills: ['Design Systems Documentation (Tokens)', 'HTML/CSS Layout Understanding', 'Accessibility (WCAG 2.1 AA) Compliance', 'Motion Design & Micro-interactions']
  },
  'clinical-psychologist': {
    domain: 'Humanities & Social Sciences',
    profile: { R: 20, I: 90, A: 40, S: 95, E: 45, C: 50 },
    strengths: ['Psychometric Assessment', 'Cognitive Behavioral Therapy', 'Empathetic Active Listening'],
    growthAreas: ['Neuropsychology Specialization', 'Clinical Case Publication'],
    requiredSkills: ['Psychological Assessment & Diagnostic Formulations', 'Cognitive Behavioral Therapy (CBT) Frameworks', 'Clinical Interviewing & Active Listening', 'Crisis Intervention & Suicide Prevention', 'Ethical Practice & Patient Confidentiality'],
    usefulSkills: ['Mindfulness-Based Stress Reduction (MBSR)', 'Child & Adolescent Psychotherapy', 'Group Counseling Facilitation', 'Neuropsychological Screening']
  },
  'educator': {
    domain: 'Education',
    profile: { R: 30, I: 70, A: 50, S: 95, E: 60, C: 65 },
    strengths: ['Pedagogical Instruction', 'Curriculum Design', 'Student Mentorship'],
    growthAreas: ['Educational Technology Integration', 'Formative Assessment Rubrics'],
    requiredSkills: ['Lesson Planning & Curriculum Alignment', 'Classroom Engagement & Group Facilitation', 'Formative & Summative Student Assessment', 'Differentiated Instruction Strategies', 'Student Mentorship & Pastoral Guidance'],
    usefulSkills: ['Learning Management Systems (Canvas/Google Classroom)', 'Educational Technology Toolkits', 'Special Educational Needs (SEN) Differentiation', 'Action Research in Pedagogy']
  },
  'supply-chain-manager': {
    domain: 'Business & Commerce',
    profile: { R: 50, I: 70, A: 25, S: 45, E: 85, C: 90 },
    strengths: ['Port & Freight Logistics', 'Inventory Optimization', 'Vendor Negotiation'],
    growthAreas: ['Supply Chain Risk Modeling', 'Automated Warehouse Systems'],
    requiredSkills: ['Inventory Control & EOQ Optimization', 'Logistics & Freight Route Planning', 'Procurement & Vendor Contract Negotiation', 'Demand Forecasting & Sales & Operations Planning', 'Supply Chain ERP (SAP MM/SD)'],
    usefulSkills: ['Port Customs Clearance & Tariff Documentation', 'Cold Chain & Perishable Logistics', 'Warehouse Management Systems (WMS)', 'Supply Chain Resilience & Risk Hedging']
  },
  'digital-marketer': {
    domain: 'Business & Commerce',
    profile: { R: 25, I: 60, A: 75, S: 65, E: 95, C: 60 },
    strengths: ['Growth Experiments', 'Performance Ad Optimization', 'Content Framing'],
    growthAreas: ['Attribution Modeling', 'Marketing Automation'],
    requiredSkills: ['Meta & Google Ads Performance Optimization', 'Search Engine Optimization (Technical & On-Page)', 'Google Analytics 4 & Conversion Tracking', 'Email Marketing & Drip Automations', 'Persuasive Copywriting & Content Framing'],
    usefulSkills: ['Marketing Attribution & UTM Architecture', 'A/B Landing Page Split Testing', 'Social Media Community Governance', 'CRM Segmentation (HubSpot/Klaviyo)']
  }
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { Career } = require('../models/Career');

    for (const [slug, data] of Object.entries(CAREER_DATA)) {
      const res = await Career.updateOne(
        { slug },
        {
          $set: {
            domain: data.domain,
            riasecProfile: data.profile,
            strengths: data.strengths,
            growthAreas: data.growthAreas,
            requiredSkills: data.requiredSkills,
            usefulSkills: data.usefulSkills
          }
        }
      );
      console.log(`Updated ${slug}: matched=${res.matchedCount}, modified=${res.modifiedCount}`);
    }

    console.log('Finished updating career metadata successfully.');
  } catch (err) {
    console.error('Error updating careers:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

