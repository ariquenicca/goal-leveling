"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trophy, Star, Target, Gift, CheckCircle2, Plus, ArrowLeft, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleAuth } from "@/components/simple-auth"
import { GoalManagementPage } from "@/components/goal-management-page"

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

interface UserSession {
  name: string
  email: string
  isAuthenticated: boolean
}

type AppView = "dashboard" | "goal-management" | "goal-tracking"

function GoalTracker() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [currentView, setCurrentView] = useState<AppView>("dashboard")
  const [isLoading, setIsLoading] = useState(true)

  // Load user data when session changes
  useEffect(() => {
    const savedSession = localStorage.getItem("goalquest_session")
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        setSession(parsedSession)
        loadUserData(parsedSession.email)
      } catch (error) {
        console.error("Error loading session:", error)
        localStorage.removeItem("goalquest_session")
      }
    }
    setIsLoading(false)
  }, [])

  const loadUserData = (userEmail: string) => {
    try {
      const savedData = localStorage.getItem(`goalquest_${userEmail}`)
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
      localStorage.setItem(`goalquest_${userEmail}`, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }

  const handleLogin = (userData: { name: string; email: string }) => {
    const newSession: UserSession = {
      ...userData,
      isAuthenticated: true,
    }
    setSession(newSession)
    localStorage.setItem("goalquest_session", JSON.stringify(newSession))
    loadUserData(userData.email)
  }

  const handleLogout = () => {
    setSession(null)
    setSelectedGoal(null)
    setCurrentView("dashboard")
    localStorage.removeItem("goalquest_session")
    setGoals([])
  }

  const handleGoalsUpdate = (newGoals: Goal[]) => {
    setGoals(newGoals)
    if (session?.email) {
      saveUserData(session.email, { goals: newGoals })
    }
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

              const allTasksCompleted = updatedTasks.every((task) => task.completed)
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
      if (session?.email) {
        saveUserData(session.email, { goals: newGoals })
      }

      return newGoals
    })
  }

  const getCompletedTasksCount = (level: Level) => level.tasks.filter((t) => t.completed).length
  const getTotalTasksCount = (goal: Goal) => goal.levels.reduce((total, level) => total + level.tasks.length, 0)
  const getCompletedTotalTasks = (goal: Goal) =>
    goal.levels.reduce((total, level) => total + getCompletedTasksCount(level), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-muted-foreground">Loading Goal Quest...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session?.isAuthenticated) {
    return <SimpleAuth onLogin={handleLogin} />
  }

  // Goal Management Page
  if (currentView === "goal-management") {
    return (
      <GoalManagementPage
        goals={goals}
        onGoalsUpdate={handleGoalsUpdate}
        onBack={() => setCurrentView("dashboard")}
        userSession={session}
      />
    )
  }

  // Goal Tracking Page
  if (currentView === "goal-tracking" && selectedGoal) {
    const currentLevelData = selectedGoal.levels.find((l) => l.id === selectedGoal.currentLevel)
    const overallProgress =
      getTotalTasksCount(selectedGoal) > 0
        ? (getCompletedTotalTasks(selectedGoal) / getTotalTasksCount(selectedGoal)) * 100
        : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="text-3xl">{selectedGoal.icon}</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {selectedGoal.title}
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">{selectedGoal.description}</p>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Level {selectedGoal.currentLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">{selectedGoal.totalXP} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">
                  {getCompletedTotalTasks(selectedGoal)}/{getTotalTasksCount(selectedGoal)} Tasks
                </span>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current Level Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        Level {currentLevelData?.id}: {currentLevelData?.title}
                      </CardTitle>
                      <CardDescription className="text-purple-100">{currentLevelData?.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {currentLevelData ? getCompletedTasksCount(currentLevelData) : 0}/
                      {currentLevelData?.tasks.length || 0} Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {currentLevelData?.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(selectedGoal.id, currentLevelData.id, task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        {task.completed && <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />}
                      </div>
                    ))}
                  </div>

                  {currentLevelData?.completed && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <Trophy className="h-5 w-5" />
                        <span className="font-semibold">Level Complete!</span>
                      </div>
                      <p className="text-green-600 mt-1">Congratulations! You've unlocked the next level.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Reward */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-orange-500" />
                    Next Reward
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border">
                    <div className="text-2xl mb-2">{currentLevelData?.reward.split(" ")[0]}</div>
                    <p className="text-sm font-medium">{currentLevelData?.reward.substring(2)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Level Roadmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Roadmap</CardTitle>
                  <CardDescription>Your journey progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedGoal.levels.map((level) => (
                      <div key={level.id} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            level.completed
                              ? "bg-green-500 text-white"
                              : level.id === selectedGoal.currentLevel
                                ? "bg-purple-500 text-white"
                                : level.unlocked
                                  ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
                                  : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {level.completed ? <CheckCircle2 className="h-4 w-4" /> : level.id}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${
                              level.unlocked ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {level.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getCompletedTasksCount(level)}/{level.tasks.length} tasks
                          </div>
                        </div>
                        {level.id === selectedGoal.currentLevel && (
                          <Badge variant="outline" className="text-xs">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1" />
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Goal Quest
              </h1>
              <p className="text-muted-foreground text-lg">Level up your life, one goal at a time</p>
              <p className="text-sm text-muted-foreground">Welcome, {session.name}!</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Goals Grid or Empty State */}
        {goals.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-muted-foreground">No Goals Yet</h2>
              <p className="text-muted-foreground">
                Ready to start your journey? Create your first goal and begin leveling up your life!
              </p>
              <Button
                onClick={() => setCurrentView("goal-management")}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          </div>
        ) : (
          // Goals Grid
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Goals</h2>
              <Button
                onClick={() => setCurrentView("goal-management")}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Goals
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress =
                  getTotalTasksCount(goal) > 0 ? (getCompletedTotalTasks(goal) / getTotalTasksCount(goal)) * 100 : 0
                const currentLevelData = goal.levels.find((l) => l.id === goal.currentLevel)

                return (
                  <Card
                    key={goal.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      setSelectedGoal(goal)
                      setCurrentView("goal-tracking")
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{goal.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Level {goal.currentLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{goal.totalXP} XP</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">Current: {currentLevelData?.title}</div>

                      <Badge variant="outline" className="w-fit">
                        {goal.category}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Add New Goal Card */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-dashed border-2"
                onClick={() => setCurrentView("goal-management")}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Add New Goal</h3>
                  <p className="text-sm text-muted-foreground mt-2">Create another goal to track</p>
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
  return <GoalTracker />
}
