import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import StudentNavbar from "../components/StudentNavbar";

function StudentDashboard() {
  const navigate = useNavigate();

  // Course + enrollment state
  const [allCourses, setAllCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const coursesPerPage = 10;

  // Enroll action state
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollError, setEnrollError] = useState("");

  // Lessons expand/collapse state
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState("");

  // AI summary state (per-lesson)
  const [summaries, setSummaries] = useState({}); // { [lessonId]: summaryText }
  const [summarizingId, setSummarizingId] = useState(null); // lessonId currently loading
  const [summaryError, setSummaryError] = useState("");

  // Step 1: Route guard — only students allowed
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") navigate("/login");
  }, []);

  // Step 2: Fetch all available courses (paginated)
  const fetchAllCourses = async (pageNum = 1) => {
    try {
      const skip = (pageNum - 1) * coursesPerPage;
      const res = await axiosClient.get(
        `/courses/all?skip=${skip}&limit=${coursesPerPage}`
      );
      setAllCourses(res.data);
    } catch (err) {
      setError("Failed to load available courses.");
    }
  };

  // Step 2: Fetch this student's enrollments
  const fetchMyEnrollments = async () => {
    try {
      const res = await axiosClient.get("/my-courses");
      setMyEnrollments(res.data);
    } catch (err) {
      setError("Failed to load your enrollments.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllCourses(page), fetchMyEnrollments()]);
      setLoading(false);
    };
    loadData();
  }, [page]);

  // Step 3: Set of enrolled course IDs for O(1) lookup
  const enrolledIds = new Set(myEnrollments.map((c) => c.id));

  // Step 4: Enroll action
  const handleEnroll = async (courseId) => {
    setEnrollError("");
    setEnrollingId(courseId);
    try {
      await axiosClient.post("/enroll", { course_id: courseId });
      const enrolledCourse = allCourses.find((c) => c.id === courseId);
      if (enrolledCourse) {
        setMyEnrollments((prev) => [...prev, enrolledCourse]);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setEnrollError("You're already enrolled in this course.");
      } else {
        setEnrollError("Failed to enroll. Please try again.");
      }
    } finally {
      setEnrollingId(null);
    }
  };

  // Step 5: Expand/collapse a course to view its lessons
  const toggleCourse = async (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }

    setExpandedCourseId(courseId);
    setLessonsError("");

    if (lessonsByCourse[courseId]) return; // already cached

    setLessonsLoading(true);
    try {
      const res = await axiosClient.get(`/courses/${courseId}/lessons`);
      setLessonsByCourse((prev) => ({ ...prev, [courseId]: res.data }));
    } catch (err) {
      setLessonsError("Failed to load lessons for this course.");
    } finally {
      setLessonsLoading(false);
    }
  };

  // Step 6: Request AI summary for a lesson
  // Step 6: Request AI summary for a lesson (always calls API — supports Re-Summarize)
  const handleSummarize = async (lessonId) => {
    setSummaryError("");
    setSummarizingId(lessonId);
    try {
      const res = await axiosClient.post(`/lessons/${lessonId}/summarize`);
      setSummaries((prev) => ({ ...prev, [lessonId]: res.data.summary }));
    } catch (err) {
      if (err.response?.status === 400) {
        setSummaryError("This lesson has no content to summarize.");
      } else {
        setSummaryError("Failed to generate summary. Please try again.");
      }
    } finally {
      setSummarizingId(null);
    }
  };

  // Step 7: Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div>
      <StudentNavbar onLogout={handleLogout} />

      <div className="p-6">
        <h1 className="text-2xl font-bold">Welcome to Student Dashboard</h1>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {enrollError && <p className="text-red-500 mt-2">{enrollError}</p>}
        {loading && <p className="mt-2">Loading courses...</p>}

        {!loading && (
          <>
            {/* Available courses */}
            <h2 className="text-xl font-semibold mt-6 mb-2">
              Available Courses
            </h2>
            <div className="space-y-2">
              {allCourses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      {course.description}
                    </p>
                  </div>
                  {enrolledIds.has(course.id) ? (
                    <span className="text-green-600 font-semibold">
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={allCourses.length < coursesPerPage}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {/* Enrolled courses + lessons */}
            <h2 className="text-xl font-semibold mt-8 mb-2">
              My Enrolled Courses
            </h2>
            {lessonsError && (
              <p className="text-red-500 mt-2">{lessonsError}</p>
            )}
            {summaryError && (
              <p className="text-red-500 mt-2">{summaryError}</p>
            )}
            <div className="space-y-2">
              {myEnrollments.length === 0 && (
                <p className="text-gray-500">
                  You haven't enrolled in any courses yet.
                </p>
              )}
              {myEnrollments.map((course) => (
                <div key={course.id} className="border rounded p-3">
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="font-medium text-left w-full flex justify-between items-center"
                  >
                    {course.title}
                    <span className="text-sm text-gray-400">
                      {expandedCourseId === course.id ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedCourseId === course.id && (
                    <div className="mt-3 pl-3 border-l space-y-2">
                      {lessonsLoading && !lessonsByCourse[course.id] && (
                        <p className="text-sm text-gray-500">
                          Loading lessons...
                        </p>
                      )}
                      {lessonsByCourse[course.id]?.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No lessons yet.
                        </p>
                      )}
                      {lessonsByCourse[course.id]?.map((lesson) => (
                        <div key={lesson.id} className="border rounded p-2">
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-gray-600">
                            {lesson.content}
                          </p>

                          <button
                            onClick={() => handleSummarize(lesson.id)}
                            disabled={summarizingId === lesson.id}
                            className="mt-2 text-sm bg-purple-600 text-white px-2 py-1 rounded disabled:opacity-50"
                          >
                            {summarizingId === lesson.id
                              ? "Summarizing..."
                              : summaries[lesson.id]
                              ? "Re-Summarize"
                              : "Summarize"}
                          </button>

                          {summaries[lesson.id] && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-100 p-2 rounded">
                              {summaries[lesson.id]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;