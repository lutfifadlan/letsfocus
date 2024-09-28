import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { useCallback } from "react";
import Layout from "@/components/layout";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    return router.push('/signin');
  }, [router]);

  return (
    <Layout>
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero Section */}
        <section className="text-center mt-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white">
            The Minimalist To-Do List
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Simplify your workflow. Maximize your productivity.
          </p>
          <div className="mt-8 text-xl text-gray-700 dark:text-gray-300 ">
            <RainbowButton
              onClick={handleGetStarted}
            >
            Get Started
            </RainbowButton>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full mt-4 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 dark:text-white">
              Features That Boost Productivity
            </h2>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Minimalist Design
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Focus on what really matters. Our minimalist to-do lists helps you stay productive and clutter-free.
                </p>
              </div>
              {/* Feature Card 2 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Task Stats & Analytics
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Get insights on your productivity and track progress over time.
                </p>
              </div>
              {/* Feature Card 3 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Free Forever
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No fees, no hidden costs. Enjoy all features with zero cost.
                </p>
              </div>
              {/* Feature Card 4 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Tag Your Tasks
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Organize tasks with tags for quick and easy filtering.
                </p>
              </div>
              {/* Feature Card 5 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Completed & Deleted Tasks
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Review completed or deleted tasks anytime with ease.
                </p>
              </div>
              {/* Feature Card 6 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Assign Tasks to Projects
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Group your tasks under specific projects to stay organized.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
