import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { useCallback } from "react";
import Layout from "@/components/layout";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import DummyTodolistsPage from "@/components/dummy-todolists";
import { Card, CardContent } from "@/components/ui/card";
import ShineBorder from "@/components/ui/shine-border";
import { useTheme } from "next-themes";
import LandingArrow from "@/components/arrows/landing";
import AngryUnderline from "@/components/underline/angry";
import BlurIn from "@/components/ui/blur-in";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();

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
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            <span className="inline-block rounded-sm px-1.5 py-0.5 mb-1 dark:text-white">Clear Your Mind. Break It Down.</span> <br/>
            <span className="inline-block bg-blue-400 rounded-sm px-1.5 py-0.5 mb-1">
              What You Need is {' '}
              <AngryUnderline>
                <BlurIn word="Focus" duration={1} className="inline-block text-3xl md:text-5xl" />
              </AngryUnderline>
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
            Modern, simple, and powerful todo list app that helps you get things done.
          </p>
          <div className="mt-8 flex justify-center items-center space-x-4">
            <div/>
            <div className="text-xl text-gray-700 dark:text-gray-300">
              <RainbowButton onClick={handleGetStarted}>
                Try Free Now
              </RainbowButton>
            </div>
            <div className="flex justify-center items-center">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Or try our mini app
              </p>
              <LandingArrow />
            </div>
          </div>
        </section>

        {/* Embed DummyTodolistsPage directly on the landing page */}
        <section className="w-full mt-8">
          <ShineBorder className="relative max-w-3xl mx-auto" color={theme.theme === "dark" ? "white" : "black"}>
            <Card className="p-0 m-0 relative z-10 w-full h-full">
              <CardContent>
                <DummyTodolistsPage />
              </CardContent>
            </Card>
          </ShineBorder>
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
                  Simple Design
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Focus on what really matters. Our to-do list app is simple and easy to use.
                </p>
              </div>
              {/* Feature Card 9 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Detailed Statistics
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Visualize your productivity with charts and graphs. Track task completion rates, time taken, and performance over time.
                </p>
              </div>
              {/* Feature Card 3 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Focus Mode
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Enable focus mode on tasks to indicate that you are working on them.
                </p>
              </div>
              {/* Feature Card 4 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Tag and Group Your Tasks
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Organize tasks with tags for quick and easy filtering. Group your tasks to stay organized.
                </p>
              </div>
              {/* Feature Card 7 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Task Management
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Manage your tasks efficiently with features like task creation, editing, deletion, ignoring, completion, due date, and priority.
                </p>
              </div>
              {/* Feature Card 8 */}
              <div className="text-center">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Tasks Filtering and Sorting
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Filter tasks by date, status, tags, and groups. Sort tasks by priority, due date, and more to find exactly what you need quickly.
                </p>
              </div>
       
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}