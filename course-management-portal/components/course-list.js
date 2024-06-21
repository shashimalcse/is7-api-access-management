'use client'

import { canPerformAction } from "@/utils/acess-control";
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function CourseList({ session, courses, setCourses, coursesCategory, setCoursesCategory, onEditCourse }) {

  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Patch course
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
      if (response.status === 401) {
        signOut()
      }
      if (response.ok) {
        if (coursesCategory === 'approved') {
          setCoursesCategory('published')
        }
        else if (coursesCategory === 'pending') {
          setCoursesCategory('approved')
        }
      } else {
        console.error('Error updating status of course:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating status of course:', error);
    }
  };

  // Enroll for a course
  const enroll = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status: status }),
      });
      if (response.status === 401) {
        signOut()
      }
      if (response.ok) {
        getMyEnrollments();
      } else {
        console.error('Error while enrolling course:', response.statusText);
      }
    } catch (error) {
      console.error('Error while enrolling course:', error);
    }
  };

  // Get my enrollments
  const getMyEnrollments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/me/enrollments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (response.status === 401) {
        signOut()
      }
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data);
      } else {
        console.error('Error getting enrolled course:', response.statusText);
      }
    } catch (error) {
      console.error('Error getting enrolled course:', error);
    }
  };

  // Delete course
  const deleteCourse = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        }
      });
      if (response.status === 401) {
        signOut()
      }
      if (response.ok) {
        // Remove the course from the list of courses
        const updatedCourses = courses.filter(course => course.id !== id);
        setCourses(updatedCourses);
      } else {
        console.error('Error deleting course:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  // Get no courses message
  const getNoCoursesMessage = () => {
    if (coursesCategory === 'published') {
      return "No published courses";
    } else if (coursesCategory === 'pending') {
      return "No pending courses";
    } else if (coursesCategory === 'approved') {
      return "No approved courses";
    } else if (coursesCategory === 'enrolled') {
      return "No enrolled courses";
    }
    return "";
  };


  useEffect(() => {
    canPerformAction(session.user.roles, "enroll") && getMyEnrollments();
  }, []);

  return (
    <div className="p-4">
      {courses.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          {getNoCoursesMessage()}
        </div>) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden text-sm">
              <div className="p-4">
                <h3 className="text-gray-700 text-xl font-semibold mb-2">{course.name}</h3>
                <div className="bg-gray-100 p-4 rounded mb-4">
                  <p className="text-gray-600 mb-2">Details: {course.details}</p>
                  <p className="text-gray-600">Starting Date: {course.started_date}</p>
                </div>
                {
                  coursesCategory === 'published' && canPerformAction(session.user.roles, "enroll") && (
                    enrolledCourses.find(c => c.id === course.id) ? (
                      <button className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-600" onClick={() => enroll(course.id, 'unenroll')}>
                        Unenroll
                      </button>
                    ) : (
                      <button className="mt-4 w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-600" onClick={() => enroll(course.id, 'enroll')}>
                        Enroll
                      </button>
                    )
                  )
                }
                {
                  coursesCategory === 'enrolled' && canPerformAction(session.user.roles, "enroll") && (
                    <button className="mt-4 w-full bg-red-800 text-white py-2 rounded hover:bg-red-600" onClick={() => enroll(course.id, 'unenroll')}>
                      Unroll
                    </button>
                  )
                }
                {
                  coursesCategory === 'pending' && canPerformAction(session.user.roles, "approve") && (
                    <button className="mt-4 w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-600" onClick={() => patchCourse(course.id, "approved")}>
                      Approve
                    </button>
                  )
                }
                {
                  coursesCategory === 'pending' && canPerformAction(session.user.roles, "update") && (
                    <button className="mt-4 w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-600" onClick={() => onEditCourse(course)}>
                      Edit
                    </button>
                  )
                }
                {
                  coursesCategory === 'approved' && canPerformAction(session.user.roles, "publish") && (
                    <button className="mt-4 w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-600" onClick={() => patchCourse(course.id, "published")}>
                      Publish
                    </button>
                  )
                }
                {
                  canPerformAction(session.user.roles, "delete") && (
                    <button className="mt-4 w-full bg-red-800 text-white py-2 rounded hover:bg-red-600" onClick={() => deleteCourse(course.id)}>
                      Delete
                    </button>
                  )
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
