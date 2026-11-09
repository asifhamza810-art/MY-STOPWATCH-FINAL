const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const Institution = require('../models/Institution');
const Programme = require('../models/Programme');
const Campus = require('../models/Campus');
const FeeRecord = require('../models/FeeRecord');
const SkillFirm = require('../models/SkillFirm');
const Course = require('../models/Course');
const Event = require('../models/Event');
const { Career, CareerPathway } = require('../models/Career');
const { Skill } = require('../models/Skill');

function paginate(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.listInstitutions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.city) filter.city = new RegExp(`^${escapeRegex(req.query.city)}$`, 'i');
  if (req.query.category) filter.category = req.query.category;
  if (req.query.area) filter.areas = new RegExp(escapeRegex(req.query.area), 'i');
  if (req.query.accreditationAuthority) filter.accreditationAuthority = req.query.accreditationAuthority;
  if (req.query.ownershipType) filter.ownershipType = req.query.ownershipType;
  if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 100) };

  // Domain / discipline-aware matching for active student career
  if (req.query.domain) {
    const domainTerm = escapeRegex(req.query.domain);
    const progInstIds = await Programme.find({
      $or: [
        { discipline: new RegExp(domainTerm, 'i') },
        { title: new RegExp(domainTerm, 'i') },
      ],
    }).distinct('institutionId');

    // Also match keywords in institution name/description for broad domains
    const domainKeywordMap = {
      'Computing & IT': ['computer', 'software', 'technology', 'fast', 'iba', 'ned', 'ubit'],
      Engineering: ['engineering', 'technology', 'ned', 'dawood', 'ssuet', 'polytechnic', 'gct'],
      'Medical & Health Sciences': ['medical', 'health', 'duhs', 'jsmu', 'nursing', 'pharmacy', 'dow', 'jinnah'],
      'Business & Commerce': ['business', 'commerce', 'iba', 'iobm', 'szabist', 'accounting'],
      'Law & Public Services': ['law', 'legal', 'public', 'szabist', 'karachi'],
      'Creative & Design Industries': ['design', 'architecture', 'habib', 'technology'],
      'Humanities & Social Sciences': ['arts', 'social', 'science', 'karachi', 'habib'],
      Education: ['education', 'college', 'higher'],
    };

    const keywords = domainKeywordMap[req.query.domain] || [req.query.domain];
    const regexConditions = keywords.map((kw) => ({
      $or: [
        { name: new RegExp(escapeRegex(kw), 'i') },
        { description: new RegExp(escapeRegex(kw), 'i') },
      ],
    }));

    const combinedOr = [{ _id: { $in: progInstIds } }, ...regexConditions];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: combinedOr }];
      delete filter.$or;
    } else {
      filter.$or = combinedOr;
    }
  }

  const [items, total] = await Promise.all([
    Institution.find(filter).sort({ verificationStatus: 1, name: 1 }).skip(skip).limit(limit),
    Institution.countDocuments(filter),
  ]);
  ok(res, items, { page, limit, total });
});

exports.getInstitution = asyncHandler(async (req, res) => {
  const item =
    (await Institution.findOne({ slug: req.params.slugOrId })) ||
    (await Institution.findById(req.params.slugOrId).catch(() => null));
  if (!item) return res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  const [campuses, programmes, fees] = await Promise.all([
    Campus.find({ institutionId: item._id }),
    Programme.find({ institutionId: item._id }),
    FeeRecord.find({ institutionId: item._id }),
  ]);
  ok(res, { institution: item, campuses, programmes, fees });
});

exports.listSkillFirms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.domain) {
    const domainKeywordMap = {
      'Computing & IT': ['AI', 'Development', 'MERN', 'Stack', 'Software', 'Cyber', 'Web'],
      'Engineering': ['Automation', 'Robotics', 'Hardware', 'Industrial'],
      'Creative & Design Industries': ['Design', 'UI/UX', 'Animation', 'Graphic', 'VFX'],
      'Business & Commerce': ['Marketing', 'FBA', 'Business', 'Freelancing', 'Analytics'],
      'Education': ['Teaching', 'Skills', 'Life Skills'],
    };
    const keywords = domainKeywordMap[req.query.domain] || [req.query.domain];
    const domainRegexes = keywords.map((k) => new RegExp(escapeRegex(k), 'i'));
    filter.skillDomains = { $in: domainRegexes };
  }
  if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 100) };
  const [items, total] = await Promise.all([
    SkillFirm.find(filter).sort({ isFeatured: -1, featuredPriority: 1, name: 1 }).skip(skip).limit(limit),
    SkillFirm.countDocuments(filter),
  ]);
  ok(res, items, { page, limit, total });
});

exports.getSkillFirm = asyncHandler(async (req, res) => {
  const firm =
    (await SkillFirm.findOne({ slug: req.params.slugOrId })) ||
    (await SkillFirm.findById(req.params.slugOrId).catch(() => null));
  if (!firm) return res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  const courses = await Course.find({ providerId: firm._id }).sort({ title: 1 });
  ok(res, { firm, courses });
});

exports.listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.providerId) filter.providerId = req.query.providerId;
  const [items, total] = await Promise.all([
    Course.find(filter).populate('providerId', 'name slug isFeatured featuredPriority').skip(skip).limit(limit),
    Course.countDocuments(filter),
  ]);
  ok(res, items, { page, limit, total });
});

exports.listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const now = new Date();
  const filter = { publicationStatus: 'published', expiresAt: { $gt: now } };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.city) filter.city = new RegExp(`^${escapeRegex(req.query.city)}$`, 'i');
  if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 100) };
  const [items, total] = await Promise.all([
    Event.find(filter).sort({ startsAt: 1 }).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);
  ok(res, items, { page, limit, total });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const item =
    (await Event.findOne({ slug: req.params.slugOrId })) ||
    (await Event.findById(req.params.slugOrId).catch(() => null));
  if (!item) return res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  ok(res, { event: item, expired: item.expiresAt <= new Date() || item.publicationStatus !== 'published' });
});

exports.listCareers = asyncHandler(async (req, res) => {
  const items = await Career.find({ verificationStatus: { $in: ['verified', 'provisional'] } }).sort({ title: 1 });
  ok(res, items);
});

exports.getCareer = asyncHandler(async (req, res) => {
  const career =
    (await Career.findOne({ slug: req.params.slugOrId })) ||
    (await Career.findById(req.params.slugOrId).catch(() => null));
  if (!career) return res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  const pathways = await CareerPathway.find({ careerId: career._id });
  ok(res, { career, pathways });
});

exports.listSkills = asyncHandler(async (req, res) => {
  const items = await Skill.find({ active: true }).sort({ name: 1 });
  ok(res, items);
});
