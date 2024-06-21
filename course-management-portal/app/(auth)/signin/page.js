"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
    return (
        <div className="w-screen h-screen bg-gray-100 flex">
            <div className="w-1/2 flex flex-col items-center justify-center bg-white p-10">
                <h3 className="text-4xl font-medium text-gray-900">
                    Standford Univeristy
                </h3>
                <p className="text-lg text-gray-500 mt-4">Course Management Portal</p>
            </div>
            <div className="w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 p-10">
                    <div>
                        <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">
                            Login to Your University Portal
                        </h2>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => signIn("IS7")}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
