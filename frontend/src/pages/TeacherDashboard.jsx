import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import TeacherNavbar from "../components/TeacherNavbar";

function getErrorMessage(err, fallback) {
  if (!err.response) {
    return "Network error. Please check your connection and try again.";
  }
  const status = err.response.status;
  if (status === 401 || status === 403) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 400 || status === 422) {
    return err.response?.data?.detail || "Please check your input and try again.";
  }
  if (status === 404) {
    return "That item couldn't be found. It may have been removed.";
  }
  if (status >= 500) {
    return "Something went wrong on our end. Please try again in a moment.";
  }
  return err.response?.data?.detail || fallback;
}

function TeacherDashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Guard: kick non-teachers out immediately
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "teacher") navigate("/login");
  }, []);

  // Auto-clear feedback messages after a few seconds
  useEffect(() => {
    if (!error && !success) return;
    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success]);

  const fetchCourses = async (page = 1, isFirstLoad = false) => {
    if (isFirstLoad) {
      setLoading(true);
    } else {
      setPageLoading(true);
    }
    try {
      const skip = (page - 1) * coursesPerPage;
      const res = await axiosClient.get(`/courses?skip=${skip}&limit=${coursesPerPage}`);
      setCourses(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load courses. Please refresh the page."));
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage, currentPage === 1 && courses.length === 0);
  }, [currentPage]);

  const handleCreateCourse = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    setCreatingCourse(true);
    try {
      await axiosClient.post("/courses", { title, description });
      setTitle("");
      setDescription("");
      setSuccess("Course created successfully.");
      // If already on page 1, the page-change effect won't re-fire, so fetch manually.
      // Otherwise, setCurrentPage(1) triggers the effect and fetching here too would race it.
      if (currentPage === 1) {
        await fetchCourses(1);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create course. Please try again."));
    } finally {
      setCreatingCourse(false);
    }
  };

  // Toggle lesson form for a course, resetting any leftover input
  const toggleLessonForm = (courseId) => {
    setSelectedCourse(selectedCourse === courseId ? null : courseId);
    setLessonTitle("");
    setLessonContent("");
  };

  const handleAddLesson = async (courseId, e) => {
    if (e) e.preventDefault();
    if (!lessonTitle.trim()) return;
    setAddingLesson(true);
    try {
      await axiosClient.post(`/courses/${courseId}/lessons`, {
        title: lessonTitle,
        content: lessonContent,
      });
      setLessonTitle("");
      setLessonContent("");
      setSelectedCourse(null);
      setSuccess("Lesson added successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add lesson. Please try again."));
    } finally {
      setAddingLesson(false);
    }
  };

  return (
    <div>
      <TeacherNavbar />
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Teacher Dashboard</h1>

        {/* Feedback Banner */}
        {error && (
          <div role="alert" aria-live="polite" className="bg-red-100 text-red-700 border border-red-300 rounded-md p-3 mb-4 break-words">
            {error}
          </div>
        )}
        {success && (
          <div role="status" aria-live="polite" className="bg-green-100 text-green-700 border border-green-300 rounded-md p-3 mb-4 break-words">
            {success}
          </div>
        )}

        {/* Create Course Form */}
        <form
          onSubmit={handleCreateCourse}
          className="border border-gray-300 p-4 mb-6 rounded-md bg-slate-50"
        >
          <h2 className="text-lg font-semibold mb-3">Create New Course</h2>
          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creatingCourse}
            className="border border-gray-300 p-2 w-full mb-2 rounded-md disabled:bg-gray-100"
          />
          <input
            type="text"
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={creatingCourse}
            className="border border-gray-300 p-2 w-full mb-2 rounded-md disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={creatingCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition"
          >
            {creatingCourse ? "Creating..." : "Create Course"}
          </button>
        </form>

        {/* Courses List */}
        {loading ? (
          <p className="text-gray-500">Loading courses...</p>
        ) : (
          <div>
            {pageLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : courses.length === 0 ? (
              <p className="text-gray-500">No courses yet.</p>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="border border-gray-300 p-4 mb-3 rounded-md">
                  <h3 className="font-semibold break-words">{course.title}</h3>
                  <p className="text-gray-600 mb-2 break-words">{course.description}</p>

                  <button
                    onClick={() => toggleLessonForm(course.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm w-full sm:w-auto"
                  >
                    {selectedCourse === course.id ? "Cancel" : "Add Lesson"}
                  </button>

                  {selectedCourse === course.id && (
                    <form
                      onSubmit={(e) => handleAddLesson(course.id, e)}
                      className="mt-3 border-t border-gray-300 pt-3"
                    >
                      <input
                        type="text"
                        placeholder="Lesson Title"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        disabled={addingLesson}
                        autoFocus
                        className="border border-gray-300 p-2 w-full mb-2 rounded-md disabled:bg-gray-100"
                      />
                      <textarea
                        placeholder="Lesson Content"
                        value={lessonContent}
                        onChange={(e) => setLessonContent(e.target.value)}
                        disabled={addingLesson}
                        className="border border-gray-300 p-2 w-full mb-2 rounded-md disabled:bg-gray-100"
                        rows={3}
                      />
                      <button
                        type="submit"
                        disabled={addingLesson}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition"
                      >
                        {addingLesson ? "Saving..." : "Save Lesson"}
                      </button>
                    </form>
                  )}
                </div>
              ))
            )}

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || pageLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-md disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={courses.length < coursesPerPage || pageLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-md disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;