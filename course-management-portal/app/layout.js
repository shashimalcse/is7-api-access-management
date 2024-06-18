'use client';

import "./globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }) {

  const session = await getServerSession();
  console.log(session)
  if (!session || !session.accessToken) {
    console.log("redirecting to signin")
    redirect("/signin")
  }

  console.log(session)

  return (
    <html lang="en">
      <SessionProvider session={session}>
      <body className={inter.className}>{children}</body>
      </SessionProvider>
    </html>
  );
}
