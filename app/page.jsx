"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  const route = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("currentUser")) {
      route.push("/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <motion.header
        className="text-center mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold text-blue-700">
          Mentorship Matching Platform
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          Your journey of growth starts here! Connect with mentors and mentees
          to learn, share, and succeed together.
        </p>
      </motion.header>
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <Link
          href={"/register"}
          className="bg-blue-500 text-white px-6 py-3 rounded-md shadow hover:bg-blue-600 transition-transform transform hover:scale-105"
        >
          Register
        </Link>

        <Link
          href={"/login"}
          className="bg-gray-500 text-white px-6 py-3 rounded-md shadow hover:bg-gray-600 transition-transform transform hover:scale-105"
        >
          Login
        </Link>
      </motion.div>
      <motion.footer
        className="absolute bottom-4 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p>&copy; 2024 Mentorship Matching Platform. All rights reserved.</p>
      </motion.footer>
      <motion.div
        className="absolute top-20 right-10 bg-blue-200 p-4 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <p className="text-sm text-blue-700 font-medium">
          "Discover the perfect mentor to guide your journey. Unleash your full
          potential!"
        </p>
      </motion.div>
    </div>
  );
}
