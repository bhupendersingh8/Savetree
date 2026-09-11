"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Droplets, Shield, Sprout, ArrowDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";


export default function DashboardPage() {
  const project = useLiveQuery(() => db.projects.limit(1).first());
  const trees = useLiveQuery(() => db.trees.toArray());
  const tasks = useLiveQuery(() => db.tasks.toArray());

  if (!trees || !tasks) return <div className="p-4">Loading Command Center...</div>;

  const totalPlanted = trees.length;
  const alive = trees.filter(s => s.status === 'ALIVE' || s.status === 'WEAK').length;
  const dead = trees.filter(s => s.status === 'DEAD' || s.status === 'NOT_FOUND').length;
  const atRisk = trees.filter(s => s.risk_level === 'CRITICAL' || s.risk_level === 'RED').length;
  const survivalRate = totalPlanted > 0 ? Math.round((alive / totalPlanted) * 100) : 0;
  
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');


  return (
    <div className="container mx-auto p-4 space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Survival Command Center</h1>
        <p className="text-muted-foreground">{(project?.name || 'Unknown Project')} — {(project?.location || 'Unknown Location')}</p>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified Survival</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{survivalRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Target: {(project?.target_survival_rate || 0)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{alive}</div>
              <p className="text-xs text-muted-foreground">Alive / {totalPlanted} Planted</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">{atRisk} at risk</Badge>
              <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">{dead} dead</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost per Surviving Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{alive > 0 ? Math.round((project?.budget || 0) / alive) : 0}</div>
            <p className="text-xs text-muted-foreground">Based on current budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground text-destructive font-medium">
              {activeTasks.filter(t => t.priority === 1).length} urgent items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: What needs attention */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500 w-5 h-5" />
              What Needs Attention Now?
            </h2>
            <div className="space-y-4">
              {activeTasks.map(task => (
                <Card key={task.id} className={task.priority === 1 ? 'border-destructive/50 shadow-sm' : ''}>
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={task.priority === 1 ? 'destructive' : 'secondary'}>
                            Priority {task.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{task.trees_affected} trees affected</span>
                        </div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">{task.reason}</CardDescription>
                      </div>
                      <Link href={`/tasks`}>
                        <Button size="sm">View Task</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 bg-muted/30 border-t">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-primary" />
                      Recommended: {task.recommended_action}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-semibold">Risk Trajectory: Cluster A</h2>
              <Badge variant="outline" className="text-primary border-primary">RECOVERING</Badge>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="h-[250px] w-full">
                  {project?.trajectory_data && project?.trajectory_data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={project?.trajectory_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                      Not enough verified historical data to generate trajectory.
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between border border-primary/20">
                  <span className="text-sm font-medium">Intervention Impact (Guard Repair & Water)</span>
                  <span className="text-primary font-bold text-sm flex items-center gap-1">
                    <ArrowDown className="w-4 h-4" /> 50 risk points reduced
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Column: Causes and Learning */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Why are trees at risk?</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-500"/> Watering delay</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><Sprout className="w-4 h-4 text-amber-500"/> Animal damage</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-red-500"/> Damaged guards</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Survival Learning</h2>
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  What the project is teaching us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Protection failure was the dominant cause of risk in Cluster A. Guard repair produced a larger, more immediate risk reduction (-50 points) than simple watering.
                </p>
                <div className="bg-white p-3 rounded border text-sm">
                  <span className="font-semibold block mb-1">Next Plantation Recommendation:</span>
                  Pre-install physical protection in grazing-exposed zones before planting, rather than adding it reactively.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
