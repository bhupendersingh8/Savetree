"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Users, ShieldCheck, MapPin } from "lucide-react";


import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function ImpactPage() {
  const project = useLiveQuery(() => db.projects.limit(1).first());

  return (
    <div className="container mx-auto p-4 space-y-8 pb-12">
      <div className="text-center py-12 bg-gradient-to-b from-primary/10 to-background rounded-2xl">
        <Badge className="mb-4 bg-primary text-white">Public Impact Report</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Verified Survival Data
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We don't just count the trees we plant. We track the ones that survive. Here is the verified impact of the SurviveFirst platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center border-primary/20 shadow-sm">
          <CardHeader>
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-sm text-muted-foreground">Trees Planted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">100</p>
          </CardContent>
        </Card>

        <Card className="text-center border-primary/20 shadow-sm bg-primary text-primary-foreground">
          <CardHeader>
            <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-sm text-primary-foreground/80">Verified Alive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">87</p>
          </CardContent>
        </Card>

        <Card className="text-center border-primary/20 shadow-sm">
          <CardHeader>
            <div className="mx-auto bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle className="text-sm text-muted-foreground">Interventions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">14</p>
          </CardContent>
        </Card>

        <Card className="text-center border-primary/20 shadow-sm">
          <CardHeader>
            <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-sm text-muted-foreground">Communities Involved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Public Projects</h2>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>
              <span className="text-xs text-muted-foreground font-medium">87% Survival</span>
            </div>
            <CardTitle>{(project?.name || 'Unknown Project')}</CardTitle>
            <p className="flex items-center gap-1 text-muted-foreground mt-1 text-sm">
              <MapPin className="w-3 h-3" /> {(project?.location || 'Unknown Location')}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              A community-led effort to restore local tree cover with a strict focus on post-plantation survival and care tracking.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Planted</p>
                <p className="font-semibold">{(project?.total_saplings || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Verified Alive</p>
                <p className="font-semibold text-primary">87</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Target</p>
                <p className="font-semibold">{(project?.target_survival_rate || 0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
