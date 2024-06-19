import "../globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Provider from '../(provider)/session-provider';

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  if (session !== null) {
    redirect("/");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <Provider session={session}>
        <body className={inter.className}>{children}</body>
      </Provider>
    </html>
  );
}
