"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Camera, CheckCircle2, Clock, WifiOff } from "lucide-react";


export default function TasksPage() {
  const tasks = useLiveQuery(() => db.tasks.toArray());
  const clusters = useLiveQuery(() => db.clusters.toArray());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  if (!tasks) return <div className="p-4">Loading tasks...</div>;

  const activeTask = tasks.find(t => t.id === selectedTask);
  const activeCluster = activeTask ? clusters?.find((c: any) => c.id === activeTask.cluster_id) : null;
  const syncQueue = tasks.filter(t => t.sync_status === 'PENDING');

  const handleComplete = async (taskId: string) => {
    await db.tasks.update(taskId, {
      status: 'COMPLETED',
      sync_status: 'PENDING'
    });
    setSelectedTask(null);
  };

  const handleSync = async () => {
    // Simulate sync to backend
    setTimeout(async () => {
      for (const t of syncQueue) {
        await db.tasks.update(t.id, { sync_status: 'SYNCED' });
      }
      setIsOffline(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Field Tasks</h1>
          <p className="text-muted-foreground text-sm">Assigned survival interventions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsOffline(!isOffline)}
            className={isOffline ? "border-amber-500 text-amber-600 bg-amber-50" : ""}
          >
            {isOffline ? <><WifiOff className="w-4 h-4 mr-2"/> Offline Mode</> : "Online"}
          </Button>
          {syncQueue.length > 0 && (
            <Button size="sm" onClick={handleSync} disabled={isOffline}>
              Sync ({syncQueue.length})
            </Button>
          )}
        </div>
      </div>

      {isOffline && syncQueue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm mb-6 flex items-center justify-between">
          <span>You're offline. {syncQueue.length} actions waiting to sync.</span>
        </div>
      )}
      {!isOffline && syncQueue.length === 0 && tasks.filter(t=>t.status==='COMPLETED').length > 0 && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> All field updates synced.
        </div>
      )}

      {selectedTask && activeTask ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedTask(null)} className="mb-2 -ml-4">
            ← Back to tasks
          </Button>
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={activeTask.priority === 1 ? 'destructive' : 'default'}>
                  Priority {activeTask.priority}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3"/> {new Date(activeTask.deadline).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-xl">{activeTask.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-primary font-medium mt-1">
                <MapPin className="w-4 h-4" /> {activeCluster?.name} ({activeTask.trees_affected} trees)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Why</Label>
                <p className="text-sm bg-slate-50 p-3 rounded border">{activeTask.reason}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-primary font-bold tracking-wider">Action Required</Label>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-md text-primary-foreground font-medium text-sm flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">!</div>
                  <p className="text-slate-800">{activeTask.recommended_action}</p>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-lg">Provide Evidence</h3>
                
                <div className="space-y-2">
                  <Label>Photo Evidence</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                    <Camera className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="text-sm font-medium">Tap to take photo</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Field Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="Any observations or issues..." />
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedTask(null)}>Cancel</Button>
              <Button className="flex-1" onClick={() => handleComplete(activeTask.id)}>Submit Update</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.filter(t => t.status === 'PENDING').length === 0 ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mb-4 text-slate-300" />
                <p>No active survival risks require intervention.</p>
              </CardContent>
            </Card>
          ) : (
            tasks.filter(t => t.status === 'PENDING').map(task => {
              const cluster = clusters?.find((c: any) => c.id === task.cluster_id);
              return (
                <Card 
                  key={task.id} 
                  className={`cursor-pointer hover:border-primary/50 transition-colors ${task.priority === 1 ? 'border-l-4 border-l-destructive' : ''}`}
                  onClick={() => setSelectedTask(task.id)}
                >
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-start mb-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge variant={task.priority === 1 ? 'destructive' : 'secondary'}>Priority {task.priority}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {cluster?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-0 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-1">{task.reason}</p>
                  </CardContent>
                </Card>
              );
            })
          )}

          {tasks.filter(t => t.status === 'COMPLETED').length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recently Completed</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status === 'COMPLETED').map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-md opacity-75">
                    <div>
                      <p className="text-sm font-medium line-through text-slate-600">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Completed just now</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
