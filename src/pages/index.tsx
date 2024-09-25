import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { useCallback } from "react";
import Layout from "@/components/layout";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#000000', '#ffffff'],
    });

    return router.push('/signin');
  }, [router]);

  return (
    <Layout>
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero Section */}
        <section className="text-center mt-24 md:mt-32">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white">
            The Minimalist Productivity App
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
            Simplify your workflow. Maximize your productivity.
          </p>
          <Button
            className="mt-8 px-8 py-3 text-lg font-medium rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </section>

        {/* Features Section */}
        <section className="w-full mt-28 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 dark:text-white">
              Let&apos;s Focus Features
            </h2>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Seamless Task Management
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Organize and prioritize without the clutter.
                </p>
              </div>
              {/* Feature Card 2 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Intuitive Habit Tracker
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Build habits effortlessly with minimalist tracking.
                </p>
              </div>
              {/* Feature Card 3 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Distraction-Free Focus Mode
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Stay in the zone with a clean, uninterrupted interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
