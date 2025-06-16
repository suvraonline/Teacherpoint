// src/components/Hero.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Left content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Empower Your Learning Journey
          </h1>
          <p className="text-gray-600 mb-6">
            Join Teacherpoint to connect with expert tutors, explore high-quality courses,
            and take your skills to the next level.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Right image */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <Image
            src="/hero-illustration.png" // we will add this next
            alt="Learning illustration"
            width={400}
            height={400}
            priority
          />
        </div>
      </div>
    </section>
  );
}
