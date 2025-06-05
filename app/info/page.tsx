// -----------------------------------------------------------------------------
// page.tsx
// This file serves as a personal information page for Antonio Archer. It provides
// details about the creator of this project, including portfolio and contact links.
// This page is part of the /info route.
// -----------------------------------------------------------------------------

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Head from 'next/head';

export default function InfoPage() {
    try {
        console.log("AntonioInfoPage component is rendering");
    } catch (error) {
        console.error("Error rendering AntonioInfoPage:", error);
    }

    return (
        <>
            <Head>
                <title>About Antonio Archer - Software Engineer & DevOps Engineer</title>
                <meta name="description" content="Learn about Antonio Archer, a Software Engineer and DevOps Engineer. Discover his work, tech stack, and the innovative solutions he has developed." />
                <meta name="keywords" content="Antonio Archer, Software Engineer, DevOps Engineer, AI, full-stack Next.js, DigitalOcean, GitHub CI/CD, PostgreSQL, Web Development, Portfolio" />
                <meta name="author" content="Antonio Archer" />
                <meta property="og:title" content="About Antonio Archer - Software Engineer & DevOps Engineer" />
                <meta property="og:description" content="Learn about Antonio Archer, a Software Engineer and DevOps Engineer. Discover his work, tech stack, and the innovative solutions he has developed." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.antonioarcher.com" />
                <meta property="og:image" content="/images/logos/lp_logo_transparent.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="About Antonio Archer - Software Engineer & DevOps Engineer" />
                <meta name="twitter:description" content="Learn about Antonio Archer, a Software Engineer and DevOps Engineer. Discover his work, tech stack, and the innovative solutions he has developed." />
                <meta name="twitter:image" content="/images/logos/lp_logo_transparent.png" />
                <meta name="twitter:creator" content="@ad_archer_" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Person",
                            name: "Antonio Archer",
                            url: "https://www.antonioarcher.com",
                            image: "https://www.antonioarcher.com/images/logos/lp_logo_transparent.png",
                            jobTitle: "Software Engineer & DevOps Engineer",
                            worksFor: {
                                "@type": "Organization",
                                name: "Self-employed",
                            },
                            address: {
                                "@type": "PostalAddress",
                                addressLocality: "Philadelphia",
                                addressRegion: "PA",
                                addressCountry: "US",
                            },
                            sameAs: [
                                "https://www.github.com/ad-archer",
                                "https://www.linkedin.com/in/antonio-archer",
                                "https://www.twitter.com/ad_archer_",
                                "https://www.linktr.ee/adarcher",
                                "https://www.adarcher.app",
                                "https://www.youtube.com/@ad-archer",
                                "https://www.instagram.com/Antonio_DArcher",
                            ],
                        }),
                    }}
                />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <motion.main
                    className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/images/logos/antonioarcherlogo.png"
                            alt="Antonio Archer Logo"
                            width={150}
                            height={150}
                            className="rounded-full shadow-md"
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        About Antonio Archer
                    </h1>
                    <p className="text-gray-700 mb-6">
                        Hi, I&apos;m Antonio Archer, the creator of this project. I&apos;m a <strong>Software Engineer</strong> and <strong>DevOps Engineer</strong>. This application was developed
                        as my final project for Launchpad. The goal was to identify a problem or inefficiency
                        at a company and solve it using a <strong>full-stack Next.js</strong> web application with an <strong>AI</strong> backend.
                    </p>

                    {/* Freelancing and Problem-Solving Note */}
                    <p className="text-gray-700 mb-6">
                        I set out to find a client to freelance for and solve a problem I identified. Specifically,
                        I wanted to address inefficiencies at Launchpad, which were still influenced by practices
                        from Building 21. This project aims to modernize and streamline those processes.
                    </p>

                    {/* Hosting and CI/CD Details */}
                    <p className="text-gray-700 mb-6">
                        This site is hosted on <strong>DigitalOcean</strong>, with the database also hosted on <strong>DigitalOcean</strong>. The deployment process is automated using <strong>GitHub CI/CD</strong> pipelines, ensuring a seamless and efficient workflow.
                    </p>

                    {/* SEO Section */}
                    <div className="mt-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">SEO</h2>
                        <p className="text-gray-700 mb-4">
                            To ensure this project reaches its intended audience, I implemented various SEO best practices, including:
                        </p>
                        <ul className="list-disc list-inside mb-4">
                            <li>Optimizing meta tags and descriptions</li>
                            <li>Ensuring mobile-friendliness and fast loading times</li>
                            <li>Implementing structured data for better search visibility</li>
                        </ul>
                    </div>

                    {/* Tech Stack Section */}
                    <div className="mt-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Tech Stack</h2>
                        <div className="flex flex-wrap gap-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">TypeScript</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">Next.js</span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">Drizzle</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">PostgreSQL</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">DigitalOcean</span>
                        </div>
                    </div>

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

                    {/* Project Board Section */}
                    <div className="mt-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Project Board</h2>
                        <p className="text-gray-700 mb-4">
                            Under normal circumstances I utilize a trello board but while working on this project, I came up with an idea for an automated way to create github issues, for a project board, using an AI agent so I created an automation script to streamline the process of generating GitHub issues from spreadsheets. You can find the script here:
                            <a
                                href="https://github.com/AD-Archer/GitHub-Issue-Automation-Script"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                GitHub Issue Automation Script
                            </a>
                        </p>
                    </div>

                    {/* Wireframe and Schema Section */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Wireframe</h3>
                            <Image
                                src="/Documents/wireframe.png"
                                alt="Wireframe of the application"
                                width={800}
                                height={600}
                                className="w-full rounded-lg shadow-md"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Schema</h3>
                            <Image
                                src="/Documents/Schema.png"
                                alt="Database schema of the application"
                                width={800}
                                height={600}
                                className="w-full rounded-lg shadow-md"
                            />
                        </div>
                    </div>

                    {/* Final Site Screenshots Section - moved to top as requested */}
                    <div className="mt-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Final Site Screenshots</h2>
                        <p className="text-gray-700 mb-4">
                            These are the final production screenshots, as shown in the project README. They represent the completed UI and features as deployed.
                        </p>
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Desktop</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Image
                                    src="/images/production_screenshots/finalanalytics.png"
                                    alt="Analytics (Desktop)"
                                    width={800}
                                    height={600}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/finaldashboard.png"
                                    alt="Dashboard (Desktop)"
                                    width={800}
                                    height={600}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/final-ai-panel.png"
                                    alt="AI Panel (Desktop)"
                                    width={800}
                                    height={600}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/finalsettings.png"
                                    alt="Settings (Desktop)"
                                    width={800}
                                    height={600}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/email.png"
                                    alt="Email (Desktop)"
                                    width={800}
                                    height={600}
                                    className="w-full rounded-lg shadow-md"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Image
                                    src="/images/production_screenshots/mobile/mobile-analytics.png"
                                    alt="Analytics (Mobile)"
                                    width={400}
                                    height={300}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/mobile/mobile-dash.png"
                                    alt="Dashboard (Mobile)"
                                    width={400}
                                    height={300}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/mobile/mobile-insights.png"
                                    alt="AI Insights (Mobile)"
                                    width={400}
                                    height={300}
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Image
                                    src="/images/production_screenshots/mobile/mobile-settings.png"
                                    alt="Settings (Mobile)"
                                    width={400}
                                    height={300}
                                    className="w-full rounded-lg shadow-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Screenshots Section (Beta) - moved to bottom as requested */}
                    <div className="mt-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Beta Screenshots</h2>
                        <p className="text-gray-700 mb-4">
                            Note: These screenshots were taken before the database was connected. All data shown is sourced locally from JSON files to ensure compliance and avoid unlawful use.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Desktop Screenshots</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Image
                                        src="/images/screenshots/desktop/ai_insights.png"
                                        alt="AI Insights Desktop Screenshot"
                                        width={800}
                                        height={600}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                    <Image
                                        src="/images/screenshots/desktop/analytics.png"
                                        alt="Analytics Desktop Screenshot"
                                        width={800}
                                        height={600}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                    <Image
                                        src="/images/screenshots/desktop/frontpage.png"
                                        alt="Frontpage Desktop Screenshot"
                                        width={800}
                                        height={600}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                    <Image
                                        src="/images/screenshots/desktop/settings.png"
                                        alt="Settings Desktop Screenshot"
                                        width={800}
                                        height={600}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Mobile Screenshots</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Image
                                        src="/images/screenshots/mobile/Ai_insights.png"
                                        alt="AI Insights Mobile Screenshot"
                                        width={400}
                                        height={300}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                    <Image
                                        src="/images/screenshots/mobile/analytics.png"
                                        alt="Analytics Mobile Screenshot"
                                        width={400}
                                        height={300}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                    <Image
                                        src="/images/screenshots/mobile/create.png"
                                        alt="Create Page Mobile Screenshot"
                                        width={400}
                                        height={300}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                    <Image
                                        src="/images/screenshots/mobile/dashboard.png"
                                        alt="Dashboard Mobile Screenshot"
                                        width={400}
                                        height={300}
                                        className="w-full rounded-lg shadow-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.main>
            </div>
        </>
    );
}