import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import TeacherNavbar from "../components/TeacherNavbar";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
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

  const fetchCourses = async (page = 1) => {
    try {
      const skip = (page - 1) * coursesPerPage;
      const res = await axiosClient.get(`/courses?skip=${skip}&limit=${coursesPerPage}`);
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      setError("Failed to load courses. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  const handleCreateCourse = async () => {
    if (!title.trim()) return;
    try {
      await axiosClient.post("/courses", { title, description });
      setTitle("");
      setDescription("");
      setSuccess("Course created successfully.");
      fetchCourses(1);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to create course", err);
      setError("Failed to create course. Please try again.");
    }
  };

  // Toggle lesson form for a course, resetting any leftover input
  const toggleLessonForm = (courseId) => {
    setSelectedCourse(selectedCourse === courseId ? null : courseId);
    setLessonTitle("");
    setLessonContent("");
  };

  const handleAddLesson = async (courseId) => {
    if (!lessonTitle.trim()) return;
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
      console.error("Failed to add lesson", err);
      setError("Failed to add lesson. Please try again.");
    }
  };

  return (
    <div>
      <TeacherNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Teacher Dashboard</h1>

        {/* Feedback Banner */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 border border-green-300 rounded p-3 mb-4">
            {success}
          </div>
        )}

        {/* Create Course Form */}
        <div className="border p-4 mb-6 rounded bg-slate-50">
          <h2 className="text-lg font-semibold mb-3">Create New Course</h2>
          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="text"
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <button
            onClick={handleCreateCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Course
          </button>
        </div>

        {/* Courses List */}
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div>
            {courses.length === 0 ? (
              <p>No courses yet.</p>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="border p-4 mb-3 rounded">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-gray-600 mb-2">{course.description}</p>

                  <button
                    onClick={() => toggleLessonForm(course.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {selectedCourse === course.id ? "Cancel" : "Add Lesson"}
                  </button>

                  {selectedCourse === course.id && (
                    <div className="mt-3 border-t pt-3">
                      <input
                        type="text"
                        placeholder="Lesson Title"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        className="border p-2 w-full mb-2 rounded"
                      />
                      <textarea
                        placeholder="Lesson Content"
                        value={lessonContent}
                        onChange={(e) => setLessonContent(e.target.value)}
                        className="border p-2 w-full mb-2 rounded"
                        rows={3}
                      />
                      <button
                        onClick={() => handleAddLesson(course.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Save Lesson
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={courses.length < coursesPerPage}
                className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-40"
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
