# Acadiv — Database Architecture & Persistence Specification

## 1. Executive Summary & Technology Foundation

Acadiv is an evidence-based educational and career navigation platform designed for Pakistani students with primary depth in Karachi's educational landscape.

- **Stack**: Node.js + Express.js + Mongoose + MongoDB Atlas.
- **Frontend Integration**: React 19 + Vite + React Router + Three.js / React Three Fiber + Motion for React.
- **Base Endpoint**: `/api/v1`
- **Security & Integrity**: Zero fabricated data, strict input sanitization, JWT access & refresh tokens, password hashing via bcrypt, granular server-side role-based access control (`student`, `contentReviewer`, `moderator`, `admin`).

---

## 2. Collection Inventory & Architecture

| Collection | Schema / Model | Purpose | Ownership / Access | Key Indexes |
|---|---|---|---|---|
| `users` | `User` | User credentials, roles, verification, lifecycle status | Private to user & admin | `email: 1` (unique), `role: 1, accountStatus: 1` |
| `studentprofiles` | `StudentProfile` | Pakistani education stage, stream, subjects, preferences | Student owner | `userId: 1` (unique) |
| `userpreferences` | `UserPreferences` | Notification, UI, and theme preferences | Student owner | `userId: 1` (unique) |
| `assessmentversions` | `AssessmentVersion` | RIASEC versioning (`riasec-pk-v1`), scoring rules | Public read, Admin write | `versionId: 1` (unique), `publicationStatus: 1` |
| `assessmentquestions` | `AssessmentQuestion` | Localized Karachi scenario question bank & weights | Public read, Admin write | `assessmentVersionId: 1, reviewStatus: 1` |
| `assessmentsessions` | `AssessmentSession` | Resumable student assessment progress and answer log | Student owner | `userId: 1, status: 1` |
| `assessmentresults` | `AssessmentResult` | Normalized RIASEC scores, Holland code, reason trace | Student owner | `userId: 1, createdAt: -1` |
| `careers` | `Career` | Documented career paths, typical responsibilities | Public read, Reviewer write | `slug: 1` (unique), `title: 'text', description: 'text'` |
| `careerpathways` | `CareerPathway` | Education routes, milestones, entrance exams | Public read, Reviewer write | `careerId: 1`, `stableKey: 1` (unique) |
| `studentroadmaps` | `StudentRoadmap` | Student customized 3D roadmap nodes & trade-offs | Student owner | `userId: 1, updatedAt: -1` |
| `skills` | `Skill` | Master technical & cognitive skills catalog | Public read, Admin write | `slug: 1` (unique), `active: 1` |
| `studentskills` | `StudentSkill` | Student self-declared competencies & evidence links | Student owner | `userId: 1, skillId: 1` (unique compound) |
| `skillgapassessments`| `SkillGapAssessment` | Prioritized skill gaps comparing user to target role | Student owner | `userId: 1, createdAt: -1` |
| `institutions` | `Institution` | Karachi/Pakistan accredited colleges & universities | Public read, Admin write | `slug: 1` (unique), `city: 1, category: 1` |
| `campuses` | `Campus` | Physical campus locations & addresses in Karachi | Public read, Admin write | `institutionId: 1`, `stableKey: 1` (unique) |
| `programmes` | `Programme` | Degree programmes, eligibility, test requirements | Public read, Admin write | `institutionId: 1, slug: 1`, `degreeLevel: 1` |
| `feerecords` | `FeeRecord` | Official verified semester fees & academic years | Public read, Admin write | `institutionId: 1, academicYear: 1` |
| `skillfirms` | `SkillFirm` | Karachi bootcamps & training providers (Jawan Pak #1) | Public read, Admin write | `isFeatured: -1, featuredPriority: 1, name: 1` |
| `courses` | `Course` | Verified training courses, duration, published fees | Public read, Admin write | `providerId: 1, slug: 1`, `availability: 1` |
| `events` | `Event` | Karachi campus hackathons, MUNs, workshops | Public read (unexpired) | `publicationStatus: 1, expiresAt: 1, startsAt: 1` |
| `artifacts` | `Artifact` | Student-owned project evidence, repo URLs, files | Student owner | `userId: 1, category: 1, accessClassification: 1` |
| `portfolios` | `Portfolio` | Public student profile & ATS-conscious CV facts | Student owner & public | `username: 1` (unique), `userId: 1` (unique) |
| `portfolioshares` | `PortfolioShare` | Cryptographic secret share tokens for unlisted CVs | Student owner | `portfolioId: 1, tokenHash: 1` (unique) |
| `communityposts` | `CommunityPost` | Moderated student discussions & questions | Public read (approved) | `createdAt: -1`, `tags: 1`, `moderationStatus: 1` |
| `communityreplies` | `CommunityReply` | Discussion replies with expert senior labels | Public read (approved) | `postId: 1, createdAt: 1` |
| `communityvotes` | `CommunityVote` | Unique student upvotes on discussions | Student owner | `userId: 1, targetType: 1, targetId: 1` (unique compound) |
| `moderationreports`| `ModerationReport` | Student reports on spam or inappropriate content | Moderator & admin | `targetId: 1, reviewStatus: 1` |

---

## 3. Data Integrity & Editorial Standards

### Editorial Placement vs Independent Ranking
- **Jawan Pakistan** appears first on `/skills` via database-controlled fields (`isFeatured: true, featuredPriority: 1, featuredLabel: 'Acadiv Featured Placement'`). This is transparently labeled as an Acadiv editorial choice.
- **Zero Fabrication**: If an institution's fee is unverified, `amount` is stored as `null` with `verificationStatus: 'insufficient_information'`, and rendered in the UI with a verification request rather than displaying zero or artificial ranges.

### Event Lifecycle & Expiry
- Active events are filtered in MongoDB queries by `expiresAt: { $gt: new Date() }` and `publicationStatus: 'published'`.
- Expired opportunities immediately disappear from active listings, preventing students from applying to closed hackathons or competitions.

### File Metadata Architecture
- Large binaries (PDF certificates, images) are never stored as base64 inside MongoDB documents.
- Files are stored in private object storage / uploads directory with metadata (MIME type, original filename, storage key, file size) maintained in the `Artifact` collection.

---

## 4. Seeding & Recovery
- The database is idempotently seeded via `npm run seed` in `backend`.
- Stable keys (`stableKey`) prevent record duplication during re-executions.
- Verified timestamps (`lastVerifiedAt`) guarantee that newer verified real-world facts are never overwritten by older records.

