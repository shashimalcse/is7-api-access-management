'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Navbar from "../../components/nav-bar"
import CourseList from "../../components/course-list"
import { useRouter } from 'next/navigation';
import { canPerformAction } from "../../utils/acess-control"
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export default function Home() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDetails, setCourseDetails] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [coursesCategory, setCoursesCategory] = useState('published');
  const [courseCategoryDropdownOpen, setCourseCategoryDropdownOpen] = useState(false);
  const fetchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses?status=${coursesCategory}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,

        },
      });
      const data = await response.json();
      console.log("courses", data)
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses(coursesCategory);
  }, [coursesCategory]);

  const handleCreateCourse = async () => {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ name: courseName, details: courseDetails, started_date: formattedStartDate }),
      });

      if (response.ok) {
        setIsModalOpen(false);
      } else {
        console.error('Error creating course:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <Navbar session={session} />
      <div className="flex-grow p-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-row items-center">
            <h1 className="text-black text-xl font-semibold mr-10">Courses</h1>
            <div className="relative">
              <div
                className="text-gray-700 border border-gray-300 px-4 py-2 rounded-md cursor-pointer"
                onClick={() => setCourseCategoryDropdownOpen(!courseCategoryDropdownOpen)}
              >
                Filter By
              </div>
              {courseCategoryDropdownOpen && (canPerformAction(session.user.roles, "read-pending") || canPerformAction(session.user.roles, "read-approved")) && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                  <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200" onClick={() => { setCoursesCategory('published'); setCourseCategoryDropdownOpen(false); }}>
                    Published Courses
                  </button>
                  {canPerformAction(session.user.roles, "read-pending") && (<button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200" onClick={() => { setCoursesCategory('pending'); setCourseCategoryDropdownOpen(false); }} >
                    Pending Courses
                  </button>)}
                  {canPerformAction(session.user.roles, "read-approved") && (<button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200" onClick={() => { setCoursesCategory('approved'); setCourseCategoryDropdownOpen(false); }}>
                    Approved Courses
                  </button>)}
                </div>
              )}
            </div>
          </div>
          {canPerformAction(session.user.roles, 'create') && (
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md"
              onClick={() => setIsModalOpen(true)}
            >
              Create Course
            </button>
          )}
        </div>
        <div className="flex-grow">
          <CourseList session={session} courses={courses} coursesCategory={coursesCategory} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md w-1/3">
            <h2 className="text-black text-xl mb-4">Create Course</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                className="text-gray-600 w-full p-2 border border-gray-300 rounded mt-1"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Details</label>
              <textarea
                className="text-gray-600 w-full p-2 border border-gray-300 rounded mt-1"
                value={courseDetails}
                onChange={(e) => setCourseDetails(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="text-gray-600 w-full p-2 border border-gray-300 rounded mt-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                onClick={handleCreateCourse}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
