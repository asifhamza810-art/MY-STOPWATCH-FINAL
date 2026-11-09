# ACADIV — BACKEND CHANGE REQUEST (BCR)

## Overview & Boundary Adherence
In strict accordance with the **Strict Backend Boundary Directive**, zero modifications were performed on the live backend codebase, `.env` secrets, or MongoDB Atlas collections during this frontend engineering cycle.

This document formally records identified backend enhancement requests discovered during forensic frontend integration and user workflow auditing.

---

## Change Request BCR-01: Explicit `ikigaiNotes` Narrative Storage in Student Profile

### 1. Defective / Missing Behavior
The frontend Diagnostic Match Profile (`/profile/match`) provides students with a qualitative reflection framework across four dimensions:
- What You Enjoy (Love)
- Developing Competencies (Good At)
- Karachi / Industry Needs (World Needs)
- Economically Sustainable Directions (Paid For)

Currently, `StudentProfile` schema only accepts `careerInterests: [String]` and `academicPreferences: [String]`. Custom narrative reflections cannot be persistently retrieved or queried independently without risking truncation or loss across sessions.

### 2. Relevant Endpoint, Method & Data Contract
- **Endpoint**: `PATCH /api/v1/profile`
- **Method**: `PATCH`
- **Authorization**: Bearer JWT (Student)
- **Expected Request Body Extension**:
  ```json
  {
    "ikigaiNotes": {
      "love": "Building full-stack web applications and algorithms",
      "goodAt": "JavaScript ES6, Calculus, Figma prototyping",
      "worldNeeds": "Scalable local healthcare logistics and fintech",
      "paidFor": "Junior software engineering and tech freelancing"
    }
  }
  ```

### 3. Required Schema Update (`backend/src/models/StudentProfile.js`)
```javascript
ikigaiNotes: {
  love: { type: String, maxlength: 500, trim: true },
  goodAt: { type: String, maxlength: 500, trim: true },
  worldNeeds: { type: String, maxlength: 500, trim: true },
  paidFor: { type: String, maxlength: 500, trim: true },
  updatedAt: { type: Date, default: Date.now }
}
```

### 4. Verification & Acceptance Test
1. Make authenticated `PATCH /api/v1/profile` with `ikigaiNotes` object.
2. Perform `GET /api/v1/auth/me` and confirm `res.data.profile.ikigaiNotes` returns the exact persisted strings.
3. Reload `/profile/match` in browser and verify qualitative fields populate immediately from MongoDB without relying on localStorage.

---

## Change Request BCR-02: Paginated Institution Directory Query Parameters

### 1. Defective / Missing Behavior
Currently, `listInstitutions` supports `limit` up to 100, but lacks formal `page` or `skip` query parameter handling in `catalogController.js`.
As the Karachi directory expands from 25 to 200+ institutions across BIEK, SBTE, and STEVTA, client-side pagination requires fetching the entire array upfront.

### 2. Relevant Endpoint & Data Contract
- **Endpoint**: `GET /api/v1/institutions`
- **Query Params**: `?page=1&limit=9&category=university&area=Gulshan-e-Iqbal`
- **Expected Response Format**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 9,
      "totalRecords": 25,
      "totalPages": 3
    }
  }
  ```

### 3. Verification & Acceptance Test
1. Call `GET /api/v1/institutions?page=2&limit=9`.
2. Confirm returned array begins at record 10.
3. Confirm response header or JSON metadata returns `totalPages`.

---

## Change Request BCR-03: Real-Time Community Post Notifications

### 1. Defective / Missing Behavior
When a senior mentor replies to a student's inquiry regarding NED or FAST entrance examinations, there is currently no backend webhook or notification event (`Notification` model) notifying the thread author.

### 2. Relevant Endpoint
- **Trigger**: `POST /api/v1/community/posts/:id/replies`
- **Automated Event**: Insert notification record:
  ```json
  {
    "userId": "post.authorId",
    "type": "community_reply",
    "title": "New reply on your discussion",
    "message": "Senior Mentor replied to: Tips for FAST-NUCES",
    "link": "/community"
  }
  ```

### 3. Verification & Acceptance Test
1. User A posts discussion.
2. User B posts reply.
3. Verify `GET /api/v1/notifications` for User A returns unread alert item.

