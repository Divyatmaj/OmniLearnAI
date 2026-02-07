# OmniLearnAI Security & Bug Audit

## Critical Severity

### 1. Plaintext Password Storage & Comparison
**File:** `app/api/auth/login/route.ts` (line 29)
**Issue:** Passwords are stored and compared as plaintext. `user.passwordHash !== (password ?? '')` compares raw input to DB value—no hashing.
**Impact:** All user passwords are exposed if DB is compromised. Violates OWASP guidelines.
**Fix:** Use bcrypt: hash on signup, compare with `bcrypt.compare()` on login.

### 2. Admin Routes Unprotected
**Files:** `app/api/admin/users/route.ts`, `app/api/admin/stats/route.ts`, `app/api/admin/user/[id]/route.ts`
**Issue:** No authentication. Anyone can list all users, view stats, and DELETE any user.
**Fix:** Add admin auth (session check + admin role or secret header).

### 3. API Keys in .env.example
**File:** `.env.example`
**Issue:** Contains real API keys (OPENAI, GROQ, GEMINI, STABILITY). If committed, keys are exposed.
**Fix:** Replace with placeholders like `your_key_here`.

### 4. Google OAuth Endpoint Trusts Client Input (Documented; Not Fixed)
**File:** `app/api/auth/google/route.ts`
**Issue:** Accepts `email` and `name` from request body with no verification. Anyone can create/login as any user by POSTing arbitrary email.
**Fix:** Implement real Google OAuth (server-side flow + token verification) before production. Security warning added in code.

---

## High Severity

### 5. progress/add Accepts Any userId (No Auth)
**File:** `app/api/progress/add/route.ts`
**Issue:** No session check. Anyone can add/modify any user's XP, badges, weaknesses by passing `userId` in body.
**Fix:** Require session; use `session.userId` only.

### 6. getUserIdFromRequest Fallback Allows Impersonation
**File:** `lib/auth.ts` — used by planner/generate, planner/update, worksheet/generate, worksheet/pdf
**Issue:** When no session, falls back to `getValidUserId(bodyUserId)`. Passing any valid userId in body acts as that user.
**Fix:** Never accept body userId without session. Require session for these routes.

### 7. IDOR: Fetch Any User's Progress Without Auth
**File:** `app/api/progress/[userId]/route.ts`
**Issue:** When no session, `userId = getValidUserId(requestedId)` allows unauthenticated access to any user's progress by URL.
**Fix:** Require session. Only allow `me` or session.userId.

### 8. IDOR: Fetch Any User's Study Plan Without Auth
**File:** `app/api/planner/[userId]/route.ts`
**Issue:** Same pattern—no session + valid userId in URL = access to that user's plan.
**Fix:** Require session. Only serve session user's plan.

### 9. Worksheet Fetch by ID—No Auth
**File:** `app/api/worksheet/[id]/route.ts`
**Issue:** Anyone can fetch any worksheet by ID. No ownership check.
**Fix:** Require session; verify worksheet.userId === session.userId (or allow public read with caveat).

---

## Medium Severity

### 10. Contact Form: No Rate Limit
**File:** `app/api/contact/submit/route.ts`
**Issue:** Unlimited submissions. Enables spam/abuse.
**Fix:** Add rate limiting (e.g., per IP or per session).

### 11. Contact Form: No Input Validation
**Issue:** No email format validation, no max length on name/message. Very long strings could cause issues.
**Fix:** Validate email regex, enforce max lengths (e.g., name 100, message 5000).

### 12. Signup: No Password Hashing
**File:** `app/api/auth/signup/route.ts` (line 36)
**Issue:** `passwordHash: password ? String(password) : null` stores plaintext.
**Fix:** Hash with bcrypt before storing.

---

## Low Severity

### 13. JSON.parse Without Try/Catch (Some Routes)
**File:** `app/api/progress/add/route.ts` (lines 65–67)
**Issue:** `JSON.parse(progress.badges)` etc. could throw if data is corrupted.
**Fix:** Wrap in try/catch with fallback to `[]` or `{}`.

### 14. Error Messages May Leak Stack
**Issue:** Some catch blocks return `e.message` to client—could leak internal paths.
**Fix:** Return generic messages in production; log details server-side only.

---

## Fix Implementation Order

1. **Critical:** Password hashing (bcrypt), .env.example keys, admin auth, Google OAuth
2. **High:** progress/add auth, getUserIdFromRequest fix, IDOR fixes, worksheet [id] auth
3. **Medium:** Contact rate limit, input validation, signup password hash
4. **Low:** JSON.parse safety, error message sanitization
