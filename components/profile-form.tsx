"use client";

import { useActionState, useState } from "react";
import { interestOptions, personalityOptions } from "@/lib/constants";
import type { Profile } from "@/lib/database.types";
import { saveProfileAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type ProfileFormProps = {
  profile: Profile | null;
  selectedInterests: string[];
};

export function ProfileForm({ profile, selectedInterests }: ProfileFormProps) {
  const initialState: { error?: string } = {};
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url ?? "");
  const [localPreview, setLocalPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [improving, setImproving] = useState(false);

  async function improveBio() {
    setImproving(true);
    const response = await fetch("/api/ai/bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio })
    });
    const data = await response.json();
    if (data.text) setBio(data.text);
    setImproving(false);
  }

  async function uploadProfilePhoto(file?: File) {
    setPhotoError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Profile photo must be 5MB or smaller.");
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setPhotoError("Log in again before uploading a profile photo.");
      setUploadingPhoto(false);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      setPhotoError(error.message);
      setUploadingPhoto(false);
      return;
    }

    const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    setUploadingPhoto(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Build your profile</CardTitle>
          <CardDescription>
            This is what powers your matches. Your preview updates here as you edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Username
              <Input name="username" defaultValue={profile?.username ?? ""} placeholder="akua_codes" required />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Display name
              <Input name="display_name" defaultValue={profile?.display_name ?? ""} placeholder="Akua Mensah" required />
            </label>
          </div>
          <div className="grid gap-3 rounded-lg border bg-white/70 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-lg border bg-muted text-sm text-muted-foreground">
                {localPreview || photoUrl ? (
                  <img src={localPreview || photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  "Photo"
                )}
              </div>
              <label className="grid flex-1 gap-2 text-sm font-medium">
                Upload profile photo from device
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => uploadProfilePhoto(event.target.files?.[0])}
                />
              </label>
            </div>
            <input type="hidden" name="photo_url" value={photoUrl} />
            {uploadingPhoto ? <p className="text-sm text-muted-foreground">Uploading photo...</p> : null}
            {photoError ? <p className="text-sm text-destructive">{photoError}</p> : null}
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Bio
            <Textarea name="bio" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="A calm introvert who likes coding, playlists, and campus food spots." required />
          </label>
          <Button type="button" variant="outline" onClick={improveBio} disabled={improving || bio.length < 10}>
            {improving ? "Improving..." : "Improve bio with AI"}
          </Button>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Match intent
              <Select name="match_intent" defaultValue={profile?.match_intent ?? "both"}>
                <option value="both">Friendship and relationship</option>
                <option value="friendship">Friendship</option>
                <option value="relationship">Relationship</option>
              </Select>
            </label>
            <input type="hidden" name="anonymous_before_match" value="" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Hobbies
              <Input name="hobbies" defaultValue={profile?.hobbies ?? ""} placeholder="Reading, gym, campus events" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Entertainment
              <Input name="entertainment" defaultValue={profile?.entertainment ?? ""} placeholder="Afrobeats, anime, thrillers" />
            </label>
          </div>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Interests</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {interestOptions.map((interest) => (
                <label key={interest} className="flex items-center gap-2 rounded-md border bg-white/70 p-2 text-sm">
                  <Checkbox name="interests" value={interest} defaultChecked={selectedInterests.includes(interest)} />
                  {interest}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Personality traits</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {personalityOptions.map((trait) => (
                <label key={trait} className="flex items-center gap-2 rounded-md border bg-white/70 p-2 text-sm">
                  <Checkbox name="personality_traits" value={trait} defaultChecked={profile?.personality_traits?.includes(trait)} />
                  {trait}
                </label>
              ))}
            </div>
          </fieldset>
          {state.error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
          <Button disabled={pending}>{pending ? "Saving..." : "Save profile"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="self-start overflow-hidden">
        <div className="relative h-56 bg-muted">
          {localPreview || photoUrl ? (
            <img src={localPreview || photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-100 via-rose-100 to-amber-100 text-sm font-semibold text-muted-foreground">
              Profile photo preview
            </div>
          )}
        </div>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-bold">{profile?.display_name || "Your display name"}</h2>
            <p className="text-sm text-muted-foreground">{profile?.match_intent ?? "both"}</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {bio || "Your bio preview will appear here while you write it."}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.slice(0, 5).map((interest) => <Badge key={interest}>{interest}</Badge>)}
            {(profile?.personality_traits ?? []).slice(0, 4).map((trait) => <Badge key={trait} className="bg-accent">{trait}</Badge>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
