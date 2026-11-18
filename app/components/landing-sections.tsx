import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  PlayCircle,
  User,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { CourseImage } from "~/components/course-image";
import type {
  CatalogueStats,
  FeaturedCourse,
  Topic,
} from "~/modules/landing/index.server";

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function Hero({
  stats,
  topics,
  signedIn,
}: {
  stats: CatalogueStats;
  topics: Topic[];
  signedIn: boolean;
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-24 lg:grid-cols-[3fr_2fr] lg:items-center">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          Self-paced courses for developers
        </p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Learn to code,
          <br />
          <span className="text-muted-foreground">at your own pace.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Structured courses built by experienced instructors. Track your
          progress, take quizzes, and build real-world skills.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/courses">
              Browse Courses
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            {signedIn ? (
              <Link to="/dashboard">Go to your dashboard</Link>
            ) : (
              <Link to="/signup">Create a free account</Link>
            )}
          </Button>
        </div>
        <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
          <Stat value={stats.courses} label="courses" />
          <Stat value={stats.lessons} label="lessons" />
          <Stat value={stats.instructors} label="instructors" />
        </dl>
      </div>
      {topics.length > 0 && <TopicPanel topics={topics} />}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-3xl font-bold tracking-tight">{value}</dd>
    </div>
  );
}

function TopicPanel({ topics }: { topics: Topic[] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-6">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Compass className="size-4 text-primary" />
        Browse by topic
      </p>
      <ul className="mt-4 divide-y divide-border">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link
              to={`/courses?category=${topic.slug}`}
              className="group flex items-center justify-between py-3 text-sm"
            >
              <span className="font-medium group-hover:text-primary">
                {topic.name}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                {plural(topic.courseCount, "course")}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  {
    icon: Compass,
    title: "Pick a course",
    body: "Browse the catalogue by topic and start with the course that fits where you are.",
  },
  {
    icon: PlayCircle,
    title: "Learn on your schedule",
    body: "Work through video lessons, keep notes beside them, and pick up exactly where you left off.",
  },
  {
    icon: CheckCircle2,
    title: "Prove what you know",
    body: "Quizzes check your understanding, and your dashboard shows how far you have come.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-muted/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Three steps from curious to confident.
        </p>
        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="size-5 text-primary" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FeaturedCourses({ courses }: { courses: FeaturedCourse[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New courses</h2>
          <p className="mt-2 text-muted-foreground">
            The latest additions to the catalogue
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/courses">
            View all
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: FeaturedCourse }) {
  return (
    <Link to={`/courses/${course.slug}`} className="group">
      <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
        <CourseImage
          src={course.coverImageUrl}
          alt={course.title}
          className="aspect-video w-full object-cover"
        />
        <CardHeader>
          <p className="text-xs font-medium text-primary">
            {course.categoryName}
          </p>
          <h3 className="font-semibold leading-snug group-hover:text-primary">
            {course.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {course.instructorName}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {plural(course.lessonCount, "lesson")}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function Footer({ signedIn }: { signedIn: boolean }) {
  const linkClass =
    "text-muted-foreground transition-colors hover:text-foreground";
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 text-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-bold tracking-tight">Cadence</p>
          <p className="mt-1 text-muted-foreground">
            Learn to code, at your own pace.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link to="/courses" className={linkClass}>
            Courses
          </Link>
          {signedIn ? (
            <Link to="/dashboard" className={linkClass}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Log In
              </Link>
              <Link to="/signup" className={linkClass}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
}
