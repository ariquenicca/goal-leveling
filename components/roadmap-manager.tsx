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

interface Goal {
  id: string
  title: string
  description: string
  completed: boolean
}

interface Level {
  id: number
  title: string
  description: string
  goals: Goal[]
  reward: string
  completed: boolean
  unlocked: boolean
}

interface RoadmapManagerProps {
  isOpen: boolean
  onClose: () => void
  levels: Level[]
  onUpdateLevels: (levels: Level[]) => void
}

export function RoadmapManager({ isOpen, onClose, levels, onUpdateLevels }: RoadmapManagerProps) {
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [editingGoal, setEditingGoal] = useState<{ levelId: number; goal: Goal | null }>({ levelId: 0, goal: null })
  const [newLevel, setNewLevel] = useState({ title: "", description: "", reward: "" })
  const [newGoal, setNewGoal] = useState({ title: "", description: "" })
  const [activeTab, setActiveTab] = useState<"levels" | "goals">("levels")

  const addLevel = () => {
    if (!newLevel.title.trim()) return

    const newLevelData: Level = {
      id: Math.max(...levels.map((l) => l.id), 0) + 1,
      title: newLevel.title,
      description: newLevel.description,
      goals: [],
      reward: newLevel.reward || "🎉 Level Complete!",
      completed: false,
      unlocked: levels.length === 0 ? true : false,
    }

    onUpdateLevels([...levels, newLevelData])
    setNewLevel({ title: "", description: "", reward: "" })
  }

  const updateLevel = () => {
    if (!editingLevel || !editingLevel.title.trim()) return

    onUpdateLevels(levels.map((level) => (level.id === editingLevel.id ? editingLevel : level)))
    setEditingLevel(null)
  }

  const deleteLevel = (levelId: number) => {
    onUpdateLevels(levels.filter((level) => level.id !== levelId))
  }

  const addGoal = (levelId: number) => {
    if (!newGoal.title.trim()) return

    const newGoalData: Goal = {
      id: `${levelId}-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      completed: false,
    }

    onUpdateLevels(
      levels.map((level) => (level.id === levelId ? { ...level, goals: [...level.goals, newGoalData] } : level)),
    )
    setNewGoal({ title: "", description: "" })
  }

  const updateGoal = () => {
    if (!editingGoal.goal || !editingGoal.goal.title.trim()) return

    onUpdateLevels(
      levels.map((level) =>
        level.id === editingGoal.levelId
          ? {
              ...level,
              goals: level.goals.map((goal) => (goal.id === editingGoal.goal!.id ? editingGoal.goal! : goal)),
            }
          : level,
      ),
    )
    setEditingGoal({ levelId: 0, goal: null })
  }

  const deleteGoal = (levelId: number, goalId: string) => {
    onUpdateLevels(
      levels.map((level) =>
        level.id === levelId ? { ...level, goals: level.goals.filter((goal) => goal.id !== goalId) } : level,
      ),
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Your Roadmap</DialogTitle>
          <DialogDescription>Create and customize your levels, goals, and rewards</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button variant={activeTab === "levels" ? "default" : "outline"} onClick={() => setActiveTab("levels")}>
              Manage Levels
            </Button>
            <Button variant={activeTab === "goals" ? "default" : "outline"} onClick={() => setActiveTab("goals")}>
              Manage Goals
            </Button>
          </div>

          {activeTab === "levels" && (
            <div className="space-y-6">
              {/* Add New Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level-title">Level Title</Label>
                      <Input
                        id="level-title"
                        value={newLevel.title}
                        onChange={(e) => setNewLevel({ ...newLevel, title: e.target.value })}
                        placeholder="e.g., Getting Started"
                      />
                    </div>
                    <div>
                      <Label htmlFor="level-reward">Reward</Label>
                      <Input
                        id="level-reward"
                        value={newLevel.reward}
                        onChange={(e) => setNewLevel({ ...newLevel, reward: e.target.value })}
                        placeholder="e.g., 🎯 Unlock Next Level + Bonus"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="level-description">Description</Label>
                    <Textarea
                      id="level-description"
                      value={newLevel.description}
                      onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                      placeholder="Describe what this level is about..."
                    />
                  </div>
                  <Button onClick={addLevel} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Level
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Levels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Levels</h3>
                {levels.map((level) => (
                  <Card key={level.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Level {level.id}: {level.title}
                            <Badge variant={level.completed ? "default" : "secondary"}>
                              {level.goals.length} goals
                            </Badge>
                          </CardTitle>
                          <CardDescription>{level.description}</CardDescription>
                          <p className="text-sm text-muted-foreground mt-1">Reward: {level.reward}</p>
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
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Edit Level Dialog */}
              {editingLevel && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle>Edit Level {editingLevel.id}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Level Title</Label>
                        <Input
                          value={editingLevel.title}
                          onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Reward</Label>
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
            </div>
          )}

          {activeTab === "goals" && (
            <div className="space-y-6">
              {levels.map((level) => (
                <Card key={level.id}>
                  <CardHeader>
                    <CardTitle>
                      Level {level.id}: {level.title}
                    </CardTitle>
                    <CardDescription>Manage goals for this level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add New Goal */}
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-medium mb-3">Add New Goal</h4>
                      <div className="space-y-3">
                        <Input
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="Goal title..."
                        />
                        <Textarea
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          placeholder="Goal description..."
                        />
                        <Button onClick={() => addGoal(level.id)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Goal
                        </Button>
                      </div>
                    </div>

                    {/* Existing Goals */}
                    <div className="space-y-2">
                      {level.goals.map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h5 className="font-medium">{goal.title}</h5>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGoal({ levelId: level.id, goal: { ...goal } })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteGoal(level.id, goal.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Edit Goal */}
                    {editingGoal.goal && editingGoal.levelId === level.id && (
                      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h4 className="font-medium mb-3">Edit Goal</h4>
                        <div className="space-y-3">
                          <Input
                            value={editingGoal.goal.title}
                            onChange={(e) =>
                              setEditingGoal({
                                ...editingGoal,
                                goal: { ...editingGoal.goal!, title: e.target.value },
                              })
                            }
                          />
                          <Textarea
                            value={editingGoal.goal.description}
                            onChange={(e) =>
                              setEditingGoal({
                                ...editingGoal,
                                goal: { ...editingGoal.goal!, description: e.target.value },
                              })
                            }
                          />
                          <div className="flex gap-2">
                            <Button onClick={updateGoal} size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingGoal({ levelId: 0, goal: null })}
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
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
