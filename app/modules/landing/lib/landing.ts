import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { and, countDistinct, desc, eq, inArray, sql } from "drizzle-orm";
import * as schema from "~/db/schema";
import {
  CourseStatus,
  categories,
  courses,
  lessons,
  modules,
  users,
} from "~/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const FEATURED_COURSE_COUNT = 3;

export type FeaturedCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  instructorName: string;
  categoryName: string;
  lessonCount: number;
};

export type CatalogueStats = {
  courses: number;
  lessons: number;
  instructors: number;
};

export type Topic = {
  name: string;
  slug: string;
  courseCount: number;
};

export type LandingPage = {
  featuredCourses: FeaturedCourse[];
  topics: Topic[];
  stats: CatalogueStats;
};

const isPublished = eq(courses.status, CourseStatus.Published);

function getNewestPublishedCourses(db: Db) {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      coverImageUrl: courses.coverImageUrl,
      instructorName: users.name,
      categoryName: categories.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(isPublished)
    .orderBy(desc(courses.createdAt), desc(courses.id))
    .limit(FEATURED_COURSE_COUNT)
    .all();
}

function getLessonCounts(db: Db, courseIds: number[]) {
  const rows = db
    .select({ courseId: modules.courseId, count: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(inArray(modules.courseId, courseIds))
    .groupBy(modules.courseId)
    .all();
  return new Map(rows.map((row) => [row.courseId, row.count]));
}

export const TOPIC_COUNT = 6;

function getTopics(db: Db): Topic[] {
  const courseCount = sql<number>`count(${courses.id})`;
  return db
    .select({ name: categories.name, slug: categories.slug, courseCount })
    .from(categories)
    .innerJoin(courses, and(eq(courses.categoryId, categories.id), isPublished))
    .groupBy(categories.id)
    .orderBy(desc(courseCount), categories.name)
    .limit(TOPIC_COUNT)
    .all();
}

function getCatalogueStats(db: Db): CatalogueStats {
  const [courseRow] = db
    .select({
      courses: countDistinct(courses.id),
      instructors: countDistinct(courses.instructorId),
    })
    .from(courses)
    .where(isPublished)
    .all();
  const [lessonRow] = db
    .select({ lessons: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, and(eq(modules.courseId, courses.id), isPublished))
    .all();
  return { ...courseRow, ...lessonRow };
}

export function getLandingPage(db: Db): LandingPage {
  const newest = getNewestPublishedCourses(db);
  const lessonCounts = getLessonCounts(
    db,
    newest.map((course) => course.id)
  );
  return {
    featuredCourses: newest.map((course) => ({
      ...course,
      lessonCount: lessonCounts.get(course.id) ?? 0,
    })),
    topics: getTopics(db),
    stats: getCatalogueStats(db),
  };
}
