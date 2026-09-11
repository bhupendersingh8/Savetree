"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, MapPin, Plus } from "lucide-react";


import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function ProjectsPage() {
  const project = useLiveQuery(() => db.projects.limit(1).first());

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>
              <span className="text-xs text-muted-foreground font-medium">87% Survival</span>
            </div>
            <CardTitle>{(project?.name || 'Unknown Project')}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {(project?.location || 'Unknown Location')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planted:</span>
                <span className="font-medium">{(project?.total_saplings || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-medium">₹{((project?.budget || 0) as number).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target:</span>
                <span className="font-medium">{(project?.target_survival_rate || 0)}%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t flex justify-end p-4">
            <Link href="/dashboard">
              <Button size="sm">Open Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Readiness Simulator Card */}
        <Card className="bg-amber-50/50 border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Planning Phase</span>
            </div>
            <CardTitle>School District Expansions</CardTitle>
            <CardDescription>Evaluating readiness before planting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-semibold">Survival Readiness</span>
                <span className="text-lg font-bold text-amber-600">61/100</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: '61%' }}></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-800">Main blockers:</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                <li>No confirmed caretaker</li>
                <li>Weak animal protection planned</li>
                <li>Water access uncertain during dry season</li>
              </ul>
              <p className="font-medium text-amber-700 mt-3 p-2 bg-amber-100 rounded">
                Recommendation: Improve protection and confirm watering responsibility before planting.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              Run Simulator
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
