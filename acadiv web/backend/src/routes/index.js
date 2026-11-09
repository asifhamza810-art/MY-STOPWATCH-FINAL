const express = require('express');
const auth = require('../controllers/authController');
const catalog = require('../controllers/catalogController');
const student = require('../controllers/studentController');
const { protect, optionalAuth, requireRoles } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { upload } = require('../middleware/upload');
const { isReady } = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');
const { CommunityPost } = require('../models/Community');

const router = express.Router();

router.get('/health', (req, res) => {
  ok(res, { status: 'ok', service: 'acadiv-api', time: new Date().toISOString() });
});

router.get('/ready', (req, res) => {
  if (!isReady()) {
    return fail(res, 'MongoDB is not connected', 503, 'DB_NOT_READY');
  }
  ok(res, { status: 'ready', db: true });
});

router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.post('/auth/refresh', authLimiter, auth.refresh);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', protect, auth.me);
router.delete('/auth/me', protect, auth.deleteAccount);
router.delete('/profile', protect, auth.deleteAccount);

router.get('/institutions', catalog.listInstitutions);
router.get('/institutions/:slugOrId', catalog.getInstitution);
router.get('/skill-firms', catalog.listSkillFirms);
router.get('/skill-firms/:slugOrId', catalog.getSkillFirm);
router.get('/courses', catalog.listCourses);
router.get('/events', catalog.listEvents);
router.get('/events/:slugOrId', catalog.getEvent);
router.get('/careers', catalog.listCareers);
router.get('/careers/:slugOrId', catalog.getCareer);
router.get('/skills', catalog.listSkills);

router.get('/profile', protect, student.getProfile);
router.patch('/profile', protect, student.updateProfile);
router.post('/profile/active-career', protect, student.selectActiveCareer);
router.patch('/preferences', protect, student.updatePreferences);

router.post('/assessment/start', protect, student.startAssessment);
router.post('/assessment/answer', protect, student.answerAssessment);
router.get('/assessment/result', protect, student.getMatch);
router.get('/profile/match', protect, student.getMatch);

router.get('/roadmaps', protect, student.listRoadmaps);
router.post('/roadmaps', protect, student.createRoadmap);
router.patch('/roadmaps/:id', protect, student.updateRoadmap);

router.get('/skill-gap', protect, student.getSkillGap);
router.put('/student-skills', protect, student.upsertStudentSkill);

router.get('/artifacts', protect, student.listArtifacts);
router.post('/artifacts', protect, upload.single('file'), student.createArtifact);
router.delete('/artifacts/:id', protect, student.deleteArtifact);

router.get('/portfolio/me', protect, student.getMyPortfolio);
router.put('/portfolio/me', protect, student.upsertPortfolio);
router.post('/portfolio/share', protect, student.createShareLink);
router.get('/portfolio/:username', optionalAuth, student.getPublicPortfolio);

router.get('/community/posts', student.listCommunityPosts);
router.get('/community/posts/:id/replies', student.getPostReplies);
router.post('/community/posts', protect, student.createCommunityPost);
router.post('/community/posts/:id/replies', protect, student.replyToPost);
router.post('/community/posts/:id/vote', protect, student.votePost);
router.post('/community/reports', protect, student.reportContent);

router.patch(
  '/admin/community/posts/:id/moderate',
  protect,
  requireRoles('moderator', 'admin'),
  async (req, res, next) => {
    try {
      const post = await CommunityPost.findByIdAndUpdate(
        req.params.id,
        { $set: { moderationStatus: req.body.moderationStatus || 'approved' } },
        { new: true }
      );
      if (!post) return fail(res, 'Not found', 404, 'NOT_FOUND');
      ok(res, post);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
