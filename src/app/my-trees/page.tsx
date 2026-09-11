"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Leaf, MapPin, AlertCircle, Droplets, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

export default function MyTreesPage() {
  const [page, setPage] = useState(0);

  const trees = useLiveQuery(
    () => db.trees
      .orderBy('planting_date')
      .reverse()
      .offset(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    [page]
  );

  const totalTreesCount = useLiveQuery(() => db.trees.count()) ?? 0;
  const totalPages = Math.ceil(totalTreesCount / PAGE_SIZE);

  if (!trees) return <div className="p-4">Loading your trees...</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Trees</h1>
        <Link href="/register-tree">
          <Button size="sm" className="gap-2"><Plus className="w-4 h-4"/> Register</Button>
        </Link>
      </div>

      {trees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Leaf className="w-12 h-12 mb-4 text-slate-300" />
            <p>You haven't registered any trees yet.</p>
            <Link href="/register-tree" className="mt-4">
              <Button variant="outline">Register your first tree</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trees.map(tree => (
            <Card key={tree.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              {tree.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tree.photo_url} alt={tree.species} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400">
                  <Leaf className="w-8 h-8 opacity-50" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="bg-slate-50">{tree.id}</Badge>
                  <Badge variant={tree.registration_status === 'VERIFIED' ? 'default' : 'secondary'}>
                    {tree.registration_status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle>{tree.species}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <span className={`font-semibold ${tree.risk_level === 'CRITICAL' ? 'text-destructive' : tree.risk_level === 'GREEN' ? 'text-primary' : 'text-amber-600'}`}>
                    {tree.risk_level}
                  </span>
                </div>
                {tree.sync_status === 'PENDING' && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    Wait for sync to complete.
                  </p>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t p-3">
                <Link href={`/trees/${tree.id}`} className="w-full">
                  <Button variant="outline" className="w-full bg-white">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
