export default function CourseList({ session, courses }) {
    return (
      <div className="p-4">
        <h2 className="text-black text-2xl font-bold mb-6">Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-4">
                <h3 className="text-gray-700 text-lg font-semibold mb-2">{course.name}</h3>
                <p className="text-gray-600">{course.description}</p>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500">
                  {session.user.roles.includes("student")? "Enroll" : "View Details"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  