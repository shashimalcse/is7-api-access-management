import "../globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Provider from '../(provider)/session-provider';
import { authOptions } from '../api/auth/[...nextauth]/route'

const inter = Inter({ subsets: ["latin"] });

export default async function asyncRootLayout({ children }) {

  const session = await getServerSession(authOptions);
  if (session ===  null) {
    redirect("/signin")
  }
  console.log(session);
  return (
    <html lang="en">
      <Provider session={session}>
      <body className={inter.className}>{children}</body>
      </Provider>
    </html>
  );
}
