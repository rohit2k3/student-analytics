# Student Analytics - User Manual

## Overview
Student Analytics helps teachers manage student profiles, track semester performance, and assign quizzes with deadlines. Students can view their progress and complete assigned quizzes.

## Roles
- Teacher: creates and manages students, semesters, and quizzes.
- Student: views profile, performance, and assigned quizzes.

## Getting Started (Teacher)
1. Register a teacher account.
2. Log in to the teacher dashboard.
3. Add students with course, department, and semester to auto-load subjects.

## Core Features and Use Cases

### 1) Student Management
- Create student accounts with course, department, and semester.
- Automatically adds the selected semester subjects from the course map.
- View all students with performance tags and quick stats.

Use case: Onboard a new student and have the first semester subjects ready without manual entry.

### 2) Semester Tracking
- Add semester results with subject scores, credits, and categories.
- View semester history and score breakdowns.
- Visual chart shows latest semester performance.

Use case: Record semester grades and monitor improvements over time.

### 3) Performance Tags
- Students are tagged based on average percentage (Outstanding, Above Average, Average, Below Average, Not Rated).
- Tags appear in student list, profile, and dashboards.

Use case: Quickly identify students who need support or enrichment.

### 4) Quiz Assignment (Teacher)
- Assign AI-generated or manually created quizzes.
- Assign to all students, a category, or selected students.
- Set deadlines and mark quizzes as mandatory or optional.

Use case: Run a short diagnostic quiz for a specific performance group before exams.

### 5) Quiz Status and Deadlines
- Quizzes can be pending, submitted, or missed.
- Missed quizzes cannot be submitted after the deadline.

Use case: Enforce time-bound assessments and track missed attempts.

### 6) Quiz Analysis and Management
- View all assigned quizzes in the quiz hub.
- Open a quiz to see full question-by-question analysis.
- Edit pending quizzes and delete any quiz when needed.

Use case: Review student answers and refine quiz content before it is taken.

## Student Experience
- View profile and performance overview.
- See assigned quizzes with mandatory/optional and due dates.
- Complete quizzes before deadlines and see results when submitted.

## Course Map (Subject Auto-Fill)
The course map defines subjects for each course, department, and semester. Update it to match your syllabus:
- Backend: backend/src/data/course-map.json
- Frontend: frontend/src/data/course-map.json

## Tips
- Keep course map subjects accurate to your institution's syllabus.
- Use mandatory quizzes for critical topics.
- Review missed quizzes to identify follow-up coaching needs.
