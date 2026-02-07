/**
 * Progress dashboard: XP rules, badges, and helpers.
 * Use with session auth; all APIs use getSession(req) for userId.
 */

import { prisma } from '@/lib/db';

export const XP = {
  TOPIC_EXPLAINED: 10,
  WORKSHEET_GENERATED: 25,
  STUDY_PLAN_CREATED: 30,
  STREAK_5_DAYS: 50,
} as const;

export const BADGES = {
  BEGINNER_LEARNER: { name: 'Beginner Learner', minXp: 100 },
  FOCUSED_SCHOLAR: { name: 'Focused Scholar', minXp: 300 },
  STUDY_MASTER: { name: 'Study Master', minXp: 700 },
  CONSISTENCY_KING: { name: 'Consistency King', minStudyPlans: 5 },
} as const;

const XP_BADGE_NAMES = [
  BADGES.BEGINNER_LEARNER.name,
  BADGES.FOCUSED_SCHOLAR.name,
  BADGES.STUDY_MASTER.name,
];
const XP_THRESHOLDS = [BADGES.BEGINNER_LEARNER.minXp, BADGES.FOCUSED_SCHOLAR.minXp, BADGES.STUDY_MASTER.minXp];

function parseJsonArray(s: string): string[] {
  try {
    const a = JSON.parse(s);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function parseJsonObject(s: string): Record<string, number> {
  try {
    const o = JSON.parse(s);
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

/** Normalize analytics from Prisma Json? (object or string) to Record<string, number>. */
function normalizeAnalytics(value: unknown): Record<string, number> {
  if (value == null) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, number>;
  if (typeof value === 'string') return parseJsonObject(value);
  return {};
}

/** Compute badges from current xp and studyPlansCreated (no duplicates). */
export function computeBadges(xp: number, studyPlansCreated: number): string[] {
  const set = new Set<string>();
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) set.add(XP_BADGE_NAMES[i]);
  }
  if (studyPlansCreated >= BADGES.CONSISTENCY_KING.minStudyPlans) {
    set.add(BADGES.CONSISTENCY_KING.name);
  }
  return Array.from(set);
}

/** Ensure a Progress row exists for userId; create or return existing (safe create-or-update). */
export async function ensureProgress(userId: string) {
  return prisma.progress.upsert({
    where: { userId },
    create: {
      userId,
      xpPoints: 0,
      badges: '[]',
      topicsStudied: '[]',
      worksheetsGenerated: 0,
      studyPlansCreated: 0,
      weaknesses: '[]',
      analytics: '{}',
    },
    update: {},
  });
}

/** Add XP, recompute badges, optionally update weekly analytics. */
export async function addXp(
  userId: string,
  amount: number,
  options?: { updateAnalytics?: boolean }
) {
  const progress = await ensureProgress(userId);
  const newXp = progress.xpPoints + amount;
  const studyPlansCreated = progress.studyPlansCreated;
  const badges = computeBadges(newXp, studyPlansCreated);

  let analytics = normalizeAnalytics(progress.analytics);
  if (options?.updateAnalytics) {
    const weekKey = `w${getWeekKey()}`;
    analytics[weekKey] = (analytics[weekKey] ?? 0) + amount;
    const dayKey = `d${new Date().toISOString().slice(0, 10)}`;
    analytics[dayKey] = (analytics[dayKey] ?? 0) + amount;
  }

  const updated = await prisma.progress.update({
    where: { userId },
    data: {
      xpPoints: newXp,
      badges: JSON.stringify(badges),
      analytics: JSON.stringify(analytics),
    },
  });
  return updated;
}

function getWeekKey(): string {
  const d = new Date();
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

/** Add topic to topicsStudied (no duplicates). */
export async function addTopic(userId: string, topic: string) {
  const progress = await ensureProgress(userId);
  const topics = parseJsonArray(progress.topicsStudied);
  const t = topic.trim();
  if (t && !topics.includes(t)) {
    topics.push(t);
    await prisma.progress.update({
      where: { userId },
      data: { topicsStudied: JSON.stringify(topics) },
    });
  }
}

/** Increment worksheetsGenerated. */
export async function addWorksheet(userId: string) {
  await ensureProgress(userId);
  const progress = await prisma.progress.findUnique({ where: { userId } });
  if (progress) {
    await prisma.progress.update({
      where: { userId },
      data: { worksheetsGenerated: progress.worksheetsGenerated + 1 },
    });
  }
}

/** Increment studyPlansCreated and recompute badges. */
export async function addStudyPlan(userId: string) {
  const progress = await ensureProgress(userId);
  const newCount = progress.studyPlansCreated + 1;
  const badges = computeBadges(progress.xpPoints, newCount);
  await prisma.progress.update({
    where: { userId },
    data: {
      studyPlansCreated: newCount,
      badges: JSON.stringify(badges),
    },
  });
}

/** Add topic to weakTopics (score < 60%); no duplicates. */
export async function addWeakTopic(userId: string, topic: string) {
  const progress = await ensureProgress(userId);
  const weak = parseJsonArray(progress.weaknesses);
  const t = topic.trim();
  if (t && !weak.includes(t)) {
    weak.push(t);
    await prisma.progress.update({
      where: { userId },
      data: { weaknesses: JSON.stringify(weak) },
    });
  }
}

export type ProgressPayload = {
  userId: string;
  xpPoints: number;
  badges: string[];
  topicsStudied: string[];
  worksheetsGenerated: number;
  studyPlansCreated: number;
  weakTopics: string[];
  analytics: Record<string, number>;
  updatedAt: string;
};

/** Get progress for API response (creates if missing). */
export async function getProgressPayload(userId: string): Promise<ProgressPayload | null> {
  const progress = await ensureProgress(userId);
  if (!progress) return null;
  return {
    userId: progress.userId,
    xpPoints: progress.xpPoints,
    badges: parseJsonArray(progress.badges),
    topicsStudied: parseJsonArray(progress.topicsStudied),
    worksheetsGenerated: progress.worksheetsGenerated,
    studyPlansCreated: progress.studyPlansCreated,
    weakTopics: parseJsonArray(progress.weaknesses),
    analytics: normalizeAnalytics(progress.analytics),
    updatedAt: progress.updatedAt.toISOString(),
  };
}
