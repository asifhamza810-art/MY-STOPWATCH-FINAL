const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created } = require('../utils/apiResponse');
const StudentProfile = require('../models/StudentProfile');
const UserPreferences = require('../models/UserPreferences');
const { Career, StudentRoadmap } = require('../models/Career');
const { StudentSkill, SkillGapAssessment, Skill } = require('../models/Skill');
const Artifact = require('../models/Artifact');
const { Portfolio, PortfolioShare } = require('../models/Portfolio');
const {
  CommunityPost,
  CommunityReply,
  CommunityVote,
  ModerationReport,
} = require('../models/Community');
const assessmentService = require('../services/assessmentService');
const { hashToken, randomToken } = require('../utils/tokens');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('activeCareerId');
  ok(res, profile);
});

exports.selectActiveCareer = asyncHandler(async (req, res) => {
  const { careerId, slug } = req.body || {};
  if (!careerId && !slug) {
    throw new AppError('careerId or slug is required', 400, 'VALIDATION_ERROR');
  }

  const { Career } = require('../models/Career');
  const career = careerId
    ? await Career.findById(careerId)
    : await Career.findOne({ slug });

  if (!career) {
    throw new AppError('Selected career not found in catalog', 404, 'NOT_FOUND');
  }

  // Get student latest assessment for compatibility
  const assessment = await assessmentService.getLatestResult(req.user._id);
  let compatibilityScore = 80;
  if (assessment && assessment.normalizedScores) {
    const careerProfile = career.riasecProfile || {};
    let sumSq = 0;
    for (const d of ['R', 'I', 'A', 'S', 'E', 'C']) {
      const diff = (assessment.normalizedScores[d] || 0) - (careerProfile[d] || 50);
      sumSq += diff * diff;
    }
    const dist = Math.sqrt(sumSq) / 245;
    compatibilityScore = Math.max(45, Math.min(98, Math.round(100 - dist * 55)));
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        activeCareerId: career._id,
        activeCareerSlug: career.slug,
        activeCareerTitle: career.title,
        activeCareerDomain: career.domain || career.disciplines?.[0] || 'Professional',
        activeCareerCompatibility: compatibilityScore,
        activeCareerSelectedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  ).populate('activeCareerId');

  ok(res, {
    profile,
    activeCareer: {
      id: career._id,
      title: career.title,
      slug: career.slug,
      domain: career.domain || career.disciplines?.[0] || 'Professional',
      compatibilityScore,
      selectedAt: profile.activeCareerSelectedAt,
    },
  });
});


exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'preferredName',
    'educationStage',
    'educationStream',
    'boardOrQualification',
    'currentStudyYear',
    'subjects',
    'academicPreferences',
    'careerInterests',
    'preferredLearningStyle',
    'city',
    'province',
    'budgetPreference',
    'timeAvailability',
    'activeCareerId',
    'activeCareerSlug',
    'activeCareerTitle',
    'activeCareerDomain',
    'activeCareerCompatibility',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  updates.profileCompletionState = updates.educationStage ? 'partial' : 'empty';
  if (updates.educationStage && updates.subjects?.length) updates.profileCompletionState = 'complete';
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { new: true, upsert: true }
  );
  ok(res, profile);
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  const prefs = await UserPreferences.findOneAndUpdate(
    { userId: req.user._id },
    { $set: req.body || {} },
    { new: true, upsert: true }
  );
  ok(res, prefs);
});

exports.startAssessment = asyncHandler(async (req, res) => {
  const data = await assessmentService.startSession(req.user._id);
  const min = data.version?.scoringRules?.completionMinAnswers || 15;
  const max = data.version?.scoringRules?.completionMaxAnswers || 20;
  ok(res, {
    sessionId: data.session._id,
    status: data.session.status,
    answered: data.session.answers.length,
    targetMin: min,
    targetMax: max,
    percent: Math.min(100, Math.round((data.session.answers.length / max) * 100)),
    nextQuestion: data.nextQuestion,
    versionId: data.version.versionId,
    disclaimer:
      'Acadiv RIASEC guidance is exploratory. It is not a psychometric diagnosis or a guarantee of career outcomes.',
  });
});

exports.answerAssessment = asyncHandler(async (req, res) => {
  const { sessionId, questionId, optionKey } = req.body || {};
  if (!sessionId || !questionId || !optionKey) {
    throw new AppError('sessionId, questionId, and optionKey are required', 400, 'VALIDATION_ERROR');
  }
  const data = await assessmentService.answerQuestion(req.user._id, sessionId, questionId, optionKey);
  ok(res, {
    sessionId: data.session._id,
    status: data.session.status,
    progress: data.progress,
    nextQuestion: data.nextQuestion,
    result: data.result,
  });
});

exports.getMatch = asyncHandler(async (req, res) => {
  const result = await assessmentService.getLatestResult(req.user._id);
  if (!result) {
    return ok(res, {
      result: null,
      message: 'No completed assessment yet. Start the guided assessment to generate a match profile.',
    });
  }
  ok(res, {
    result,
    disclaimer:
      'Scores reflect your recorded answers under the assessment version used. They are not scientifically calibrated probabilities.',
  });
});

exports.listRoadmaps = asyncHandler(async (req, res) => {
  const items = await StudentRoadmap.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  ok(res, items);
});

exports.createRoadmap = asyncHandler(async (req, res) => {
  const { title, careerId, currentEducationStage, milestones, connections, timelineAssumptions, budgetAssumptions } =
    req.body || {};
  if (!title) throw new AppError('title is required', 400, 'VALIDATION_ERROR');
  const roadmap = await StudentRoadmap.create({
    userId: req.user._id,
    title,
    careerId,
    currentEducationStage,
    milestones: milestones || [],
    connections: connections || [],
    timelineAssumptions,
    budgetAssumptions,
    progressStatus: 'active',
  });
  created(res, roadmap);
});

exports.updateRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await StudentRoadmap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) throw new AppError('Roadmap not found', 404, 'NOT_FOUND');
  const fields = [
    'title',
    'milestones',
    'connections',
    'timelineAssumptions',
    'budgetAssumptions',
    'progressStatus',
    'currentEducationStage',
    'careerId',
  ];
  for (const f of fields) {
    if (req.body[f] !== undefined) roadmap[f] = req.body[f];
  }
  await roadmap.save();
  ok(res, roadmap);
});

exports.getSkillGap = asyncHandler(async (req, res) => {
  const careerId = req.query.careerId;
  const studentSkills = await StudentSkill.find({ userId: req.user._id }).populate('skillId');
  const allSkills = await Skill.find({ active: true });
  const declared = new Map(
    studentSkills.map((s) => [String(s.skillId?._id || s.skillId), s.declaredLevel])
  );

  const gaps = [];
  const missingInformation = [];
  if (!careerId) missingInformation.push('Select a career to compare against pathway skill expectations.');

  for (const skill of allSkills.slice(0, 30)) {
    const level = declared.get(String(skill._id)) || 'none';
    if (level === 'none' || level === 'exploring') {
      gaps.push({
        skillName: skill.name,
        currentLevel: level,
        targetLevel: 'working',
        priority: level === 'none' ? 'high' : 'medium',
        reason: 'Self-declared level is below a working competency for many technical pathways.',
        suggestedActions: ['Find a verified course under Skill Firms', 'Add project evidence in Artifact Vault'],
      });
    }
  }

  const assessment = await SkillGapAssessment.create({
    userId: req.user._id,
    careerId: careerId || undefined,
    gaps: gaps.slice(0, 12),
    missingInformation,
  });
  ok(res, { assessment, studentSkills });
});

exports.upsertStudentSkill = asyncHandler(async (req, res) => {
  const { skillId, declaredLevel, evidenceNote } = req.body || {};
  if (!skillId) throw new AppError('skillId required', 400, 'VALIDATION_ERROR');
  const item = await StudentSkill.findOneAndUpdate(
    { userId: req.user._id, skillId },
    { $set: { declaredLevel: declaredLevel || 'exploring', evidenceNote, claimSource: 'self' } },
    { upsert: true, new: true }
  );
  ok(res, item);
});

exports.listArtifacts = asyncHandler(async (req, res) => {
  const items = await Artifact.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  ok(res, items);
});

exports.createArtifact = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.title) throw new AppError('title required', 400, 'VALIDATION_ERROR');
  const doc = {
    userId: req.user._id,
    title: body.title,
    description: body.description,
    category: body.category || 'project',
    tags: body.tags || [],
    projectUrl: body.projectUrl,
    verificationState: body.projectUrl ? 'repository_linked' : 'self_reported',
  };
  if (req.file) {
    doc.storageProvider = 'local';
    doc.storageKey = req.file.filename;
    doc.originalFilename = req.file.originalname;
    doc.mimeType = req.file.mimetype;
    doc.fileSize = req.file.size;
    doc.verificationState = 'uploaded';
  }
  const artifact = await Artifact.create(doc);
  created(res, artifact);
});

exports.deleteArtifact = asyncHandler(async (req, res) => {
  const artifact = await Artifact.findOne({ _id: req.params.id, userId: req.user._id });
  if (!artifact) throw new AppError('Not found', 404, 'NOT_FOUND');
  if (artifact.storageKey) {
    const filePath = path.join(process.cwd(), 'uploads', artifact.storageKey);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await artifact.deleteOne();
  ok(res, { deleted: true });
});

exports.getMyPortfolio = asyncHandler(async (req, res) => {
  let portfolio = await Portfolio.findOne({ userId: req.user._id });
  ok(res, portfolio);
});

exports.upsertPortfolio = asyncHandler(async (req, res) => {
  const allowed = [
    'username',
    'headline',
    'biography',
    'selectedSkills',
    'educationRecords',
    'selectedArtifactIds',
    'visibility',
  ];
  const updates = {};
  for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
  if (updates.username) updates.username = String(updates.username).toLowerCase();
  let portfolio = await Portfolio.findOne({ userId: req.user._id });
  if (!portfolio) {
    if (!updates.username) throw new AppError('username required to create portfolio', 400, 'VALIDATION_ERROR');
    portfolio = await Portfolio.create({ userId: req.user._id, ...updates });
  } else {
    Object.assign(portfolio, updates);
    await portfolio.save();
  }
  ok(res, portfolio);
});

exports.createShareLink = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user._id });
  if (!portfolio) throw new AppError('Create a portfolio first', 400, 'VALIDATION_ERROR');
  const raw = randomToken(24);
  const share = await PortfolioShare.create({
    portfolioId: portfolio._id,
    tokenHash: hashToken(raw),
    expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
  });
  created(res, { shareId: share._id, token: raw, note: 'Store this token now; it is not shown again.' });
});

exports.getPublicPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ username: String(req.params.username).toLowerCase() });
  if (!portfolio) throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
  const token = req.query.token;
  let allowed = portfolio.visibility === 'public';
  if (!allowed && token) {
    const share = await PortfolioShare.findOne({
      portfolioId: portfolio._id,
      tokenHash: hashToken(token),
      active: true,
      revokedAt: null,
    });
    if (share && (!share.expiresAt || share.expiresAt > new Date())) allowed = true;
  }
  if (!allowed && portfolio.visibility === 'unlisted' && token) {
    /* already handled */
  }
  if (!allowed) throw new AppError('Portfolio is private', 403, 'FORBIDDEN');

  const artifacts = await Artifact.find({
    _id: { $in: portfolio.selectedArtifactIds || [] },
    accessClassification: { $in: ['public', 'unlisted'] },
  });

  ok(res, {
    username: portfolio.username,
    headline: portfolio.headline,
    biography: portfolio.biography,
    selectedSkills: portfolio.selectedSkills,
    educationRecords: portfolio.educationRecords,
    artifacts,
    updatedAt: portfolio.updatedAt,
  });
});

exports.listCommunityPosts = asyncHandler(async (req, res) => {
  const filter = { moderationStatus: 'approved', visibilityStatus: 'public' };
  if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 100) };
  if (req.query.tag) filter.tags = req.query.tag;
  const items = await CommunityPost.find(filter)
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('authorId', 'displayName role');
  ok(res, items);
});

exports.createCommunityPost = asyncHandler(async (req, res) => {
  const { title, content, tags, category } = req.body || {};
  if (!title || !content) throw new AppError('title and content required', 400, 'VALIDATION_ERROR');
  const post = await CommunityPost.create({
    authorId: req.user._id,
    title,
    content,
    tags: tags || [],
    category: category || 'general',
    moderationStatus: 'pending',
  });
  created(res, {
    post,
    message: 'Post submitted for moderation. It becomes visible after approval.',
  });
});

exports.replyToPost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post || post.moderationStatus !== 'approved') throw new AppError('Post not available', 404, 'NOT_FOUND');
  const reply = await CommunityReply.create({
    postId: post._id,
    authorId: req.user._id,
    content: req.body.content,
    parentReplyId: req.body.parentReplyId,
    moderationStatus: 'pending',
  });
  created(res, reply);
});

exports.getPostReplies = asyncHandler(async (req, res) => {
  const replies = await CommunityReply.find({
    postId: req.params.id,
    moderationStatus: 'approved',
  })
    .sort({ createdAt: 1 })
    .populate('authorId', 'displayName role');
  ok(res, replies);
});

exports.votePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post || post.moderationStatus !== 'approved') throw new AppError('Post not available', 404, 'NOT_FOUND');
  try {
    await CommunityVote.create({
      userId: req.user._id,
      targetType: 'post',
      targetId: post._id,
      voteType: 'up',
    });
    post.upvoteCount += 1;
    await post.save();
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  ok(res, { upvoteCount: post.upvoteCount });
});

exports.reportContent = asyncHandler(async (req, res) => {
  const { targetType, targetId, category, explanation } = req.body || {};
  if (!targetType || !targetId || !category) {
    throw new AppError('targetType, targetId, category required', 400, 'VALIDATION_ERROR');
  }
  const report = await ModerationReport.create({
    reporterId: req.user._id,
    targetType,
    targetId,
    category,
    explanation,
  });
  created(res, report);
});
