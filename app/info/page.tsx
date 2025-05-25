// -----------------------------------------------------------------------------
// page.tsx
// This file serves as a personal information page for Antonio Archer. It provides
// details about the creator of this project, including portfolio and contact links.
// This page is part of the /info route.
// -----------------------------------------------------------------------------

"use client";

import { motion } from "framer-motion";

export default function InfoPage() {
    try {
        console.log("AntonioInfoPage component is rendering");
    } catch (error) {
        console.error("Error rendering AntonioInfoPage:", error);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
            <motion.main
                className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    About Antonio Archer
                </h1>
                <p className="text-gray-700 mb-6">
                    Hi, I&apos;m Antonio Archer, the creator of this project. This application was developed
                    as my final project for Launchpad. The goal was to identify a problem or inefficiency
                    at a company and solve it using a full-stack Next.js web application with an AI backend.
                    I chose to build this project using TypeScript, Drizzle, and PostgreSQL.
                </p>
                <div className="space-y-4">
                    <p className="text-gray-700">
                        You can learn more about me and my work at my portfolio:
                        <a
                            href="https://www.antonioarcher.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            antonioarcher.com
                        </a>
                    </p>
                    <p className="text-gray-700">
                        For business inquiries or to connect with me, visit my contact site:
                        <a
                            href="https://www.adarcher.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            adarcher.app
                        </a>
                    </p>
                </div>
            </motion.main>
        </div>
    );
}