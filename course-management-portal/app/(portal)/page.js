'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Navbar from "../../components/nav-bar"
import CourseList from "../../components/course-list"

export default function Home() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/courses', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            
          },
        });
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <Navbar session={session} />
      <div className="flex-grow">
        <CourseList session={session} courses={courses} />
      </div>
    </div>
  );
}
