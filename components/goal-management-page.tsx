"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  Trophy,
  Gift,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface GoalManagementPageProps {
  goals: Goal[]
  onGoalsUpdate: (goals: Goal[]) => void
  onBack: () => void
  userSession: UserSession
}

const goalIcons = [
  "🏃‍♂️",
  "🤖",
  "💼",
  "📚",
  "🎨",
  "💪",
  "🧠",
  "🎯",
  "🚀",
  "⭐",
  "🏆",
  "💡",
  "🎵",
  "🍎",
  "💰",
  "🏠",
  "🌱",
  "🎮",
  "📱",
  "✈️",
]
const categories = [
  "Health & Fitness",
  "Career & Skills",
  "Personal Development",
  "Education",
  "Creative",
  "Finance",
  "Relationships",
  "Hobbies",
  "Travel",
  "Technology",
]

export function GoalManagementPage({ goals, onGoalsUpdate, onBack, userSession }: GoalManagementPageProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [editingTask, setEditingTask] = useState<{ levelId: number; task: Task | null }>({ levelId: 0, task: null })

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    icon: "🎯",
    category: "Personal Development",
  })

  const [newLevel, setNewLevel] = useState({
    title: "",
    description: "",
    reward: "",
  })

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  })

  const [activeTab, setActiveTab] = useState("goals")
  const [error, setError] = useState("")

  // Goal CRUD Operations
  const createGoal = () => {
    if (!newGoal.title.trim()) {
      setError("Goal title is required")
      return
    }

    const goalData: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      icon: newGoal.icon,
      category: newGoal.category,
      levels: [],
      currentLevel: 1,
      totalXP: 0,
      createdAt: new Date(),
    }

    onGoalsUpdate([...goals, goalData])
    setNewGoal({ title: "", description: "", icon: "🎯", category: "Personal Development" })
    setSelectedGoal(goalData)
    setActiveTab("levels")
    setError("")
  }

  const updateGoal = () => {
    if (!editingGoal || !editingGoal.title.trim()) {
      setError("Goal title is required")
      return
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal)))
    setEditingGoal(null)
    setError("")
  }

  const deleteGoal = (goalId: string) => {
    onGoalsUpdate(goals.filter((goal) => goal.id !== goalId))
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(null)
    }
  }

  // Level CRUD Operations
  const createLevel = () => {
    if (!selectedGoal || !newLevel.title.trim()) {
      setError("Level title is required")
      return
    }

    const levelData: Level = {
      id: Math.max(...selectedGoal.levels.map((l) => l.id), 0) + 1,
      title: newLevel.title.trim(),
      description: newLevel.description.trim(),
      tasks: [],
      reward: newLevel.reward.trim() || "🎉 Level Complete!",
      completed: false,
      unlocked: selectedGoal.levels.length === 0,
    }

    const updatedGoal = {
      ...selectedGoal,
      levels: [...selectedGoal.levels, levelData],
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setNewLevel({ title: "", description: "", reward: "" })
    setError("")
  }

  const updateLevel = () => {
    if (!selectedGoal || !editingLevel || !editingLevel.title.trim()) {
      setError("Level title is required")
      return
    }

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) => (level.id === editingLevel.id ? editingLevel : level)),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setEditingLevel(null)
    setError("")
  }

  const deleteLevel = (levelId: number) => {
    if (!selectedGoal) return

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.filter((level) => level.id !== levelId),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
  }

  // Task CRUD Operations
  const createTask = (levelId: number) => {
    if (!selectedGoal || !newTask.title.trim()) {
      setError("Task title is required")
      return
    }

    const taskData: Task = {
      id: `${levelId}-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      completed: false,
    }

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) =>
        level.id === levelId ? { ...level, tasks: [...level.tasks, taskData] } : level,
      ),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setNewTask({ title: "", description: "" })
    setError("")
  }

  const updateTask = () => {
    if (!selectedGoal || !editingTask.task || !editingTask.task.title.trim()) {
      setError("Task title is required")
      return
    }

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) =>
        level.id === editingTask.levelId
          ? {
              ...level,
              tasks: level.tasks.map((task) => (task.id === editingTask.task!.id ? editingTask.task! : task)),
            }
          : level,
      ),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setEditingTask({ levelId: 0, task: null })
    setError("")
  }

  const deleteTask = (levelId: number, taskId: string) => {
    if (!selectedGoal) return

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) =>
        level.id === levelId ? { ...level, tasks: level.tasks.filter((task) => task.id !== taskId) } : level,
      ),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" onClick={onBack} className="border-indigo-200 hover:bg-indigo-50 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-8 w-8 text-indigo-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Goal Management
                </h1>
              </div>
              <p className="text-slate-600 text-lg">Create and manage your goals, levels, and rewards</p>
            </div>
          </div>
          <div className="text-slate-500">Welcome, {userSession.name}</div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="goals" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="levels"
              disabled={!selectedGoal}
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              Levels {selectedGoal && `(${selectedGoal.title})`}
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              disabled={!selectedGoal}
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              Tasks {selectedGoal && `(${selectedGoal.title})`}
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-8">
            {/* Create New Goal */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Plus className="h-6 w-6 text-indigo-500" />
                  Create New Goal
                </CardTitle>
                <CardDescription className="text-lg">Start by creating a goal that you want to achieve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="goal-title" className="text-base font-semibold">
                      Goal Title *
                    </Label>
                    <Input
                      id="goal-title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Learn Web Development"
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-category" className="text-base font-semibold">
                      Category
                    </Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                    >
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="goal-description" className="text-base font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="goal-description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Describe what you want to achieve..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold">Choose Icon</Label>
                  <div className="flex gap-3 flex-wrap mt-3">
                    {goalIcons.map((icon) => (
                      <Button
                        key={icon}
                        variant={newGoal.icon === icon ? "default" : "outline"}
                        size="lg"
                        onClick={() => setNewGoal({ ...newGoal, icon })}
                        className={newGoal.icon === icon ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                      >
                        <span className="text-2xl">{icon}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={createGoal}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-12 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>

            {/* Existing Goals */}
            {goals.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Goals</CardTitle>
                  <CardDescription className="text-lg">Manage your existing goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-6 border-2 border-slate-100 rounded-xl hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{goal.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-700">{goal.title}</h3>
                          <p className="text-slate-500 mt-1">{goal.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="border-indigo-200 text-indigo-600">
                              {goal.category}
                            </Badge>
                            <span className="text-sm text-slate-500">{goal.levels.length} levels</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="lg"
                          variant={selectedGoal?.id === goal.id ? "default" : "outline"}
                          onClick={() => {
                            setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)
                            if (selectedGoal?.id !== goal.id) {
                              setActiveTab("levels")
                            }
                          }}
                          className={selectedGoal?.id === goal.id ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                        >
                          {selectedGoal?.id === goal.id ? "Selected" : "Select"}
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => setEditingGoal({ ...goal })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Edit Goal */}
            {editingGoal && (
              <Card className="border-2 border-indigo-200 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Edit Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-semibold">Goal Title *</Label>
                      <Input
                        value={editingGoal.title}
                        onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Category</Label>
                      <Select
                        value={editingGoal.category}
                        onValueChange={(value) => setEditingGoal({ ...editingGoal, category: value })}
                      >
                        <SelectTrigger className="mt-2 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Description</Label>
                    <Textarea
                      value={editingGoal.description}
                      onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Icon</Label>
                    <div className="flex gap-3 flex-wrap mt-3">
                      {goalIcons.map((icon) => (
                        <Button
                          key={icon}
                          variant={editingGoal.icon === icon ? "default" : "outline"}
                          size="lg"
                          onClick={() => setEditingGoal({ ...editingGoal, icon })}
                          className={editingGoal.icon === icon ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                        >
                          <span className="text-2xl">{icon}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={updateGoal}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingGoal(null)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="levels" className="space-y-8">
            {selectedGoal && (
              <>
                <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Target className="h-6 w-6 text-indigo-500" />
                      Managing Levels for: {selectedGoal.icon} {selectedGoal.title}
                    </CardTitle>
                    <CardDescription className="text-lg">{selectedGoal.description}</CardDescription>
                  </CardHeader>
                </Card>
                {/* Level management content with improved styling */}

                {/* Create New Level */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Plus className="h-6 w-6 text-indigo-500" />
                      Add New Level
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Create a level with specific milestones and rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="level-title" className="text-base font-semibold">
                          Level Title *
                        </Label>
                        <Input
                          id="level-title"
                          value={newLevel.title}
                          onChange={(e) => setNewLevel({ ...newLevel, title: e.target.value })}
                          placeholder="e.g., Foundation Building"
                          className="mt-2 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="level-reward" className="text-base font-semibold">
                          Completion Reward
                        </Label>
                        <Input
                          id="level-reward"
                          value={newLevel.reward}
                          onChange={(e) => setNewLevel({ ...newLevel, reward: e.target.value })}
                          placeholder="e.g., 🎯 Unlock Next Level + Bonus Resources"
                          className="mt-2 h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="level-description" className="text-base font-semibold">
                        Description
                      </Label>
                      <Textarea
                        id="level-description"
                        value={newLevel.description}
                        onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                        placeholder="Describe what this level focuses on..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>
                    <Button
                      onClick={createLevel}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-12 text-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Level
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Levels */}
                {selectedGoal.levels.length > 0 && (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">Levels for {selectedGoal.title}</CardTitle>
                      <CardDescription className="text-lg">Manage the levels and their rewards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {selectedGoal.levels.map((level) => (
                        <div
                          key={level.id}
                          className="p-6 border-2 border-slate-100 rounded-xl hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                <h3 className="font-bold text-lg text-slate-700">
                                  Level {level.id}: {level.title}
                                </h3>
                                <Badge
                                  variant={level.unlocked ? "default" : "secondary"}
                                  className={
                                    level.unlocked
                                      ? "bg-indigo-500 text-white border-none"
                                      : "border-slate-200 text-slate-500"
                                  }
                                >
                                  {level.unlocked ? "Unlocked" : "Locked"}
                                </Badge>
                              </div>
                              <p className="text-slate-500 mt-1">{level.description}</p>
                              <div className="flex items-center gap-3 text-sm mt-2">
                                <Gift className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-slate-600">Reward:</span>
                                <span className="text-slate-500">{level.reward}</span>
                              </div>
                              <div className="text-sm text-slate-500 mt-2">
                                {level.tasks.length === 0 ? "Manual completion" : `${level.tasks.length} tasks`}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button size="lg" variant="outline" onClick={() => setEditingLevel({ ...level })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="lg" variant="outline" onClick={() => deleteLevel(level.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Edit Level */}
                {editingLevel && (
                  <Card className="border-2 border-indigo-200 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">Edit Level {editingLevel.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-base font-semibold">Level Title *</Label>
                          <Input
                            value={editingLevel.title}
                            onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })}
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-base font-semibold">Completion Reward</Label>
                          <Input
                            value={editingLevel.reward}
                            onChange={(e) => setEditingLevel({ ...editingLevel, reward: e.target.value })}
                            className="mt-2 h-12"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-base font-semibold">Description</Label>
                        <Textarea
                          value={editingLevel.description}
                          onChange={(e) => setEditingLevel({ ...editingLevel, description: e.target.value })}
                          className="mt-2 min-h-[100px]"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={updateLevel}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingLevel(null)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-8">
            {selectedGoal && (
              <>
                <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <CheckCircle2 className="h-6 w-6 text-indigo-500" />
                      Managing Tasks for: {selectedGoal.icon} {selectedGoal.title}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Add specific tasks to each level. Tasks are optional - levels without tasks can be completed
                      manually.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Add info card about optional tasks */}
                <Card className="border-blue-200 bg-blue-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900 text-lg mb-2">Tasks are Optional!</h3>
                        <p className="text-blue-800 leading-relaxed">
                          You can create levels without any tasks. These levels can be marked as complete manually when
                          you achieve your goal. This is perfect for subjective goals like "Feel more confident" or
                          milestone-based achievements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedGoal.levels.length === 0 ? (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-12">
                      <Trophy className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-700 mb-2">No Levels Yet</h3>
                      <p className="text-slate-500 text-lg mb-6">
                        You need to create levels first before adding tasks.
                      </p>
                      <Button
                        onClick={() => setActiveTab("levels")}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-12 text-lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Levels First
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  selectedGoal.levels.map((level) => (
                    <Card key={level.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          Level {level.id}: {level.title}
                        </CardTitle>
                        <CardDescription className="text-lg">{level.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Add New Task */}
                        <div className="p-6 border-2 border-slate-100 rounded-xl bg-slate-50/50">
                          <h4 className="font-bold text-lg text-slate-700 mb-4">Add New Task</h4>
                          <div className="space-y-4">
                            <Input
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                              placeholder="Task title..."
                              className="h-12"
                            />
                            <Textarea
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              placeholder="Task description..."
                              className="min-h-[80px]"
                            />
                            <Button
                              onClick={() => createTask(level.id)}
                              size="lg"
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-12 text-lg"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Add Task
                            </Button>
                          </div>
                        </div>

                        {/* Existing Tasks */}
                        <div className="space-y-4 mt-6">
                          {level.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-5 border-2 border-slate-100 rounded-xl"
                            >
                              <div className="flex-1">
                                <h5 className="font-bold text-slate-700">{task.title}</h5>
                                <p className="text-slate-500 mt-1">{task.description}</p>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  onClick={() => setEditingTask({ levelId: level.id, task: { ...task } })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => deleteTask(level.id, task.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Edit Task */}
                        {editingTask.task && editingTask.levelId === level.id && (
                          <div className="p-6 border-2 border-indigo-200 rounded-xl bg-indigo-50/30 mt-6">
                            <h4 className="font-bold text-lg text-slate-700 mb-4">Edit Task</h4>
                            <div className="space-y-4">
                              <Input
                                value={editingTask.task.title}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    task: { ...editingTask.task!, title: e.target.value },
                                  })
                                }
                                className="h-12"
                              />
                              <Textarea
                                value={editingTask.task.description}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    task: { ...editingTask.task!, description: e.target.value },
                                  })
                                }
                                className="min-h-[80px]"
                              />
                              <div className="flex gap-3">
                                <Button
                                  onClick={updateTask}
                                  size="lg"
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingTask({ levelId: 0, task: null })}
                                  size="lg"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
