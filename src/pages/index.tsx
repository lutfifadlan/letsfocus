import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { useCallback } from "react";
import Layout from "@/components/layout";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Card, CardContent } from "@/components/ui/card";
import ShineBorder from "@/components/ui/shine-border";
import LandingArrow from "@/components/arrows/landing";
import AngryUnderline from "@/components/underline/angry";
import DualUnderline from "@/components/underline/dual";
import BlurIn from "@/components/ui/blur-in";
import { ArrowUpDown, ChartNoAxesCombined, List, ListChecks, Sparkles, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import Safari from "@/components/ui/safari";

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();

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
            Modern, simple, and powerful todo list app that helps you {' '}
            <DualUnderline>
              get more things done.
            </DualUnderline>
          </p>
          <div className="mt-4 flex justify-center items-center space-x-2">
            <div className="text-xl text-gray-700 dark:text-gray-300">
              <div className="flex flex-col items-center justify-center">
                <div className="flex flex-row justify-center mt-4">
                  <RainbowButton onClick={handleGetStarted}>
                    Try Free Now
                  </RainbowButton>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="underline hover:cursor-pointer" onClick={() => router.push('/pricing')}>See our pricing.</div>
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <LandingArrow />
            </div>
          </div>
        </section>

        <div className="relative mt-6 max-w-5xl">
          <Safari
            url="https://letsfocus.today/todolists"
            className="size-full"
            src="/todolists.png"
          />
        </div>

        <section className="w-full max-w-5xl mt-12 mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Watch Our Demo</h2>
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              src="https://drive.google.com/file/d/1HIosLt0b0xLSc3P5zL32hr6xy3vaUeMm/preview"
              allow="autoplay"
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </section>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature Card 1 */}
            <ShineBorder color={theme === "dark" ? "white" : "black"}>
              <Card className="text-center h-full p-2">
                <CardContent className="flex flex-col h-[160px] justify-between">
                  <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
                    <ListChecks className="mr-2" />Advanced To-do List
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Manage tasks with advanced features like bulk actions, focus mode, and task ignore. Set priorities, due dates, and more.
                  </p>
                </CardContent>
              </Card>
            </ShineBorder>

            {/* Feature Card 2 */}
            <ShineBorder color={theme === "dark" ? "white" : "black"}>
              <Card className="text-center h-full p-2">
                <CardContent className="flex flex-col h-[160px] justify-center items-center">
                  <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
                    <ChartNoAxesCombined className="mr-2" /> Detailed Statistics
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Visualize productivity with charts and graphs. Track completion rates, time taken, and performance trends.
                  </p>
                </CardContent>
              </Card>
            </ShineBorder>

            {/* Feature Card 3 */}
            <ShineBorder color={theme === "dark" ? "white" : "black"}>
              <Card className="text-center h-full p-2">
                <CardContent className="flex flex-col h-[160px] justify-center items-center">
                  <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
                    <ArrowUpDown className="mr-2" /> Sorting & Filtering
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Drag-and-drop tasks, sort by various criteria, and filter by tags and groups for efficient task management.
                  </p>
                </CardContent>
              </Card>
            </ShineBorder>

            {/* Feature Card 4 */}
            <ShineBorder color={theme === "dark" ? "white" : "black"}>
              <Card className="text-center h-full p-2">
                <CardContent className="flex flex-col h-[160px] justify-center items-center">
                  <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
                    <List className="mr-2" /> Task History
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Access comprehensive task history with detailed information and statistics.
                  </p>
                </CardContent>
              </Card>
            </ShineBorder>

            {/* Feature Card 5 */}
            <ShineBorder color={theme === "dark" ? "white" : "black"}>
              <Card className="text-center h-full p-2">
                <CardContent className="flex flex-col h-[160px] justify-center items-center">
                  <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
                    <Sparkles className="mr-2" /> AI Assistance
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Utilize GPT-4o model to generate tasks and enhance productivity with AI-driven suggestions.
                  </p>
                </CardContent>
              </Card>
            </ShineBorder>

            {/* Feature Card 6 */}
            <ShineBorder color={theme === "dark" ? "white" : "black"}>
              <Card className="text-center h-full p-2">
                <CardContent className="flex flex-col h-[160px] justify-center items-center">
                  <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
                    <MessageSquare className="mr-2" /> Task Comments
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Add, edit, and delete comments on tasks. Collaborate and track important notes for each task.
                  </p>
                </CardContent>
              </Card>
            </ShineBorder>
          </div>
        </div>

        <div className="relative mt-6 max-w-5xl">
          <Safari
            url="https://letsfocus.today/stats"
            className="size-full"
            src="/stats-1.png"
          />
        </div>

        <div className="relative mt-6 max-w-5xl">
          <Safari
            url="https://letsfocus.today/stats"
            className="size-full"
            src="/stats-2.png"
          />
        </div>

        <div className="relative mt-6 max-w-5xl">
          <Safari
            url="https://letsfocus.today/tasks"
            className="size-full"
            src="/tasks.png"
          />
        </div>
      </main>
    </Layout>
  );
}