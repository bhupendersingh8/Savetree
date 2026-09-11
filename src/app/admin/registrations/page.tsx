"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminRegistrationsPage() {
  const pendingTrees = useLiveQuery(
    () => db.trees.where('registration_status').equals('PENDING_REVIEW').toArray()
  );

  const handleVerify = async (tree: any) => {
    await db.trees.update(tree.id, {
      registration_status: 'VERIFIED',
      sync_status: 'PENDING',
      updated_at: new Date().toISOString()
    });
  };

  const handleReject = async (tree: any) => {
    await db.trees.update(tree.id, {
      registration_status: 'REJECTED',
      sync_status: 'PENDING',
      updated_at: new Date().toISOString()
    });
  };

  if (!pendingTrees) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registration Inbox</h1>
        <p className="text-muted-foreground">Review new tree registrations from the field.</p>
      </div>

      {pendingTrees.length === 0 ? (
        <Card className="border-dashed bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mb-4 text-slate-300" />
            <p>Inbox is empty. No pending registrations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {pendingTrees.length} Pending
          </h2>
          {pendingTrees.map(tree => (
            <Card key={tree.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {tree.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tree.photo_url} alt={tree.species} className="w-full md:w-48 h-48 md:h-auto object-cover" />
                ) : (
                  <div className="w-full md:w-48 h-48 md:h-auto bg-slate-100 flex items-center justify-center text-slate-400">
                    No Photo
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tree.species}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tree.id}</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">Needs Review</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 flex-1 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground block text-xs">Planted</span>
                        {new Date(tree.planted_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Area</span>
                        {tree.cluster_id}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-xs">Caretaker Notes</span>
                        {tree.caretaker_notes || 'None'}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 border-t p-3 flex gap-2 justify-end">
                    <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleReject(tree)}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => handleVerify(tree)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Verify Tree
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
