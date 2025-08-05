"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface GoalManagerProps {
  isOpen: boolean
  onClose: () => void
  goals: Goal[]
  onUpdateGoals: (goals: Goal[]) => void
}

const goalIcons = ["🏃‍♂️", "🤖", "💼", "📚", "🎨", "💪", "🧠", "🎯", "🚀", "⭐", "🏆", "💡"]
const categories = [
  "Health & Fitness",
  "Career & Skills",
  "Personal Development",
  "Education",
  "Creative",
  "Finance",
  "Relationships",
  "Hobbies",
]

export function GoalManager({ isOpen, onClose, goals, onUpdateGoals }: GoalManagerProps) {
  const [activeTab, setActiveTab] = useState<"goals" | "levels" | "tasks">("goals")
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    icon: "🎯",
    category: "Personal Development",
  })

  const addGoal = () => {
    if (!newGoal.title.trim()) return

    const newGoalData: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      icon: newGoal.icon,
      category: newGoal.category,
      levels: [
        {
          id: 1,
          title: "Getting Started",
          description: "Begin your journey",
          tasks: [],
          reward: "🎉 Level 1 Complete!",
          completed: false,
          unlocked: true,
        },
      ],
      currentLevel: 1,
      totalXP: 0,
      createdAt: new Date(),
    }

    onUpdateGoals([...goals, newGoalData])
    setNewGoal({ title: "", description: "", icon: "🎯", category: "Personal Development" })
  }

  const updateGoal = () => {
    if (!editingGoal || !editingGoal.title.trim()) return

    onUpdateGoals(goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal)))
    setEditingGoal(null)
  }

  const deleteGoal = (goalId: string) => {
    onUpdateGoals(goals.filter((goal) => goal.id !== goalId))
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Your Goals</DialogTitle>
          <DialogDescription>Create and customize your goals, levels, and tasks</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button variant={activeTab === "goals" ? "default" : "outline"} onClick={() => setActiveTab("goals")}>
              Manage Goals
            </Button>
            <Button
              variant={activeTab === "levels" ? "default" : "outline"}
              onClick={() => setActiveTab("levels")}
              disabled={!selectedGoal}
            >
              Manage Levels
            </Button>
            <Button
              variant={activeTab === "tasks" ? "default" : "outline"}
              onClick={() => setActiveTab("tasks")}
              disabled={!selectedGoal}
            >
              Manage Tasks
            </Button>
          </div>

          {activeTab === "goals" && (
            <div className="space-y-6">
              {/* Add New Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input
                        id="goal-title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        placeholder="e.g., Weight Loss Journey"
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
                      placeholder="Describe your goal..."
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
                  <Button onClick={addGoal} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Goals</h3>
                {goals.map((goal) => (
                  <Card key={goal.id} className={selectedGoal?.id === goal.id ? "border-2 border-blue-300" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{goal.icon}</div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {goal.title}
                              <Badge variant="outline">{goal.category}</Badge>
                            </CardTitle>
                            <CardDescription>{goal.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={selectedGoal?.id === goal.id ? "default" : "outline"}
                            onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
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
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Edit Goal */}
              {editingGoal && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle>Edit Goal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Goal Title</Label>
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
            </div>
          )}

          {selectedGoal && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <p className="text-sm text-blue-700">
                Selected Goal: <strong>{selectedGoal.title}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">Use the tabs above to manage levels and tasks for this goal</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
