"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin } from "lucide-react";
import { db, enqueueAction } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";

const formSchema = z.object({
  species: z.string().min(2, "Species is required"),
  common_name: z.string().optional(),
  cluster_id: z.string().min(1, "Area/Cluster is required"),
  water_availability: z.string().min(1, "Please select water availability"),
  protection_status: z.string().min(1, "Please select protection status"),
  caretaker: z.string().min(2, "Caretaker name is required"),
  notes: z.string().optional()
});

export default function RegisterTreePage() {
  const router = useRouter();
  const project = useLiveQuery(() => db.projects.limit(1).first());
  const cluster = useLiveQuery(() => db.clusters.limit(1).first());
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cluster_id: 'default' // Will be set to actual cluster if exists
    }
  });

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Could not fetch location.")
      );
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const publicId = `SF-TEH-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const internalId = uuidv4();
      
      const newTree = {
        id: internalId,
        public_id: publicId,
        project_id: project?.id || '',
        cluster_id: cluster?.id || '',
        species: values.species,
        common_name: values.common_name || null,
        planting_date: new Date().toISOString(),
        latitude: location?.lat || 30.3165,
        longitude: location?.lng || 78.4326,
        gps_accuracy: 10.0,
        water_availability: values.water_availability,
        protection_status: values.protection_status,
        caretaker: values.caretaker,
        notes: values.notes || null,
        status: 'ALIVE',
        registration_status: 'PENDING_REVIEW',
        risk_level: 'GREEN',
        risk_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Save to local cache for instant UI feedback
      await db.trees.put(newTree);

      // 2. Queue for sync to Supabase (offline-first)
      await enqueueAction({
        id: uuidv4(), // idempotency key
        table: 'trees',
        action: 'INSERT',
        payload: newTree
      });

      if (photoPreview) {
        const photoId = uuidv4();
        const newPhoto = {
           id: photoId,
           tree_id: internalId,
           photo_base64: photoPreview,
           photo_url: '', // Will be updated by processSyncQueue
           photo_type: 'PLANTING',
           timestamp: new Date().toISOString(),
           verification_status: 'PENDING'
        };
        await enqueueAction({
          id: uuidv4(),
          table: 'tree_photos',
          action: 'INSERT',
          payload: newPhoto
        });
      }

      alert(`Tree ${publicId} Registered Offline Successfully!\nWill sync when online.`);
      router.push('/my-trees');
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  if (!project || !cluster) return <div className="p-4 text-center">Cannot register tree: No valid project or cluster context available.</div>;

  if (!project || !cluster) return <div className="p-4 flex items-center justify-center text-muted-foreground">Cannot register tree: No valid project or cluster context available.</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl pb-20">
      <h1 className="text-2xl font-bold mb-6">Register a Tree</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Photo & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Take Photo</Label>
              {photoPreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Preview" className="object-cover w-full h-full" />
                  <Button variant="secondary" size="sm" className="absolute bottom-2 right-2" type="button" onClick={() => setPhotoPreview(null)}>
                    Retake
                  </Button>
                </div>
              ) : (
                <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 cursor-pointer">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Tap to open camera</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                </label>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-2 items-center">
                <Button type="button" variant="outline" onClick={captureLocation} className="flex-1 gap-2">
                  <MapPin className="w-4 h-4" /> {location ? "Location Captured" : "Get Current Location"}
                </Button>
              </div>
              {location && <p className="text-xs text-muted-foreground text-right">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tree Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Species</Label>
              <Input {...register("species")} placeholder="e.g. Rudraksha, Neem" />
              {errors.species && <p className="text-red-500 text-xs">{errors.species.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Area / Cluster</Label>
              <Select onValueChange={(val: any) => { if (val) setValue("cluster_id", val as string); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLUST-A">Village Orchard Edge</SelectItem>
                  <SelectItem value="CLUST-B">School Boundary</SelectItem>
                  <SelectItem value="CLUST-C">Community Pathway</SelectItem>
                </SelectContent>
              </Select>
              {errors.cluster_id && <p className="text-red-500 text-xs">{errors.cluster_id.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conditions & Care</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Water Availability</Label>
              <Select onValueChange={(val: any) => { if (val) setValue("water_availability", val as string); }}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reliable">Reliable (Daily/Weekly)</SelectItem>
                  <SelectItem value="sometimes">Sometimes Available</SelectItem>
                  <SelectItem value="difficult">Difficult to access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Protection Status</Label>
              <Select onValueChange={(val: any) => { if (val) setValue("protection_status", val as string); }}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="protected">Tree Guard Installed</SelectItem>
                  <SelectItem value="needs_protection">Needs Protection (Grazing Risk)</SelectItem>
                  <SelectItem value="safe">Safe Area (No guard needed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caretaker Name</Label>
              <Input {...register("caretaker")} placeholder="Who will water this?" />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea {...register("notes")} placeholder="Any other risks or notes..." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Submit Registration"}
        </Button>
      </form>
    </div>
  );
}
