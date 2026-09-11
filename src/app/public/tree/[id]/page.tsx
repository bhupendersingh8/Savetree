"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, ShieldCheck, MapPin } from "lucide-react";

export default function PublicTreePage() {
  const params = useParams();
  // id is the public_id here e.g. SF-TEH-0001
  const publicId = params.id as string;

  const tree = useLiveQuery(
    () => db.trees.where('public_id').equals(publicId).first(),
    [publicId]
  );

  if (tree === undefined) return <div className="p-8 text-center text-muted-foreground">Loading public record...</div>;
  
  if (tree === null) return (
    <div className="container mx-auto p-4 max-w-lg mt-12">
      <Card className="text-center py-12 border-dashed">
        <Leaf className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Record Not Found</h2>
        <p className="text-muted-foreground">This tree ID does not exist in our public ledger, or it has not been verified yet.</p>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl pb-20 space-y-6 mt-8">
      <div className="text-center mb-8">
        <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">Public Impact Record</Badge>
        <h1 className="text-3xl font-bold tracking-tight">{tree.species}</h1>
        <p className="text-muted-foreground">{tree.public_id}</p>
      </div>
      
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {tree.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tree.photo_url} alt={tree.species} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-64 bg-slate-50 flex items-center justify-center text-slate-400">
            <Leaf className="w-12 h-12 opacity-20 mb-2" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="pt-6 text-center">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Status</p>
            <div className="text-xl font-bold uppercase">{tree.status}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-muted-foreground mb-1">General Area</p>
            <div className="text-xl font-bold text-slate-700">Project Zone</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planting Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Planted On</span>
            <span className="font-medium">{new Date(tree.planting_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Verification State</span>
            <span className="font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" /> {tree.registration_status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-muted-foreground">Last Recorded Update</span>
            <span className="font-medium">{new Date(tree.updated_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground mt-8">
        For privacy and security, exact coordinates, caretaker details, and risk factors are not exposed on the public ledger.
      </p>
    </div>
  );
}
