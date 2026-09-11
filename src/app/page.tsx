import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Sprout, ClipboardCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-card to-background">
        <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-none">
          Survival Decision Intelligence
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mb-6">
          No plantation without a <span className="text-primary">survival plan.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Plantation is an event. Survival is a system. SurviveFirst helps plantation teams predict survival risks, identify failure causes, prioritize interventions, verify outcomes, and learn what makes trees survive.
        </p>
        <div className="flex gap-4">
          <Link href="/register-tree">
            <Button size="lg">Register a Tree</Button>
          </Link>
          <Link href="/impact">
            <Button variant="outline" size="lg">View Public Impact</Button>
          </Link>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 bg-white border-t border-b">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">From Monitoring to Decision Intelligence</h2>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="font-semibold mb-2">Monitor</h3>
              <p className="text-sm text-muted-foreground">Track field data and conditions.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Understand</h3>
              <p className="text-sm text-muted-foreground">Identify root causes of risk.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <ArrowRight className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Decide</h3>
              <p className="text-sm text-muted-foreground">Prioritize limited resources.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sprout className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Intervene</h3>
              <p className="text-sm text-muted-foreground">Take targeted action in the field.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Learn</h3>
              <p className="text-sm text-muted-foreground">Verify outcomes and adapt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiator Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">What SurviveFirst Does Differently</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Don't just record failure. Find the cause. Choose the intervention. Verify the result. Learn for the next plantation.
          </p>
          <Card className="text-left bg-background border-border">
            <CardHeader>
              <CardTitle>Real-World Origin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                In a small village plantation, out of 12 saplings planted, only 7 survived. The difference wasn't the species or the soil. The saplings that failed lacked consistent watering or were damaged by grazing animals. The problem is not planting a tree. The problem is keeping that tree alive after planting. 
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
