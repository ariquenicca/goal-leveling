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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  List,
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
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editingLevelId, setEditingLevelId] = useState<number | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())

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

  const [newTask, setNewTask] = useState<{ [levelId: number]: { title: string; description: string } }>({})

  const [activeTab, setActiveTab] = useState("goals")
  const [error, setError] = useState("")

  // Helper functions
  const toggleLevelExpansion = (levelId: number) => {
    const newExpanded = new Set(expandedLevels)
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId)
    } else {
      newExpanded.add(levelId)
    }
    setExpandedLevels(newExpanded)
  }

  const getNewTaskForLevel = (levelId: number) => {
    return newTask[levelId] || { title: "", description: "" }
  }

  const setNewTaskForLevel = (levelId: number, task: { title: string; description: string }) => {
    setNewTask({ ...newTask, [levelId]: task })
  }

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

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    onGoalsUpdate(goals.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)))
    setEditingGoalId(null)
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
    setExpandedLevels(new Set([...expandedLevels, levelData.id]))
    setError("")
  }

  const updateLevel = (levelId: number, updates: Partial<Level>) => {
    if (!selectedGoal) return

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) => (level.id === levelId ? { ...level, ...updates } : level)),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setEditingLevelId(null)
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
    if (!selectedGoal) return

    const taskData = getNewTaskForLevel(levelId)
    if (!taskData.title.trim()) {
      setError("Task title is required")
      return
    }

    const newTaskData: Task = {
      id: `${levelId}-${Date.now()}`,
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      completed: false,
    }

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) =>
        level.id === levelId ? { ...level, tasks: [...level.tasks, newTaskData] } : level,
      ),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setNewTaskForLevel(levelId, { title: "", description: "" })
    setError("")
  }

  const updateTask = (levelId: number, taskId: string, updates: Partial<Task>) => {
    if (!selectedGoal) return

    const updatedGoal = {
      ...selectedGoal,
      levels: selectedGoal.levels.map((level) =>
        level.id === levelId
          ? {
              ...level,
              tasks: level.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
            }
          : level,
      ),
    }

    onGoalsUpdate(goals.map((goal) => (goal.id === selectedGoal.id ? updatedGoal : goal)))
    setSelectedGoal(updatedGoal)
    setEditingTaskId(null)
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
              <p className="text-slate-600 text-lg">Create and manage your goals, levels, and tasks</p>
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
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="goals" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="levels"
              disabled={!selectedGoal}
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              Levels & Tasks {selectedGoal && `(${selectedGoal.title})`}
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
                      className="p-6 border-2 border-slate-100 rounded-xl hover:border-indigo-200 transition-colors"
                    >
                      {editingGoalId === goal.id ? (
                        // Inline Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              value={goal.title}
                              onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
                              className="h-12 font-semibold text-lg"
                              placeholder="Goal title"
                            />
                            <Select
                              value={goal.category}
                              onValueChange={(value) => updateGoal(goal.id, { category: value })}
                            >
                              <SelectTrigger className="h-12">
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
                          <Textarea
                            value={goal.description}
                            onChange={(e) => updateGoal(goal.id, { description: e.target.value })}
                            className="min-h-[80px]"
                            placeholder="Goal description"
                          />
                          <div>
                            <div className="flex gap-2 flex-wrap">
                              {goalIcons.map((icon) => (
                                <Button
                                  key={icon}
                                  variant={goal.icon === icon ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateGoal(goal.id, { icon })}
                                  className={goal.icon === icon ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                                >
                                  <span className="text-lg">{icon}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => setEditingGoalId(null)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" onClick={() => setEditingGoalId(null)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="flex items-center justify-between">
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
                            <Button size="lg" variant="outline" onClick={() => setEditingGoalId(goal.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => deleteGoal(goal.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Levels & Tasks Tab */}
          <TabsContent value="levels" className="space-y-8">
            {selectedGoal && (
              <>
                <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Target className="h-6 w-6 text-indigo-500" />
                      Managing: {selectedGoal.icon} {selectedGoal.title}
                    </CardTitle>
                    <CardDescription className="text-lg">{selectedGoal.description}</CardDescription>
                  </CardHeader>
                </Card>

                {/* Create New Level */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Plus className="h-6 w-6 text-indigo-500" />
                      Add New Level
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Create a level with optional tasks and rewards
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
                  <div className="space-y-6">
                    {selectedGoal.levels.map((level) => (
                      <Card key={level.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Collapsible
                                open={expandedLevels.has(level.id)}
                                onOpenChange={() => toggleLevelExpansion(level.id)}
                              >
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-1">
                                    {expandedLevels.has(level.id) ? (
                                      <ChevronDown className="h-5 w-5" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </Collapsible>
                              <Trophy className="h-6 w-6 text-yellow-500" />
                              <div>
                                {editingLevelId === level.id ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Input
                                        value={level.title}
                                        onChange={(e) => updateLevel(level.id, { title: e.target.value })}
                                        className="h-10 font-semibold"
                                        placeholder="Level title"
                                      />
                                      <Input
                                        value={level.reward}
                                        onChange={(e) => updateLevel(level.id, { reward: e.target.value })}
                                        className="h-10"
                                        placeholder="Reward"
                                      />
                                    </div>
                                    <Textarea
                                      value={level.description}
                                      onChange={(e) => updateLevel(level.id, { description: e.target.value })}
                                      className="min-h-[60px]"
                                      placeholder="Description"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => setEditingLevelId(null)}
                                        size="sm"
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                      >
                                        <Save className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => setEditingLevelId(null)}>
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h3 className="font-bold text-xl text-slate-700">
                                      Level {level.id}: {level.title}
                                    </h3>
                                    <p className="text-slate-500 mt-1">{level.description}</p>
                                    <div className="flex items-center gap-3 mt-2">
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
                                      <div className="flex items-center gap-1 text-sm text-slate-500">
                                        <Gift className="h-4 w-4 text-orange-500" />
                                        <span>{level.reward}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {editingLevelId !== level.id && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingLevelId(level.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteLevel(level.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <Collapsible open={expandedLevels.has(level.id)}>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                  <List className="h-5 w-5 text-indigo-500" />
                                  <h4 className="font-semibold text-lg text-slate-700">Tasks ({level.tasks.length})</h4>
                                </div>

                                {/* Add New Task */}
                                <div className="mb-6 p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                  <div className="space-y-3">
                                    <Input
                                      value={getNewTaskForLevel(level.id).title}
                                      onChange={(e) =>
                                        setNewTaskForLevel(level.id, {
                                          ...getNewTaskForLevel(level.id),
                                          title: e.target.value,
                                        })
                                      }
                                      placeholder="Add a new task..."
                                      className="h-10"
                                    />
                                    <Textarea
                                      value={getNewTaskForLevel(level.id).description}
                                      onChange={(e) =>
                                        setNewTaskForLevel(level.id, {
                                          ...getNewTaskForLevel(level.id),
                                          description: e.target.value,
                                        })
                                      }
                                      placeholder="Task description (optional)..."
                                      className="min-h-[60px]"
                                    />
                                    <Button
                                      onClick={() => createTask(level.id)}
                                      size="sm"
                                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Task
                                    </Button>
                                  </div>
                                </div>

                                {/* Existing Tasks */}
                                <div className="space-y-3">
                                  {level.tasks.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                      <div className="text-4xl mb-3">📝</div>
                                      <p className="text-sm">
                                        No tasks yet. This level can be completed manually or add tasks above.
                                      </p>
                                    </div>
                                  ) : (
                                    level.tasks.map((task) => (
                                      <div
                                        key={task.id}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors"
                                      >
                                        {editingTaskId === task.id ? (
                                          <div className="flex-1 space-y-2">
                                            <Input
                                              value={task.title}
                                              onChange={(e) => updateTask(level.id, task.id, { title: e.target.value })}
                                              className="h-9 font-medium"
                                              placeholder="Task title"
                                            />
                                            <Textarea
                                              value={task.description}
                                              onChange={(e) =>
                                                updateTask(level.id, task.id, { description: e.target.value })
                                              }
                                              className="min-h-[50px]"
                                              placeholder="Task description"
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                onClick={() => setEditingTaskId(null)}
                                                size="sm"
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                              >
                                                <Save className="h-3 w-3 mr-1" />
                                                Save
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingTaskId(null)}
                                              >
                                                <X className="h-3 w-3 mr-1" />
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-slate-700">{task.title}</h5>
                                              {task.description && (
                                                <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingTaskId(task.id)}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deleteTask(level.id, task.id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
