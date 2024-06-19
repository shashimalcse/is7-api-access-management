"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex items-center justify-center flex-1 bg-foreground">
                <div className="flex text-2xl font-medium text-cyan-50">
                    WiseBot
                </div>
            </div>
            <div className="flex items-center justify-center flex-1 bg-black">
                <button className="outline" type="button" onClick={() => {signIn('IS7'); console.log("here");}}>
                    Sign in with IS7
                </button>
            </div>
        </div>
    )
}
