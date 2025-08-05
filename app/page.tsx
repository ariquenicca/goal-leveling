"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trophy, Star, Target, Gift, CheckCircle2, Plus, ArrowLeft, Settings, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoalManagementPage } from "@/components/goal-management-page"
import { AuthProvider } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { useSession, signOut } from "next-auth/react"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
}

interface Level {
  id: number
  title: string
  description: string
  tasks: Task[]
  reward: string
  completed: boolean
  unlocked: boolean
}

interface Goal {
  id: string
  title: string
  description: string
  icon: string
  category: string
  levels: Level[]
  currentLevel: number
  totalXP: number
  createdAt: Date
}

type AppView = "dashboard" | "goal-management" | "goal-tracking"

function GoalTracker() {
  const { data: session, status } = useSession()
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [currentView, setCurrentView] = useState<AppView>("dashboard")

  // Load user data when session changes
  useEffect(() => {
    if (session?.user?.email) {
      loadUserData(session.user.email)
    }
  }, [session])

  const loadUserData = (userEmail: string) => {
    try {
      const savedData = localStorage.getItem(`goalleveling_${userEmail}`)
      if (savedData) {
        const userData = JSON.parse(savedData)
        setGoals(userData.goals || [])
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setGoals([])
    }
  }

  const saveUserData = (userEmail: string, data: { goals: Goal[] }) => {
    try {
      localStorage.setItem(`goalleveling_${userEmail}`, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }

  const handleGoalsUpdate = (newGoals: Goal[]) => {
    setGoals(newGoals)
    if (session?.user?.email) {
      saveUserData(session.user.email, { goals: newGoals })
    }
  }

  const handleLogout = async () => {
    setSelectedGoal(null)
    setCurrentView("dashboard")
    setGoals([])
    await signOut({ callbackUrl: "/" })
  }

  const toggleTask = (goalId: string, levelId: number, taskId: string) => {
    setGoals((prevGoals) => {
      const newGoals = prevGoals.map((goal) => {
        if (goal.id === goalId) {
          const updatedLevels = goal.levels.map((level) => {
            if (level.id === levelId) {
              const updatedTasks = level.tasks.map((task) => {
                if (task.id === taskId) {
                  const newCompleted = !task.completed
                  if (newCompleted && !task.completed) {
                    goal.totalXP += 10
                  } else if (!newCompleted && task.completed) {
                    goal.totalXP -= 10
                  }
                  return { ...task, completed: newCompleted }
                }
                return task
              })

              const allTasksCompleted =
                updatedTasks.length === 0 ? level.completed : updatedTasks.every((task) => task.completed)
              return {
                ...level,
                tasks: updatedTasks,
                completed: allTasksCompleted,
              }
            }
            return level
          })

          // Check if current level is completed and unlock next level
          const currentLevelData = updatedLevels.find((l) => l.id === goal.currentLevel)
          if (currentLevelData?.completed) {
            const nextLevel = updatedLevels.find((l) => l.id === goal.currentLevel + 1)
            if (nextLevel && !nextLevel.unlocked) {
              nextLevel.unlocked = true
              goal.currentLevel = goal.currentLevel + 1
              goal.totalXP += 50 // Bonus XP for level completion
            }
          }

          return {
            ...goal,
            levels: updatedLevels,
          }
        }
        return goal
      })

      // Save to localStorage
      if (session?.user?.email) {
        saveUserData(session.user.email, { goals: newGoals })
      }

      return newGoals
    })
  }

  // Add new function for manual level completion
  const toggleLevelCompletion = (goalId: string, levelId: number) => {
    setGoals((prevGoals) => {
      const newGoals = prevGoals.map((goal) => {
        if (goal.id === goalId) {
          const updatedLevels = goal.levels.map((level) => {
            if (level.id === levelId) {
              const newCompleted = !level.completed
              if (newCompleted && !level.completed) {
                goal.totalXP += 50 // XP for manual level completion
              } else if (!newCompleted && level.completed) {
                goal.totalXP -= 50
              }
              return { ...level, completed: newCompleted }
            }
            return level
          })

          // Check if current level is completed and unlock next level
          const currentLevelData = updatedLevels.find((l) => l.id === goal.currentLevel)
          if (currentLevelData?.completed) {
            const nextLevel = updatedLevels.find((l) => l.id === goal.currentLevel + 1)
            if (nextLevel && !nextLevel.unlocked) {
              nextLevel.unlocked = true
              goal.currentLevel = goal.currentLevel + 1
            }
          }

          return {
            ...goal,
            levels: updatedLevels,
          }
        }
        return goal
      })

      // Save to localStorage
      if (session?.user?.email) {
        saveUserData(session.user.email, { goals: newGoals })
      }

      return newGoals
    })
  }

  const getCompletedTasksCount = (level: Level) => level.tasks.filter((t) => t.completed).length
  const getTotalTasksCount = (goal: Goal) => goal.levels.reduce((total, level) => total + level.tasks.length, 0)
  const getCompletedTotalTasks = (goal: Goal) =>
    goal.levels.reduce((total, level) => total + getCompletedTasksCount(level), 0)

  // Add new function for overall progress including manual completions
  const getOverallProgress = (goal: Goal) => {
    const totalLevels = goal.levels.length
    const completedLevels = goal.levels.filter((level) => level.completed).length
    const totalTasks = getTotalTasksCount(goal)
    const completedTasks = getCompletedTotalTasks(goal)

    if (totalLevels === 0) return 0

    // If there are tasks, use task-based progress, otherwise use level-based progress
    if (totalTasks > 0) {
      return (completedTasks / totalTasks) * 100
    } else {
      return (completedLevels / totalLevels) * 100
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
            </div>
            <p className="text-slate-600 mt-6 font-medium">Loading Goal Leveling...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <LoginForm />
  }

  // Goal Management Page
  if (currentView === "goal-management") {
    return (
      <GoalManagementPage
        goals={goals}
        onGoalsUpdate={handleGoalsUpdate}
        onBack={() => setCurrentView("dashboard")}
        userSession={{
          name: session?.user?.name || "User",
          email: session?.user?.email || "",
          isAuthenticated: true,
        }}
      />
    )
  }

  // Goal Tracking Page
  if (currentView === "goal-tracking" && selectedGoal) {
    const currentLevelData = selectedGoal.levels.find((l) => l.id === selectedGoal.currentLevel)
    const overallProgress = getOverallProgress(selectedGoal)

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                onClick={() => setCurrentView("dashboard")}
                className="border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="text-4xl drop-shadow-sm">{selectedGoal.icon}</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {selectedGoal.title}
              </h1>
            </div>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">{selectedGoal.description}</p>

            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-200">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-bold text-slate-700">Level {selectedGoal.currentLevel}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
                <Star className="h-6 w-6 text-purple-500" />
                <span className="font-bold text-slate-700">{selectedGoal.totalXP} XP</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
                <Target className="h-6 w-6 text-blue-500" />
                <span className="font-bold text-slate-700">
                  {getCompletedTotalTasks(selectedGoal)}/{getTotalTasksCount(selectedGoal)} Tasks
                </span>
              </div>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="flex justify-between text-sm text-slate-600 mb-3">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-4 bg-white/50" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Level Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold">
                        Level {currentLevelData?.id}: {currentLevelData?.title}
                      </CardTitle>
                      <CardDescription className="text-indigo-100 text-lg mt-2">
                        {currentLevelData?.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-lg px-4 py-2">
                      {currentLevelData ? getCompletedTasksCount(currentLevelData) : 0}/
                      {currentLevelData?.tasks.length || 0} Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {currentLevelData?.tasks.length === 0 ? (
                    // No tasks - manual completion
                    <div className="text-center py-12">
                      <div className="text-6xl mb-6">🎯</div>
                      <h3 className="text-2xl font-bold text-slate-700 mb-4">No Tasks Required</h3>
                      <p className="text-slate-500 text-lg mb-8">
                        This level doesn't have specific tasks. Mark it as complete when you've achieved your goal.
                      </p>
                      <Button
                        onClick={() => toggleLevelCompletion(selectedGoal.id, currentLevelData.id)}
                        size="lg"
                        className={`h-14 px-8 text-lg font-semibold ${
                          currentLevelData.completed
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        }`}
                      >
                        {currentLevelData.completed ? (
                          <>
                            <CheckCircle2 className="h-6 w-6 mr-3" />
                            Mark as Incomplete
                          </>
                        ) : (
                          <>
                            <Target className="h-6 w-6 mr-3" />
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    // Has tasks - show task list
                    <div className="space-y-6">
                      {currentLevelData?.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-4 p-6 rounded-xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(selectedGoal.id, currentLevelData.id, task.id)}
                            className="mt-1 h-5 w-5"
                          />
                          <div className="flex-1">
                            <h4
                              className={`font-semibold text-lg ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}
                            >
                              {task.title}
                            </h4>
                            <p className="text-slate-500 mt-2">{task.description}</p>
                          </div>
                          {task.completed && <CheckCircle2 className="h-6 w-6 text-green-500 mt-1" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {currentLevelData?.completed && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-3 text-green-700">
                        <Trophy className="h-6 w-6" />
                        <span className="font-bold text-xl">Level Complete!</span>
                      </div>
                      <p className="text-green-600 mt-2 text-lg">
                        {currentLevelData.tasks.length === 0
                          ? "Great job! You've completed this level manually."
                          : "Congratulations! You've completed all tasks for this level."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Reward */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Gift className="h-6 w-6 text-orange-500" />
                    Next Reward
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                    <div className="text-4xl mb-4">🎁</div>
                    <div className="font-semibold text-slate-700 break-words whitespace-pre-wrap">
                      {currentLevelData?.reward || "Complete this level to see your reward!"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level Roadmap */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Roadmap</CardTitle>
                  <CardDescription className="text-base">Your journey progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedGoal.levels.map((level) => (
                      <div key={level.id} className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            level.completed
                              ? "bg-green-500 text-white border-green-500"
                              : level.id === selectedGoal.currentLevel
                                ? "bg-indigo-500 text-white border-indigo-500"
                                : level.unlocked
                                  ? "bg-blue-50 text-blue-600 border-blue-300"
                                  : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}
                        >
                          {level.completed ? <CheckCircle2 className="h-5 w-5" /> : level.id}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${level.unlocked ? "text-slate-700" : "text-slate-400"}`}>
                            {level.title}
                          </div>
                          <div className="text-sm text-slate-500">
                            {getCompletedTasksCount(level)}/{level.tasks.length} tasks
                          </div>
                        </div>
                        {level.id === selectedGoal.currentLevel && (
                          <Badge variant="outline" className="border-indigo-300 text-indigo-600">
                            Current
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard (Main View)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex-1" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="h-10 w-10 text-indigo-500" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Goal Leveling
                </h1>
              </div>
              <p className="text-slate-600 text-xl">Level up your life, one goal at a time</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <p className="text-slate-500">Welcome, {session?.user?.name || session?.user?.email}!</p>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Goals Grid or Empty State */}
        {goals.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto space-y-8">
              <div className="relative">
                <div className="text-8xl mb-6 drop-shadow-sm">🎯</div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 blur-3xl rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold text-slate-700">Ready to Level Up?</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Create your first goal and start your journey towards becoming the best version of yourself. Every
                expert was once a beginner!
              </p>
              <Button
                onClick={() => setCurrentView("goal-management")}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl px-8 py-4 text-lg"
              >
                <Plus className="h-6 w-6 mr-3" />
                Create Your First Goal
              </Button>
            </div>
          </div>
        ) : (
          // Goals Grid
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-700">Your Goals</h2>
              <Button
                onClick={() => setCurrentView("goal-management")}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                Manage Goals
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {goals.map((goal) => {
                const progress = getOverallProgress(goal)
                const currentLevelData = goal.levels.find((l) => l.id === goal.currentLevel)

                return (
                  <Card
                    key={goal.id}
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm overflow-hidden group"
                    onClick={() => {
                      setSelectedGoal(goal)
                      setCurrentView("goal-tracking")
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                          {goal.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {goal.title}
                          </CardTitle>
                          <CardDescription className="text-slate-500 mt-1">{goal.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="font-bold text-slate-700">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-slate-100" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-semibold text-slate-700">Level {goal.currentLevel}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full">
                          <Star className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-semibold text-slate-700">{goal.totalXP} XP</span>
                        </div>
                      </div>

                      <div className="text-sm text-slate-500">
                        <span className="font-medium">Current:</span> {currentLevelData?.title}
                      </div>

                      <Badge variant="outline" className="w-fit border-indigo-200 text-indigo-600">
                        {goal.category}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Add New Goal Card */}
              <Card
                className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-dashed border-indigo-200 bg-white/60 backdrop-blur-sm group"
                onClick={() => setCurrentView("goal-management")}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-8">
                  <div className="relative mb-6">
                    <Plus className="h-16 w-16 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
                    <div className="absolute inset-0 bg-indigo-400 opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                    Add New Goal
                  </h3>
                  <p className="text-slate-500 mt-3">Create another goal to track your progress</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <GoalTracker />
    </AuthProvider>
  )
}
