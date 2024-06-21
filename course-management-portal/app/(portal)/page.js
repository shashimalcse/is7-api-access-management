'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Navbar from "../../components/nav-bar"
import CourseList from "../../components/course-list"
import { canPerformAction } from "../../utils/acess-control"
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';


export default function Home() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseDetails, setCourseDetails] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [coursesCategory, setCoursesCategory] = useState('published');
  const [courseCategoryDropdownOpen, setCourseCategoryDropdownOpen] = useState(false);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const url = coursesCategory === 'enrolled'
        ? `http://localhost:3000/api/me/enrollments`
        : `http://localhost:3000/api/courses?status=${coursesCategory}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (response.status === 401) {
        signOut()
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Create course
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
      if (response.status === 401) {
        signOut()
      }
      if (response.ok) {
        setIsModalOpen(false);
      } else {
        console.error('Error creating course:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  // Update course
  const handleUpdateCourse = async () => {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ name: courseName, details: courseDetails, started_date: formattedStartDate }),
      });
      if (response.status === 401) {
        signOut();
      }
      if (response.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setCourseId(null);
        fetchCourses();
      } else {
        console.error('Error updating course:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  // Open modal to create a course
  const openCreateModal = () => {
    setIsEditing(false);
    setCourseId(null);
    setCourseName('');
    setCourseDetails('');
    setStartDate(new Date());
    setIsModalOpen(true);
  };

  // Open modal to edit course
  const openEditModal = (course) => {
    setIsEditing(true);
    setCourseId(course.id);
    setCourseName(course.name);
    setCourseDetails(course.details);
    setStartDate(new Date(course.started_date));
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchCourses(coursesCategory);
  }, [coursesCategory]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100 font-mono">
      <Navbar session={session} />
      <div className="flex-grow p-4">
        <div className="flex flex-row items-center justify-between mt-2 mx-4 text-sm">
          <div className="relative">
            <div
              className="flex flex-row items-center text-gray-700 border border-gray-300 px-4 py-2 rounded-md cursor-pointer text-sm"
              onClick={() => setCourseCategoryDropdownOpen(!courseCategoryDropdownOpen)}
            >
              <div className="mr-2">
                {coursesCategory === 'published' ? 'Published Courses' : coursesCategory === 'pending' ? 'Pending Courses' : coursesCategory === 'approved' ?'Approved Courses' : "Enrolled Courses"}
              </div>
              <FontAwesomeIcon icon={faCaretDown} size='sm' />
            </div>
            {courseCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10 text-gray-600">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-200" onClick={() => { setCoursesCategory('published'); setCourseCategoryDropdownOpen(false); }}>
                  Published Courses
                </button>
                {canPerformAction(session.user.roles, "enroll") && (<button className="w-full px-4 py-2 text-left hover:bg-gray-200" onClick={() => { setCoursesCategory('enrolled'); setCourseCategoryDropdownOpen(false); }} >
                  Enrolled Courses
                </button>)}
                {canPerformAction(session.user.roles, "read-pending") && (<button className="w-full px-4 py-2 text-left hover:bg-gray-200" onClick={() => { setCoursesCategory('pending'); setCourseCategoryDropdownOpen(false); }} >
                  Pending Courses
                </button>)}
                {canPerformAction(session.user.roles, "read-approved") && (<button className="w-full px-4 py-2 text-left hover:bg-gray-200" onClick={() => { setCoursesCategory('approved'); setCourseCategoryDropdownOpen(false); }}>
                  Approved Courses
                </button>)}
              </div>
            )}
          </div>
          {canPerformAction(session.user.roles, 'create') && (
            <button className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={() => openCreateModal()}>Create Course</button>
          )}
        </div>
        <div className="flex-grow">
          <CourseList session={session} courses={courses} setCourses={setCourses} coursesCategory={coursesCategory} setCoursesCategory={setCoursesCategory} onEditCourse={openEditModal} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center text-sm">
          <div className="bg-white p-4 rounded-md shadow-md w-1/3">
            <h2 className="text-black text-2xl font-bold mb-4">{isEditing ? 'Edit Course' : 'Create Course'}</h2>
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
                className="bg-blue-800 text-white px-4 py-2 rounded-md"
                onClick={isEditing ? handleUpdateCourse : handleCreateCourse}
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
