import StudentNavbar from "../components/StudentNavbar";

function StudentDashboard() {
  return (
    <div>
      <StudentNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Welcome to Student Dashboard
        </h1>
      </div>
    </div>
  );
}
export default StudentDashboard;