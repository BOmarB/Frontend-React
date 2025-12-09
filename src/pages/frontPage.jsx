import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award } from "lucide-react";
import { useAuth } from "../contexts/authContext";
import { useTheme } from "../contexts/themeContext";
import heroImage from "../imgs/ft3.png"; // Import at the top level

const FrontPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  

  const features = [
    {
      name: "Smart Testing",
      description:
        "Advanced exam creation with multiple question types and automated grading",
      icon: BookOpen,
    },
    {
      name: "User Management",
      description:
        "Comprehensive tools for managing students, teachers, and administrators",
      icon: Users,
    },
    {
      name: "Real-time Results",
      description:
        "Instant feedback and detailed analytics for better learning outcomes",
      icon: Award,
    },
  ];

  const getStarted = () => {
    if (!user) {
      return (
        <div className="mt-10 flex items-center gap-x-6">
          <Link
            to="/register"
            className="text-decoration-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </Link>
          <Link
            to="/learn-more"
            className={`text-decoration-none text-sm font-semibold leading-6 ${
              isDarkMode ? "text-gray-300" : "text-gray-900"
            }`}
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      );
    }
  };

  return (
    <div className={isDarkMode ? "bg-gray-900" : "bg-white"}>
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div
          className={`absolute inset-0 -z-10 ${
            isDarkMode
              ? "bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),rgb(17,24,39))] opacity-40"
              : "bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20"
          }`}
        />
        <div
          className={`absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] ${
            isDarkMode
              ? "bg-gray-900 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-900"
              : "bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50"
          } sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center`}
        />

        <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-6">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
            <h1
              className={`max-w-2xl text-4xl font-bold tracking-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              } sm:text-6xl lg:col-span-2 xl:col-auto`}
            >
              Modern exam platform for modern education
            </h1>
            <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
              <p
                className={`text-lg leading-8 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Create, manage, and grade exams with ease. A comprehensive
                platform designed for administrators, teachers, and students.
                Experience the future of assessment today.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                {getStarted()}
              </div>
            </div>
            <img
              src={heroImage}
              alt="App screenshot"
              className="mt-10 w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 animate-float"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Everything you need
          </h2>
          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            } sm:text-4xl`}
          >
            Powerful features for everyone
          </p>
          <p
            className={`mt-6 text-lg leading-8 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Our platform provides all the tools needed for modern educational
            assessment, from creating exams to analyzing results.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt
                  className={`flex items-center gap-x-3 text-base font-semibold leading-7 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <feature.icon
                    className="h-5 w-5 flex-none text-blue-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd
                  className={`mt-4 flex flex-auto flex-col text-base leading-7 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="mx-auto mt-32 max-w-7xl sm:mt-40 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-gray-900"
          } px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20`}
        >
          <div
            className={`absolute inset-0 ${
              isDarkMode ? "bg-gray-800/90" : "bg-gray-900/90"
            }`}
          />
          <div className="relative mx-auto max-w-2xl lg:mx-0">
            <figure>
              <blockquote className="text-xl font-semibold leading-8 text-white sm:text-2xl sm:leading-9">
                <p>
                  "This platform has revolutionized how we conduct examinations.
                  It's intuitive, reliable, and saves us countless hours in
                  grading and analysis."
                </p>
              </blockquote>
             
            </figure>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="mt-32 sm:mt-40">
        <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
          <div
            className={`border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-900/10"
            } pt-8`}
          >
            <p
              className={`text-sm leading-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              &copy; 2024 Examly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FrontPage;
