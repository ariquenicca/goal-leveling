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
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Target, Trophy, Gift, CheckCircle2, AlertCircle } from "lucide-react"
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

const goalIcons = ["🏃‍♂️", "🤖", "💼", "📚", "🎨", "💪", "🧠", "🎯", "🚀", "⭐", "🏆", "💡", "🎵", "🍎", "💰", "🏠"]
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Goal Management
              </h1>
              <p className="text-muted-foreground">Create and manage your goals, levels, and rewards</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Welcome, {userSession.name}</div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="levels" disabled={!selectedGoal}>
              Levels {selectedGoal && `(${selectedGoal.title})`}
            </TabsTrigger>
            <TabsTrigger value="tasks" disabled={!selectedGoal}>
              Tasks {selectedGoal && `(${selectedGoal.title})`}
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {/* Create New Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Goal
                </CardTitle>
                <CardDescription>Start by creating a goal that you want to achieve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-title">Goal Title *</Label>
                    <Input
                      id="goal-title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Learn Web Development"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                    >
                      <SelectTrigger>
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
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Describe what you want to achieve..."
                  />
                </div>
                <div>
                  <Label>Choose Icon</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {goalIcons.map((icon) => (
                      <Button
                        key={icon}
                        variant={newGoal.icon === icon ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewGoal({ ...newGoal, icon })}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={createGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>

            {/* Existing Goals */}
            {goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Goals</CardTitle>
                  <CardDescription>Manage your existing goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{goal.icon}</div>
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{goal.category}</Badge>
                            <span className="text-xs text-muted-foreground">{goal.levels.length} levels</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={selectedGoal?.id === goal.id ? "default" : "outline"}
                          onClick={() => {
                            setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)
                            if (selectedGoal?.id !== goal.id) {
                              setActiveTab("levels")
                            }
                          }}
                        >
                          {selectedGoal?.id === goal.id ? "Selected" : "Select"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingGoal({ ...goal })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteGoal(goal.id)}>
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
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle>Edit Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Goal Title *</Label>
                      <Input
                        value={editingGoal.title}
                        onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={editingGoal.category}
                        onValueChange={(value) => setEditingGoal({ ...editingGoal, category: value })}
                      >
                        <SelectTrigger>
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
                    <Label>Description</Label>
                    <Textarea
                      value={editingGoal.description}
                      onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {goalIcons.map((icon) => (
                        <Button
                          key={icon}
                          variant={editingGoal.icon === icon ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditingGoal({ ...editingGoal, icon })}
                        >
                          {icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={updateGoal}>
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

          {/* Levels Tab */}
          <TabsContent value="levels" className="space-y-6">
            {selectedGoal && (
              <>
                {/* Selected Goal Info */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Managing Levels for: {selectedGoal.icon} {selectedGoal.title}
                    </CardTitle>
                    <CardDescription>{selectedGoal.description}</CardDescription>
                  </CardHeader>
                </Card>

                {/* Create New Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add New Level
                    </CardTitle>
                    <CardDescription>Create a level with specific milestones and rewards</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="level-title">Level Title *</Label>
                        <Input
                          id="level-title"
                          value={newLevel.title}
                          onChange={(e) => setNewLevel({ ...newLevel, title: e.target.value })}
                          placeholder="e.g., Foundation Building"
                        />
                      </div>
                      <div>
                        <Label htmlFor="level-reward">Completion Reward</Label>
                        <Input
                          id="level-reward"
                          value={newLevel.reward}
                          onChange={(e) => setNewLevel({ ...newLevel, reward: e.target.value })}
                          placeholder="e.g., 🎯 Unlock Next Level + Bonus Resources"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="level-description">Description</Label>
                      <Textarea
                        id="level-description"
                        value={newLevel.description}
                        onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                        placeholder="Describe what this level focuses on..."
                      />
                    </div>
                    <Button onClick={createLevel} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Level
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Levels */}
                {selectedGoal.levels.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Levels for {selectedGoal.title}</CardTitle>
                      <CardDescription>Manage the levels and their rewards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedGoal.levels.map((level) => (
                        <div key={level.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <h3 className="font-semibold">
                                  Level {level.id}: {level.title}
                                </h3>
                                <Badge variant={level.unlocked ? "default" : "secondary"}>
                                  {level.unlocked ? "Unlocked" : "Locked"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <Gift className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">Reward:</span>
                                <span>{level.reward}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{level.tasks.length} tasks</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingLevel({ ...level })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteLevel(level.id)}>
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
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle>Edit Level {editingLevel.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Level Title *</Label>
                          <Input
                            value={editingLevel.title}
                            onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Completion Reward</Label>
                          <Input
                            value={editingLevel.reward}
                            onChange={(e) => setEditingLevel({ ...editingLevel, reward: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingLevel.description}
                          onChange={(e) => setEditingLevel({ ...editingLevel, description: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={updateLevel}>
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

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {selectedGoal && (
              <>
                {/* Selected Goal Info */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Managing Tasks for: {selectedGoal.icon} {selectedGoal.title}
                    </CardTitle>
                    <CardDescription>Add specific tasks to each level</CardDescription>
                  </CardHeader>
                </Card>

                {selectedGoal.levels.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Levels Yet</h3>
                      <p className="text-muted-foreground mb-4">You need to create levels first before adding tasks.</p>
                      <Button onClick={() => setActiveTab("levels")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Levels First
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  selectedGoal.levels.map((level) => (
                    <Card key={level.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          Level {level.id}: {level.title}
                        </CardTitle>
                        <CardDescription>{level.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Add New Task */}
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <h4 className="font-medium mb-3">Add New Task</h4>
                          <div className="space-y-3">
                            <Input
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                              placeholder="Task title..."
                            />
                            <Textarea
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              placeholder="Task description..."
                            />
                            <Button onClick={() => createTask(level.id)} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Task
                            </Button>
                          </div>
                        </div>

                        {/* Existing Tasks */}
                        <div className="space-y-2">
                          {level.tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium">{task.title}</h5>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingTask({ levelId: level.id, task: { ...task } })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteTask(level.id, task.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Edit Task */}
                        {editingTask.task && editingTask.levelId === level.id && (
                          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                            <h4 className="font-medium mb-3">Edit Task</h4>
                            <div className="space-y-3">
                              <Input
                                value={editingTask.task.title}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    task: { ...editingTask.task!, title: e.target.value },
                                  })
                                }
                              />
                              <Textarea
                                value={editingTask.task.description}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    task: { ...editingTask.task!, description: e.target.value },
                                  })
                                }
                              />
                              <div className="flex gap-2">
                                <Button onClick={updateTask} size="sm">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingTask({ levelId: 0, task: null })}
                                  size="sm"
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
