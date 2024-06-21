'use client'

import { canPerformAction } from "@/utils/acess-control";
import { useRouter } from 'next/navigation';

export default function CourseList({ session, courses, coursesCategory }) {

  const router = useRouter();
  const patchCourse = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status: status }),
      });

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error creating course:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const enroll = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        }
      });

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error creating course:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const deleteCourse = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        }
      });

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error creating course:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-gray-700 text-lg font-semibold mb-2">{course.name}</h3>
              <p className="text-gray-600">Details : {course.details}</p>
              <p className="text-gray-600">Started Date : {course.started_date}</p>
              {
                coursesCategory === 'published' && canPerformAction(session.user.roles, "enroll") && (
                  <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500" onClick={() => enroll(course.id)}>
                    Enroll
                  </button>
                )
              }
              {
                coursesCategory === 'pending' && canPerformAction(session.user.roles, "approve") && (
                  <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500" onClick={() => patchCourse(course.id, "approved")}>
                    Approve
                  </button>
                )
              }
              {
                coursesCategory === 'approved' && canPerformAction(session.user.roles, "publish") && (
                  <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500" onClick={() => patchCourse(course.id, "published")}>
                    Publish
                  </button>
                )
              }
              {
                canPerformAction(session.user.roles, "delete") && (
                  <button className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-500" onClick={() => deleteCourse(course.id)}>
                    Delete
                  </button>
                )
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
