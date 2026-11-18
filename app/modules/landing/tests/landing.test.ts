import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";
import { CourseStatus, UserRole } from "~/db/schema";
import { markdown } from "~/lib/text";
import { createLanding } from "../index.server";

let db: TestDb;
let instructorId: number;
let categoryId: number;
let seededCourseId: number;

beforeEach(() => {
  db = createTestDb();
  const base = seedBaseData(db);
  instructorId = base.instructor.id;
  categoryId = base.category.id;
  seededCourseId = base.course.id;
});

// ─── Fixtures ───
// The landing module only reads, so rows go in directly. Kept in one place so
// a schema change touches only this block.

let counter = 0;

function addCourse(
  title: string,
  createdAt: string,
  options: {
    status?: CourseStatus;
    instructor?: number;
    category?: number;
  } = {}
) {
  counter += 1;
  return db
    .insert(schema.courses)
    .values({
      title,
      slug: `course-${counter}`,
      description: `${title} description`,
      salesCopy: markdown(title),
      instructorId: options.instructor ?? instructorId,
      categoryId: options.category ?? categoryId,
      status: options.status ?? CourseStatus.Published,
      createdAt,
    })
    .returning()
    .get();
}

function addLessons(courseId: number, count: number) {
  counter += 1;
  const module = db
    .insert(schema.modules)
    .values({ courseId, title: `Module ${counter}`, position: counter })
    .returning()
    .get();
  for (let i = 0; i < count; i++) {
    db.insert(schema.lessons)
      .values({ moduleId: module.id, title: `Lesson ${i}`, position: i })
      .run();
  }
}

function addInstructor(name: string) {
  return db
    .insert(schema.users)
    .values({ name, email: `${name}@example.com`, role: UserRole.Instructor })
    .returning()
    .get().id;
}

function addCategory(slug: string, name = slug) {
  return db.insert(schema.categories).values({ name, slug }).returning().get()
    .id;
}

function get() {
  return createLanding(db).get();
}

describe("featured courses", () => {
  it("lists the newest published courses first, three at most", () => {
    addCourse("Oldest", "2000-01-01T00:00:00.000Z");
    addCourse("Middle", "2030-01-01T00:00:00.000Z");
    addCourse("Newest", "2030-03-01T00:00:00.000Z");
    addCourse("Newer", "2030-02-01T00:00:00.000Z");

    expect(get().featuredCourses.map((c) => c.title)).toEqual([
      "Newest",
      "Newer",
      "Middle",
    ]);
  });

  it("leaves out drafts and archived courses", () => {
    addCourse("Draft", "2030-01-01T00:00:00.000Z", {
      status: CourseStatus.Draft,
    });
    addCourse("Archived", "2030-01-02T00:00:00.000Z", {
      status: CourseStatus.Archived,
    });

    expect(get().featuredCourses.map((c) => c.title)).toEqual(["Test Course"]);
  });

  it("carries the instructor, category and the course's own fields", () => {
    const course = get().featuredCourses[0];

    expect(course).toEqual({
      id: seededCourseId,
      title: "Test Course",
      slug: "test-course",
      description: "A test course",
      coverImageUrl: null,
      instructorName: "Test Instructor",
      categoryName: "Programming",
      lessonCount: 0,
    });
  });

  it("counts each course's lessons across all its modules", () => {
    const course = addCourse("Busy", "2030-01-01T00:00:00.000Z");
    addLessons(course.id, 2);
    addLessons(course.id, 3);
    addLessons(seededCourseId, 1);

    const counts = get().featuredCourses.map((c) => [c.title, c.lessonCount]);
    expect(counts).toEqual([
      ["Busy", 5],
      ["Test Course", 1],
    ]);
  });

  it("is empty when nothing is published", () => {
    db.update(schema.courses).set({ status: CourseStatus.Draft }).run();

    expect(get()).toEqual({
      featuredCourses: [],
      topics: [],
      stats: { courses: 0, lessons: 0, instructors: 0 },
    });
  });
});

describe("topics", () => {
  it("lists categories by published course count, then by name", () => {
    const design = addCategory("design", "Design");
    const art = addCategory("art", "Art");
    const empty = addCategory("empty");
    addCourse("D1", "2030-01-01T00:00:00.000Z", { category: design });
    addCourse("D2", "2030-01-02T00:00:00.000Z", { category: design });
    addCourse("A1", "2030-01-03T00:00:00.000Z", { category: art });
    addCourse("Hidden", "2030-01-04T00:00:00.000Z", {
      category: empty,
      status: CourseStatus.Draft,
    });

    expect(get().topics).toEqual([
      { name: "Design", slug: "design", courseCount: 2 },
      { name: "Art", slug: "art", courseCount: 1 },
      { name: "Programming", slug: "programming", courseCount: 1 },
    ]);
  });

  it("shows six topics at most", () => {
    for (let i = 0; i < 7; i++) {
      addCourse(`C${i}`, "2030-01-01T00:00:00.000Z", {
        category: addCategory(`topic-${i}`),
      });
    }

    expect(get().topics).toHaveLength(6);
  });
});

describe("catalogue stats", () => {
  it("counts only what is published", () => {
    const otherInstructor = addInstructor("olive");
    const otherCategory = addCategory("design");
    const published = addCourse("Published", "2030-01-01T00:00:00.000Z", {
      instructor: otherInstructor,
      category: otherCategory,
    });
    const draft = addCourse("Draft", "2030-01-02T00:00:00.000Z", {
      status: CourseStatus.Draft,
      instructor: addInstructor("dana"),
      category: addCategory("drafts"),
    });
    addLessons(published.id, 4);
    addLessons(seededCourseId, 2);
    addLessons(draft.id, 7);

    expect(get().stats).toEqual({
      courses: 2,
      lessons: 6,
      instructors: 2,
    });
  });

  it("counts every published course, not only the featured ones", () => {
    for (let i = 0; i < 4; i++) {
      addCourse(`Course ${i}`, `2030-01-0${i + 1}T00:00:00.000Z`);
    }

    const page = get();
    expect(page.featuredCourses).toHaveLength(3);
    expect(page.stats.courses).toBe(5);
    expect(page.stats.instructors).toBe(1);
  });
});
