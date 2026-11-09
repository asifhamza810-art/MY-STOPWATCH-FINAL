# Acadiv — Master Data Dictionary

This document details key entities and fields across Acadiv's MongoDB data architecture.

---

## 1. User (`users`)
| Field | Type | Required | Description | Validation / Constraints | Privacy |
|---|---|---|---|---|---|
| `_id` | ObjectId | Yes | Unique user identifier | Auto-generated | Internal |
| `email` | String | Yes | Student or reviewer email | Regex normalized, lowercase, unique | Private |
| `passwordHash` | String | Yes | Bcrypt hashed password | Minimum salt rounds 10 | Secret (excluded in JSON) |
| `displayName` | String | Yes | Public student/mentor name | Max 80 characters | Public / Community |
| `role` | String | Yes | Authorization role | `student`, `contentReviewer`, `moderator`, `admin` | Internal |
| `accountStatus` | String | Yes | Account lifecycle state | `active`, `suspended`, `pendingDeletion`, `deleted` | Internal |

---

## 2. StudentProfile (`studentprofiles`)
| Field | Type | Required | Description | Validation / Values | Privacy |
|---|---|---|---|---|---|
| `userId` | ObjectId | Yes | Reference to User | Unique index | Internal |
| `preferredName` | String | No | Custom preferred name | Max 80 characters | User choice |
| `educationStage` | String | Yes | Current Pakistani academic stage | Matric, HSC Pre-Eng, HSC Pre-Med, HSC ICS, DAE, A-Levels, Undergraduate | Student profile |
| `educationStream`| String | No | Academic stream | Science, Computing, Commerce, Arts | Student profile |
| `city` | String | No | Primary city focus | Defaults to 'Karachi' | Student profile |
| `budgetPreference`| String | No | Budget tier | `subsidized`, `moderate`, `flexible`, `bootcamp` | Private |

---

## 3. Institution (`institutions`)
| Field | Type | Required | Description | Constraints / Notes | Provenance |
|---|---|---|---|---|---|
| `name` | String | Yes | Official registered name | e.g. NED University, IBA, FAST-NUCES | Official charter |
| `slug` | String | Yes | URL-safe identifier | Unique lowercase slug | System generated |
| `ownershipType` | String | Yes | Ownership sector | `public`, `private`, `semipublic` | Government registry |
| `officialWebsite` | String | Yes | Official primary URL | Must be valid HTTPS URL | Verified institutional portal |
| `admissionsWebsite` | String | No | Official admissions portal | Valid HTTPS URL | Verified admissions office |
| `city` | String | Yes | Primary campus city | e.g. Karachi | Verified location |
| `recognitionStatus`| String | Yes | Accreditation standing | `verified`, `provisional`, `unknown` | Sindh HEC / PEC / NCEAC |

---

## 4. SkillFirm (`skillfirms`)
| Field | Type | Required | Description | Constraints / Notes | Provenance |
|---|---|---|---|---|---|
| `name` | String | Yes | Bootcamp / training academy name | e.g. Jawan Pakistan, SMIT, Bano Qabil | Official registration |
| `isFeatured` | Boolean | Yes | Deliberate Acadiv editorial placement | `true` for Jawan Pakistan | Database controlled |
| `featuredPriority` | Number | Yes | Sort priority order | `1` appears first in featured catalog | Database controlled |
| `featuredLabel` | String | No | Transparent editorial badge | e.g. "Acadiv Featured Placement" | Editorial standard |
| `karachiLocation`| String | Yes | Verified physical Karachi branch | e.g. RJ Shopping Mall, Gulistan-e-Johar | Verified physical site |
| `skillDomains` | Array | Yes | Technologies taught | e.g. Agentic AI, MERN, Flutter, Marketing | Verified curriculum |

---

## 5. Course (`courses`)
| Field | Type | Required | Description | Constraints / Values | Provenance |
|---|---|---|---|---|---|
| `providerId` | ObjectId | Yes | Reference to SkillFirm | Valid SkillFirm ID | Internal ref |
| `title` | String | Yes | Programme / course title | e.g. Certified Agentic AI and FDE | Official course announcement |
| `deliveryMode` | String | Yes | Instruction format | `onsite`, `online`, `hybrid`, `unknown` | Official announcement |
| `duration` | String | Yes | Total curriculum length | e.g. "6 Months", "1 Year" | Verified brochure |
| `eligibility` | String | Yes | Prerequisites | e.g. "Minimum Intermediate" | Verified announcement |
| `publishedFeeAmount`| Number | No | Published tuition fee in PKR | `null` if unverified; `0` if 100% free | Verified fee announcement |
| `availability` | String | Yes | Intake availability status | `available`, `unavailable`, `unknown` | Current intake status |

---

## 6. Event (`events`)
| Field | Type | Required | Description | Constraints / Values | Provenance |
|---|---|---|---|---|---|
| `title` | String | Yes | Competition or conference title | e.g. PROCOM 2026, IBAMUN XI | Official student society |
| `category` | String | Yes | Opportunity classification | `hackathon`, `mun`, `workshop`, `exhibition`, `competition` | Verified event category |
| `organizer` | String | Yes | Society or university host | e.g. FAST ACM Chapter, IBA Debating | Student affairs office |
| `startsAt` | Date | Yes | Start date and time | Valid Date | Official schedule |
| `registrationDeadline`| Date | Yes | Cutoff date for applications | Valid Date | Official registration portal |
| `expiresAt` | Date | Yes | Expiry cutoff for public query | Must be in future for active listing | System lifecycle |

---

## 7. Artifact (`artifacts`)
| Field | Type | Required | Description | Constraints / Values | Privacy |
|---|---|---|---|---|---|
| `userId` | ObjectId | Yes | Student owner reference | Reference to User | Private to owner |
| `title` | String | Yes | Project or certificate title | Max 120 characters | Owner choice |
| `category` | String | Yes | Artifact type | `project`, `certificate`, `research`, `competition` | Metadata |
| `projectUrl` | String | No | GitHub or live deployment URL | Valid URL | Repository linked |
| `storageKey` | String | No | Key in object storage | Generated UUID/hash | Internal file storage |
| `verificationState`| String | Yes | Evidence integrity level | `self_reported`, `repository_linked`, `uploaded`, `reviewed` | Auditable state |

