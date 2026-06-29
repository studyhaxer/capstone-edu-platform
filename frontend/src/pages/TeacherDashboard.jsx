import StudentNavbar from "../components/TeacherNavbar";

function TeacherDashboard() {
  return (
    <div>
      <StudentNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Welcome to Teacher Dashboard
        </h1>
      </div>
    </div>
  );
}
export default TeacherDashboard;