"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
    return (
        <div className="w-screen h-screen bg-gray-100 flex">
            <div className="w-1/2 flex flex-col items-center justify-center bg-white p-10">
                <h2 className="text-6xl font-bold font-mono text-gray-900">
                    SSI Univeristy
                </h2>
                <p className="text-lg text-gray-500 font-mono mt-4">Course Management Portal</p>
            </div>
            <div className="w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full font-mono space-y-8 p-10">
                    <div>
                        <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">
                            Welcome back!
                        </h2>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => signIn("IS7")}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
