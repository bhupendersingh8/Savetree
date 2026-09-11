"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Droplets, ShieldAlert, Sprout, Target } from "lucide-react";


export default function ClusterIntelligencePage() {

  const params = useParams();
  const clusterData = useLiveQuery(() => db.clusters.where('id').equals(params.id as string).first());
  // id is internal UUID or mock string
  const clusterId = params.id as string;

  const cluster = clusterData;
  
  const trees = useLiveQuery(
    () => db.trees.where('cluster_id').equals(clusterId).toArray(),
    [clusterId]
  );

  const tasks = useLiveQuery(
    () => db.tasks.where('cluster_id').equals(clusterId).toArray(),
    [clusterId]
  );

  if (!trees || !tasks) return <div className="p-8">Loading Cluster Intelligence...</div>;

  const total = trees.length;
  const alive = trees.filter(t => t.status === 'ALIVE' || t.status === 'WEAK').length;
  const survivalRate = total > 0 ? Math.round((alive / total) * 100) : 0;
  
  const highRisk = trees.filter(t => t.risk_level === 'CRITICAL' || t.risk_level === 'RED').length;
  
  const waterIssues = trees.filter(t => t.water_availability === 'difficult').length;
  const protectionIssues = trees.filter(t => t.protection_status === 'needs_protection').length;
  
  const openTasks = tasks.filter(t => t.status !== 'COMPLETED').length;

  if (!clusterData) return <div className="p-4 flex items-center justify-center text-muted-foreground">No active cluster available</div>;

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20">
      <div>
        <Badge className="mb-2">Cluster Intelligence</Badge>
        <h1 className="text-3xl font-bold tracking-tight">{cluster.name}</h1>
        <p className="text-muted-foreground text-sm">ID: {cluster.id}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Trees Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Survival Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{survivalRate}%</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasks}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Pattern Detection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
              <Droplets className="w-4 h-4" /> Watering Deficit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-700">{waterIssues}</p>
            <p className="text-xs text-amber-600 mt-1">trees lack reliable water access</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
              <ShieldAlert className="w-4 h-4" /> Grazing Vulnerability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-700">{protectionIssues}</p>
            <p className="text-xs text-amber-600 mt-1">trees need protection guards</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Learnings</CardTitle>
          <CardDescription>Generated from longitudinal survival data in this specific area.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg text-sm text-muted-foreground">
            Insufficient verified historical data to generate cluster-specific learnings.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
