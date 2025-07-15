"use client";

import "./globals.css";
import TanstackQueryProvider from "@/providers/TanstackQueryProvider";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Sherehe</title>
        <meta
          name="description"
          content="Discover Amazing Events. Find and book tickets for the most exciting events in your area"
        />
      </head>
      <body>
        <Toaster position="top-center" />
        <TanstackQueryProvider>{children}</TanstackQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
