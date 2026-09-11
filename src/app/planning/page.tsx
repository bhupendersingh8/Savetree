"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Target, CheckCircle2 } from "lucide-react";

export default function PlanningPage() {
  const [water, setWater] = useState("difficult");
  const [protection, setProtection] = useState("none");
  const [caretaker, setCaretaker] = useState(false);
  const [access, setAccess] = useState("remote");

  // Simple readiness scoring model
  let score = 0;
  if (water === "reliable") score += 40;
  else if (water === "sometimes") score += 20;

  if (protection === "guard") score += 30;
  else if (protection === "safe") score += 20;

  if (caretaker) score += 20;

  if (access === "easy") score += 10;
  else if (access === "moderate") score += 5;

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20 max-w-3xl mt-4">
      <div>
        <Badge className="mb-2">Pre-Plantation</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Readiness Simulator</h1>
        <p className="text-muted-foreground">Should we plant here? Calculate survival probability before putting saplings in the ground.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Site Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Water Availability</Label>
                <Select value={water} onValueChange={(val) => { if (val) setWater(val); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reliable">Reliable (Piped/Daily)</SelectItem>
                    <SelectItem value="sometimes">Sometimes (Weekly/Tanker)</SelectItem>
                    <SelectItem value="difficult">Difficult (Rain dependent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Protection</Label>
                <Select value={protection} onValueChange={(val) => { if (val) setProtection(val); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guard">Tree Guard Provided</SelectItem>
                    <SelectItem value="safe">Naturally Safe (Walled)</SelectItem>
                    <SelectItem value="none">Open / Grazing Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Site Accessibility</Label>
                <Select value={access} onValueChange={(val) => { if (val) setAccess(val); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (Next to road)</SelectItem>
                    <SelectItem value="moderate">Moderate (Short walk)</SelectItem>
                    <SelectItem value="remote">Remote (Steep hike)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Dedicated Caretaker</Label>
                  <p className="text-xs text-muted-foreground">Is someone explicitly assigned?</p>
                </div>
                <Switch checked={caretaker} onCheckedChange={setCaretaker} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className={`sticky top-4 ${score < 50 ? 'border-destructive' : score < 75 ? 'border-amber-500' : 'border-primary'}`}>
            <CardHeader className="text-center pb-2">
              <CardTitle>Survival Readiness</CardTitle>
              <CardDescription>Predicted Probability</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-6xl font-black mb-4 ${score < 50 ? 'text-destructive' : score < 75 ? 'text-amber-500' : 'text-primary'}`}>
                {score}%
              </div>
              
              {score < 50 ? (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-start gap-2 text-left">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p><strong>DO NOT PLANT.</strong> The probability of survival is too low. Address water and protection first to avoid wasted resources.</p>
                </div>
              ) : score < 75 ? (
                <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2 text-left">
                  <Target className="w-5 h-5 shrink-0" />
                  <p><strong>PROCEED WITH CAUTION.</strong> Interventions will be required. Ensure stewards are assigned.</p>
                </div>
              ) : (
                <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p><strong>READY FOR PLANTATION.</strong> This site has high structural viability for survival.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
