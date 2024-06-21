import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function Navbar({ session }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="w-full h-16 text-white bg-indigo-600 flex items-center justify-between px-4 relative">
      <div className="text-lg font-bold">Course Management Portal</div>
      <div className="relative">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer bg-pink-500"
          onClick={handleAvatarClick}
        >
            {session.user.firstName[0]}
        </div>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
            <div className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
              {session.user.firstName} {session.user.lastName}
            </div>
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
