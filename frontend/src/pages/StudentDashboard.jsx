import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import StudentNavbar from "../components/StudentNavbar";

function getErrorMessage(err, fallback) {
  if (!err.response) {
    return "Network error. Please check your connection and try again.";
  }
  const status = err.response.status;
  if (status === 401 || status === 403) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 404) {
    return "That item couldn't be found. It may have been removed.";
  }
  if (status >= 500) {
    return "Something went wrong on our end. Please try again in a moment.";
  }
  return err.response?.data?.detail || fallback;
}

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
  const [pageLoading, setPageLoading] = useState(false);

  // Enroll action state
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollError, setEnrollError] = useState("");

  // Lessons expand/collapse state
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState("");

  // AI summary state (per-lesson)
  const [summaries, setSummaries] = useState({});
  const [summarizingId, setSummarizingId] = useState(null);
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
      setError(getErrorMessage(err, "Failed to load available courses."));
    }
  };

  // Step 2: Fetch this student's enrollments
  const fetchMyEnrollments = async () => {
    try {
      const res = await axiosClient.get("/my-courses");
      setMyEnrollments(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your enrollments."));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const isFirstLoad = page === 1 && allCourses.length === 0 && myEnrollments.length === 0;
      if (isFirstLoad) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }
      setError("");
      await Promise.all([fetchAllCourses(page), fetchMyEnrollments()]);
      setLoading(false);
      setPageLoading(false);
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
        setEnrollError(getErrorMessage(err, "Failed to enroll. Please try again."));
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
      setLessonsError(getErrorMessage(err, "Failed to load lessons for this course."));
    } finally {
      setLessonsLoading(false);
    }
  };

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
        setSummaryError(getErrorMessage(err, "Failed to generate summary. Please try again."));
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

      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold">Welcome to Student Dashboard</h1>

        {error && (
          <div role="alert" aria-live="polite" className="bg-red-100 text-red-700 border border-red-300 rounded-md px-4 py-2 mt-3 break-words">
            {error}
          </div>
        )}
        {enrollError && (
          <div role="alert" aria-live="polite" className="bg-red-100 text-red-700 border border-red-300 rounded-md px-4 py-2 mt-3 break-words">
            {enrollError}
          </div>
        )}
        {loading && <p className="mt-3 text-gray-500">Loading courses...</p>}

        {!loading && (
          <>
            {/* Available courses */}
            <h2 className="text-xl font-semibold mt-6 mb-2">
              Available Courses
            </h2>

            {pageLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-2">
                {allCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-300 rounded-md p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium break-words">{course.title}</p>
                      <p className="text-sm text-gray-500 break-words">
                        {course.description}
                      </p>
                    </div>
                    {enrolledIds.has(course.id) ? (
                      <span className="text-green-600 font-semibold shrink-0">
                        Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingId === course.id}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md disabled:opacity-50 shrink-0 w-full sm:w-auto"
                      >
                        {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || pageLoading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-gray-600">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={allCourses.length < coursesPerPage || pageLoading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {/* Enrolled courses + lessons */}
            <h2 className="text-xl font-semibold mt-8 mb-2">
              My Enrolled Courses
            </h2>
            {lessonsError && (
              <div role="alert" aria-live="polite" className="bg-red-100 text-red-700 border border-red-300 rounded-md px-4 py-2 mt-2 mb-2 break-words">
                {lessonsError}
              </div>
            )}
            {summaryError && (
              <div role="alert" aria-live="polite" className="bg-red-100 text-red-700 border border-red-300 rounded-md px-4 py-2 mt-2 mb-2 break-words">
                {summaryError}
              </div>
            )}
            <div className="space-y-2">
              {myEnrollments.length === 0 && (
                <p className="text-gray-500">
                  You haven't enrolled in any courses yet.
                </p>
              )}
              {myEnrollments.map((course) => (
                <div key={course.id} className="border border-gray-300 rounded-md p-3">
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="font-medium text-left w-full flex justify-between items-center gap-2"
                  >
                    <span className="break-words">{course.title}</span>
                    <span className="text-sm text-gray-400 shrink-0">
                      {expandedCourseId === course.id ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedCourseId === course.id && (
                    <div className="mt-3 pl-3 border-l border-gray-300 space-y-2">
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
                        <div key={lesson.id} className="border border-gray-300 rounded-md p-2">
                          <p className="font-medium break-words">{lesson.title}</p>
                          <p className="text-sm text-gray-600 break-words">
                            {lesson.content}
                          </p>

                          <button
                            onClick={() => handleSummarize(lesson.id)}
                            disabled={summarizingId === lesson.id}
                            className="mt-2 text-sm bg-purple-600 text-white px-2 py-1 rounded-md disabled:opacity-50 w-full sm:w-auto"
                          >
                            {summarizingId === lesson.id
                              ? "Summarizing..."
                              : summaries[lesson.id]
                              ? "Re-Summarize"
                              : "Summarize"}
                          </button>

                          {summaries[lesson.id] && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-100 p-2 rounded-md break-words">
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