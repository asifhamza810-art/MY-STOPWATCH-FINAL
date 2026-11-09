const AppError = require('../utils/AppError');
const {
  AssessmentVersion,
  AssessmentQuestion,
  AssessmentSession,
  AssessmentResult,
} = require('../models/Assessment');
const { Career } = require('../models/Career');

const DIMENSIONS = ['R', 'I', 'A', 'S', 'E', 'C'];

const DIMENSION_LABELS = {
  R: 'Realistic — practical, hands-on, building and troubleshooting',
  I: 'Investigative — analysis, research, figuring out how things work',
  A: 'Artistic — design, expression, creative problem framing',
  S: 'Social — helping, teaching, community-facing work',
  E: 'Enterprising — leading, persuading, organizing ventures',
  C: 'Conventional — structuring information, processes, and details',
};

async function getPublishedVersion() {
  const version = await AssessmentVersion.findOne({ publicationStatus: 'published' }).sort({
    publishedAt: -1,
  });
  if (!version) throw new AppError('No published assessment version', 503, 'ASSESSMENT_UNAVAILABLE');
  return version;
}

function emptyScores() {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function accumulateScores(answers) {
  const scores = emptyScores();
  for (const ans of answers) {
    const w = ans.dimensionWeights || {};
    for (const d of DIMENSIONS) scores[d] += Number(w[d] || 0);
  }
  return scores;
}

function normalizeScores(scores) {
  const max = Math.max(...DIMENSIONS.map((d) => scores[d]), 1);
  const normalized = {};
  for (const d of DIMENSIONS) normalized[d] = Math.round((scores[d] / max) * 100);
  return normalized;
}

function hollandCode(normalized) {
  return [...DIMENSIONS]
    .sort((a, b) => normalized[b] - normalized[a] || a.localeCompare(b))
    .slice(0, 3)
    .join('');
}

function buildReasonTrace(answers, scores, normalized, code) {
  const trace = [];
  trace.push(`Scored ${answers.length} answers against RIASEC weights (scoringVersion riasec-v1).`);
  const ranked = [...DIMENSIONS].sort((a, b) => normalized[b] - normalized[a]);
  trace.push(
    `Top dimensions: ${ranked
      .slice(0, 3)
      .map((d) => `${d}=${normalized[d]}`)
      .join(', ')} → Holland code ${code}.`
  );
  for (const ans of answers.slice(0, 8)) {
    const top = DIMENSIONS.filter((d) => (ans.dimensionWeights?.[d] || 0) > 0)
      .sort((a, b) => (ans.dimensionWeights[b] || 0) - (ans.dimensionWeights[a] || 0))
      .slice(0, 2);
    if (top.length) {
      trace.push(
        `Answer ${ans.questionKey || 'Q'}/${ans.optionKey}: contributed to ${top.join('+')} (${DIMENSION_LABELS[top[0]]}).`
      );
    }
  }
  if (answers.length < 15) {
    trace.push('Fewer than 15 answers — treat the profile as provisional.');
  }
  return trace;
}

async function pickNextQuestion(session, version) {
  const answered = new Set(session.answeredQuestionIds.map(String));
  const questions = await AssessmentQuestion.find({
    assessmentVersionId: version.versionId,
    reviewStatus: 'approved',
  });

  const remaining = questions.filter((q) => !answered.has(String(q._id)));
  if (!remaining.length) return null;

  const dimCounts = emptyScores();
  for (const ans of session.answers) {
    for (const d of DIMENSIONS) {
      if ((ans.dimensionWeights?.[d] || 0) > 0) dimCounts[d] += 1;
    }
  }

  const weakest = [...DIMENSIONS].sort((a, b) => dimCounts[a] - dimCounts[b])[0];
  const preferred = remaining.filter((q) => q.primaryDimension === weakest);
  const pool = preferred.length ? preferred : remaining;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function startSession(userId) {
  const version = await getPublishedVersion();
  const existing = await AssessmentSession.findOne({
    userId,
    assessmentVersionId: version.versionId,
    status: 'in_progress',
  });
  if (existing) {
    const next = await pickNextQuestion(existing, version);
    return { session: existing, nextQuestion: serializeQuestion(next), version };
  }

  const session = await AssessmentSession.create({
    userId,
    assessmentVersionId: version.versionId,
  });
  const next = await pickNextQuestion(session, version);
  if (next) {
    session.selectedQuestionIds.push(next._id);
    await session.save();
  }
  return { session, nextQuestion: serializeQuestion(next), version };
}

function serializeQuestion(q) {
  if (!q) return null;
  return {
    id: q._id,
    questionKey: q.questionKey,
    text: q.text,
    scenarioContext: q.scenarioContext,
    options: q.options.map((o) => ({ key: o.key, label: o.label })),
  };
}

async function answerQuestion(userId, sessionId, questionId, optionKey) {
  const session = await AssessmentSession.findOne({ _id: sessionId, userId, status: 'in_progress' });
  if (!session) throw new AppError('Session not found', 404, 'NOT_FOUND');

  if (session.answeredQuestionIds.some((id) => String(id) === String(questionId))) {
    throw new AppError('Question already answered', 400, 'DUPLICATE_ANSWER');
  }

  const version = await AssessmentVersion.findOne({ versionId: session.assessmentVersionId });
  const question = await AssessmentQuestion.findById(questionId);
  if (!question || question.assessmentVersionId !== session.assessmentVersionId) {
    throw new AppError('Invalid question', 400, 'INVALID_QUESTION');
  }

  const option = question.options.find((o) => o.key === optionKey);
  if (!option) throw new AppError('Invalid option', 400, 'INVALID_OPTION');

  session.answers.push({
    questionId: question._id,
    questionKey: question.questionKey,
    optionKey,
    dimensionWeights: option.dimensionWeights,
  });
  session.answeredQuestionIds.push(question._id);
  session.lastActivityAt = new Date();

  const max = version.scoringRules.completionMaxAnswers || 20;
  const min = version.scoringRules.completionMinAnswers || 15;
  let result = null;
  let nextQuestion = null;

  if (session.answers.length >= max || (session.answers.length >= min && session.answers.length >= questionsNeeded(session))) {
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    result = await finalizeResult(session, version);
  } else {
    nextQuestion = await pickNextQuestion(session, version);
    if (nextQuestion && !session.selectedQuestionIds.some((id) => String(id) === String(nextQuestion._id))) {
      session.selectedQuestionIds.push(nextQuestion._id);
    }
    await session.save();
  }

  return {
    session,
    nextQuestion: serializeQuestion(nextQuestion),
    result,
    progress: {
      answered: session.answers.length,
      targetMin: min,
      targetMax: max,
      percent: Math.min(100, Math.round((session.answers.length / max) * 100)),
    },
  };
}

function questionsNeeded() {
  return 15;
}

const DIMENSION_NAMES = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

const CAREER_ARCHETYPES = {
  'software-engineer': {
    domain: 'Computing & IT',
    profile: { R: 60, I: 95, A: 40, S: 25, E: 45, C: 85 },
    strengths: ['Algorithmic Logic', 'Full-Stack Implementation', 'System Architecture'],
    growthAreas: ['Collaborative Code Reviews', 'Technical Communication'],
  },
  'data-analyst': {
    domain: 'Computing & IT',
    profile: { R: 35, I: 95, A: 35, S: 30, E: 55, C: 90 },
    strengths: ['Statistical Modeling', 'SQL Querying', 'BI Dashboards'],
    growthAreas: ['Business Domain Acumen', 'Executive Storytelling'],
  },
  'cybersecurity-analyst': {
    domain: 'Computing & IT',
    profile: { R: 65, I: 95, A: 30, S: 20, E: 40, C: 85 },
    strengths: ['Network Security', 'Vulnerability Auditing', 'Threat Mitigation'],
    growthAreas: ['Compliance Documentation', 'Cloud Security Protocols'],
  },
  'mechanical-engineer': {
    domain: 'Engineering',
    profile: { R: 95, I: 85, A: 30, S: 25, E: 35, C: 65 },
    strengths: ['CAD Modeling', 'Thermodynamic Analysis', 'Machinery Troubleshooting'],
    growthAreas: ['Industrial Automation & PLC', 'Project Estimation'],
  },
  'civil-engineer': {
    domain: 'Engineering',
    profile: { R: 95, I: 80, A: 40, S: 30, E: 50, C: 70 },
    strengths: ['Structural Calculation', 'Site Project Supervision', 'Materials Testing'],
    growthAreas: ['BIM & Revit Simulation', 'Contract Law'],
  },
  'medical-doctor': {
    domain: 'Medical & Health Sciences',
    profile: { R: 45, I: 95, A: 25, S: 90, E: 50, C: 70 },
    strengths: ['Clinical Diagnosis', 'Patient Empathy', 'Pathology Comprehension'],
    growthAreas: ['Emergency Ward Triage', 'Continuous Board Certification'],
  },
  'pharmacist': {
    domain: 'Medical & Health Sciences',
    profile: { R: 40, I: 90, A: 25, S: 65, E: 40, C: 85 },
    strengths: ['Pharmacological Chemistry', 'GMP Quality Assurance', 'Drug Interaction Analysis'],
    growthAreas: ['Clinical Trial Protocols', 'Healthcare Supply Chain'],
  },
  'nursing-allied-health': {
    domain: 'Medical & Health Sciences',
    profile: { R: 55, I: 75, A: 25, S: 95, E: 40, C: 70 },
    strengths: ['Direct Clinical Care', 'Patient Vital Monitoring', 'Empathetic Communication'],
    growthAreas: ['Intensive Care Procedures', 'Healthcare Team Leadership'],
  },
  'chartered-accountant': {
    domain: 'Business & Commerce',
    profile: { R: 20, I: 75, A: 20, S: 35, E: 70, C: 95 },
    strengths: ['Statutory Auditing', 'Financial Reporting', 'Corporate Tax Structuring'],
    growthAreas: ['Automated ERP Integration', 'Strategic Advisory'],
  },
  'corporate-lawyer': {
    domain: 'Law & Public Services',
    profile: { R: 20, I: 85, A: 35, S: 60, E: 90, C: 80 },
    strengths: ['Statutory Research', 'Contract Drafting', 'Oral Advocacy & Litigation'],
    growthAreas: ['Commercial Arbitration', 'Tech Regulation & IP'],
  },
  'ux-designer': {
    domain: 'Creative & Design Industries',
    profile: { R: 30, I: 65, A: 95, S: 70, E: 55, C: 50 },
    strengths: ['User Interview Research', 'Design Systems & Figma', 'Interactive Prototyping'],
    growthAreas: ['Design ROI Metrics', 'Advanced Frontend Integration'],
  },
  'clinical-psychologist': {
    domain: 'Humanities & Social Sciences',
    profile: { R: 20, I: 90, A: 40, S: 95, E: 45, C: 50 },
    strengths: ['Psychometric Assessment', 'Cognitive Behavioral Therapy', 'Empathetic Active Listening'],
    growthAreas: ['Neuropsychology Specialization', 'Clinical Case Publication'],
  },
  'educator': {
    domain: 'Education',
    profile: { R: 30, I: 70, A: 50, S: 95, E: 60, C: 65 },
    strengths: ['Pedagogical Instruction', 'Curriculum Design', 'Student Mentorship'],
    growthAreas: ['Educational Technology Integration', 'Formative Assessment Rubrics'],
  },
  'supply-chain-manager': {
    domain: 'Business & Commerce',
    profile: { R: 50, I: 70, A: 25, S: 45, E: 85, C: 90 },
    strengths: ['Port & Freight Logistics', 'Inventory Optimization', 'Vendor Negotiation'],
    growthAreas: ['Supply Chain Risk Modeling', 'Automated Warehouse Systems'],
  },
  'digital-marketer': {
    domain: 'Business & Commerce',
    profile: { R: 25, I: 60, A: 75, S: 65, E: 95, C: 60 },
    strengths: ['Growth Experiments', 'Performance Ad Optimization', 'Content Framing'],
    growthAreas: ['Attribution Modeling', 'Marketing Automation'],
  },
};

function getCareerArchetype(career) {
  const custom = career.riasecProfile;
  if (custom && Object.values(custom).some((v) => v > 20)) {
    return {
      domain: career.domain || 'Professional Domain',
      profile: custom,
      strengths: career.strengths?.length ? career.strengths : career.requiredSkills || [],
      growthAreas: career.growthAreas?.length ? career.growthAreas : career.usefulSkills || [],
    };
  }
  const fallback = CAREER_ARCHETYPES[career.slug];
  if (fallback) return fallback;

  return {
    domain: career.domain || career.disciplines?.[0] || 'Professional Field',
    profile: { R: 40, I: 70, A: 40, S: 50, E: 60, C: 60 },
    strengths: career.requiredSkills?.length ? career.requiredSkills : ['Analytical Reasoning', 'Domain Practice'],
    growthAreas: career.usefulSkills?.length ? career.usefulSkills : ['Specialized Credentials'],
  };
}

function calculateCompatibility(normScores, careerProfile) {
  let sumSq = 0;
  for (const d of DIMENSIONS) {
    const diff = (normScores[d] || 0) - (careerProfile[d] || 0);
    sumSq += diff * diff;
  }
  const maxPossibleDist = Math.sqrt(6 * 100 * 100);
  const dist = Math.sqrt(sumSq) / maxPossibleDist;

  let topOverlap = 0;
  for (const d of DIMENSIONS) {
    if ((normScores[d] || 0) >= 45 && (careerProfile[d] || 0) >= 45) {
      topOverlap += 3.5;
    }
  }

  const rawScore = 100 - dist * 55 + topOverlap;
  return Math.max(42, Math.min(97, Math.round(rawScore)));
}

function generateIndividualizedExplanation(career, normScores, careerProfile, archetype) {
  const ranked = [...DIMENSIONS].sort((a, b) => (normScores[b] || 0) - (normScores[a] || 0));
  const topD1 = ranked[0];
  const topD2 = ranked[1];
  const s1 = normScores[topD1] || 0;
  const s2 = normScores[topD2] || 0;

  const domain = archetype.domain || career.domain || 'Professional Field';

  const domainRationales = {
    'Computing & IT': `Your strong ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) interests reflect a preference for structured analytical reasoning, code architecture, and iterative problem decomposition. This directly matches ${career.title}'s focus on algorithmic design, software testing, and technology systems.`,
    'Engineering': `Your prominent ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) profile indicates strong hands-on problem-solving, spatial analysis, and technical modeling. This aligns closely with ${career.title}'s demands for physical mechanics, structural calculations, and engineering precision.`,
    'Medical & Health Sciences': `Your elevated ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) scores combine scientific curiosity with patient-facing empathy, directly supporting the clinical diagnosis, physiology understanding, and patient care required in ${career.title}.`,
    'Business & Commerce': `Your high ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) inclinations show an aptitude for quantitative metrics, strategic resource allocation, and organizational governance essential for ${career.title}.`,
    'Law & Public Services': `Your strong ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) profile reflects analytical statutory interpretation, oral persuasion, and regulatory compliance central to ${career.title}.`,
    'Creative & Design Industries': `Your pronounced ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) scores show visual framing, user empathy, and interactive design craft, matching ${career.title}'s emphasis on human-centered experiences and responsive layout design.`,
    'Humanities & Social Sciences': `Your prominent ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) inclinations match the clinical observation, empathetic counseling, and behavioral understanding required in ${career.title}.`,
    'Education': `Your ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) scores indicate passion for knowledge transfer, student mentorship, and structured curriculum delivery in ${career.title}.`,
  };

  return domainRationales[domain] || `Your ${DIMENSION_NAMES[topD1]} (${s1}%) and ${DIMENSION_NAMES[topD2]} (${s2}%) inclinations provide a strong personal fit with the core competencies, analytical tasks, and operational context of ${career.title}.`;
}

async function finalizeResult(session, version) {
  const scores = accumulateScores(session.answers);
  const normalizedScores = normalizeScores(scores);
  const code = hollandCode(normalizedScores);
  const reasonTrace = buildReasonTrace(session.answers, scores, normalizedScores, code);

  const careers = await Career.find({ verificationStatus: { $in: ['verified', 'provisional'] } }).limit(60);
  const scoredCareers = [];

  for (const career of careers) {
    const archetype = getCareerArchetype(career);
    const compatibilityScore = calculateCompatibility(normalizedScores, archetype.profile);

    const matchingDimensions = DIMENSIONS.filter(
      (d) => (normalizedScores[d] || 0) >= 40 && (archetype.profile[d] || 0) >= 40
    );

    const why = generateIndividualizedExplanation(career, normalizedScores, archetype.profile, archetype);

    scoredCareers.push({
      careerId: career._id,
      slug: career.slug,
      title: career.title,
      domain: archetype.domain || career.domain || 'Professional Field',
      compatibilityScore,
      why,
      matchingDimensions: matchingDimensions.length ? matchingDimensions : [code[0], code[1]],
      strengths: archetype.strengths.slice(0, 3),
      growthAreas: archetype.growthAreas.slice(0, 2),
      relevantPathway: career.educationRoutes?.[0] || 'Bachelor degree or professional qualification',
      uncertainty: 'This is an exploratory interest compatibility index derived from your RIASEC answers. It is not an admission guarantee or statistical outcome prediction.',
    });
  }

  // Stable sort by compatibility descending, then slug ascending
  scoredCareers.sort((a, b) => b.compatibilityScore - a.compatibilityScore || a.slug.localeCompare(b.slug));

  // Exactly THREE primary recommendations
  const top = scoredCareers.slice(0, 3);
  const alt = scoredCareers.slice(3, 7);

  if (!top.length) {
    top.push({
      title: 'Explore multiple pathways',
      domain: 'General Guidance',
      compatibilityScore: 70,
      why: `Your Holland code ${code} represents diverse interests. Review our institution and bootcamp directories to explore available programmes.`,
      matchingDimensions: [code[0], code[1]],
      strengths: ['Adaptability', 'Broad Inclinations'],
      growthAreas: ['Domain Specialization'],
      relevantPathway: 'Foundation Year / General Studies',
      uncertainty: 'Catalog matching was limited.',
    });
  }

  const missingInformation = [];
  if (session.answers.length < 18) missingInformation.push('Additional answers would refine dimension separation.');
  missingInformation.push('Subjects, grades, and city constraints were not used in this scoring pass.');

  return AssessmentResult.create({
    userId: session.userId,
    sessionId: session._id,
    assessmentVersionId: version.versionId,
    scores,
    normalizedScores,
    hollandCode: code,
    reasonTrace,
    recommendedFields: top,
    alternativeFields: alt,
    missingInformation,
  });
}


function dimensionCareerHints(d) {
  const map = {
    R: ['engineer', 'mechanical', 'civil', 'technician', 'hardware', 'lab'],
    I: ['data', 'research', 'science', 'analyst', 'software', 'medical'],
    A: ['design', 'media', 'architect', 'creative', 'ux', 'content'],
    S: ['teach', 'counsel', 'health', 'social', 'nurse', 'community'],
    E: ['business', 'market', 'entrepreneur', 'product', 'management', 'sales'],
    C: ['account', 'finance', 'admin', 'operations', 'quality', 'compliance'],
  };
  return map[d] || [];
}

async function getLatestResult(userId) {
  return AssessmentResult.findOne({ userId }).sort({ calculatedAt: -1 });
}

module.exports = {
  startSession,
  answerQuestion,
  getLatestResult,
  serializeQuestion,
  DIMENSION_LABELS,
};
