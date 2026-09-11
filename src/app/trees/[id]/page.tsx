"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateRiskScore, getRiskLevel, recommendInterventions } from "@/lib/risk-engine";
import { Droplets, ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TreeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const tree = useLiveQuery(() => db.trees.where('id').equals(id).first(), [id]);

  if (tree === undefined) return <div className="p-4">Loading...</div>;
  if (tree === null) return <div className="p-4">Tree not found</div>;

  const currentScore = calculateRiskScore(tree);
  const recommendations = recommendInterventions(tree);

  const handleAction = async (action: 'WATER' | 'INSPECT' | 'REPAIR_GUARD') => {
    const updates: Partial<typeof tree> = {
      updated_at: new Date().toISOString(),
      sync_status: 'PENDING'
    };

    if (action === 'WATER') updates.last_watered_at = new Date().toISOString();
    if (action === 'INSPECT') updates.last_inspected_at = new Date().toISOString();
    if (action === 'REPAIR_GUARD') updates.guard_status = 'GOOD';

    // Recalculate risk
    const tempTree = { ...tree, ...updates };
    updates.risk_score = calculateRiskScore(tempTree);
    updates.risk_level = getRiskLevel(updates.risk_score);

    await db.trees.update(id, updates);
    alert(`Action ${action} recorded!`);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl pb-20 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-4 mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div className="overflow-hidden rounded-xl border bg-card">
        {tree.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tree.photo_url} alt={tree.species} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">
            No Photo Available
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold">{tree.species}</h1>
              <p className="text-muted-foreground text-sm">{tree.id}</p>
            </div>
            <Badge variant={tree.status === 'ALIVE' ? 'default' : 'destructive'}>{tree.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Survival Risk</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{currentScore}</span>
              <span className={`font-semibold mb-1 ${currentScore >= 60 ? 'text-destructive' : currentScore >= 30 ? 'text-amber-600' : 'text-primary'}`}>
                {tree.risk_level}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Registration</p>
            <div className="text-sm font-semibold mt-2">
              {tree.registration_status.replace('_', ' ')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Survival Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge variant="default" className="shrink-0">Planting (Verified)</Badge>
            <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-800">30-Day Check</Badge>
            <Badge variant="outline" className="shrink-0 text-muted-foreground">90-Day</Badge>
            <Badge variant="outline" className="shrink-0 text-muted-foreground">6-Month</Badge>
            <Badge variant="outline" className="shrink-0 text-muted-foreground">1-Year</Badge>
          </div>
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Button size="sm" variant="outline" className="w-full" onClick={() => alert("Survival Check form would open here.")}>Record 30-Day Check</Button>
            <Button size="sm" variant="destructive" className="w-full" onClick={() => alert("Replacement flow would open here, linking a new tree to this original ID.")}>Mark Dead / Replace</Button>
          </div>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card className={currentScore >= 60 ? 'border-destructive/50' : 'border-amber-500/50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              What does this tree need?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">!</div>
                  {rec}
                </li>
              ))}
            </ul>
            
            <div className="space-y-2 border-t pt-4">
              <p className="text-xs uppercase font-bold text-muted-foreground mb-2">Record Care Action</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleAction('WATER')} className="gap-2">
                  <Droplets className="w-4 h-4" /> Watered
                </Button>
                {tree.guard_status !== 'GOOD' && (
                  <Button size="sm" variant="outline" onClick={() => handleAction('REPAIR_GUARD')} className="gap-2">
                    <ShieldAlert className="w-4 h-4" /> Guard Repaired
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleAction('INSPECT')} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Inspected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
             <div className="w-32 shrink-0">
               {tree.photo_url ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={tree.photo_url} alt="Planting" className="w-32 h-32 object-cover rounded-md border" />
               ) : (
                 <div className="w-32 h-32 bg-slate-100 rounded-md border flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
               )}
               <p className="text-xs font-semibold mt-1">Planting</p>
               <p className="text-[10px] text-muted-foreground">{new Date(tree.planting_date).toLocaleDateString()}</p>
             </div>

             <div className="w-32 shrink-0 opacity-50 border-dashed border-2 rounded-md flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-2xl mb-1">+</span>
                <p className="text-xs font-medium">Add Photo</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Care History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Last Watered</span>
            <span className="font-medium">{tree.last_watered_at ? new Date(tree.last_watered_at).toLocaleDateString() : 'Never'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Last Inspected</span>
            <span className="font-medium">{tree.last_inspected_at ? new Date(tree.last_inspected_at).toLocaleDateString() : 'Never'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Guard Status</span>
            <span className="font-medium">{tree.guard_status}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
