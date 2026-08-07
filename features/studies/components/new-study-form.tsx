"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { createStudy, finalizeStudy } from "../actions/create-study";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../constants/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";

interface ImageEntry {
  id: string;
  file: File | null;
  view: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN";
  laterality: "left" | "right" | "unknown";
}

export function NewStudyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<string | null>(null);

  const [studyCode, setStudyCode] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "unknown">("unknown");
  const [notes, setNotes] = useState("");

  const [images, setImages] = useState<ImageEntry[]>([
    { id: crypto.randomUUID(), file: null, view: "UNKNOWN", laterality: "unknown" },
  ]);

  const handleAddImage = () => {
    setImages([
      ...images,
      { id: crypto.randomUUID(), file: null, view: "UNKNOWN", laterality: "unknown" },
    ]);
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleUpdateImage = (id: string, updates: Partial<ImageEntry>) => {
    setImages(images.map((img) => (img.id === id ? { ...img, ...updates } : img)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const img of images) {
      const file = img.file;
      if (!file) {
        toast.error("Please select a file for all image entries.");
        return;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
        toast.error(`${file.name} uses an unsupported format.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name} exceeds the 32 MB limit.`);
        return;
      }
    }

    setIsSubmitting(true);
    setStage("Preparing study...");

    try {
      const parsedAge = parseInt(ageYears, 10);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 25) {
        throw new Error("Age must be a valid number between 0 and 25.");
      }

      const generatedCode = studyCode.trim() || `ST-${Math.floor(100000 + Math.random() * 900000)}`;

      const studyPayload = {
        study_code: generatedCode,
        age_years: parsedAge,
        sex,
        notes: notes.trim() || undefined,
        images: images.map((img) => ({
          fileName: img.file!.name,
          fileType: img.file!.type as (typeof ALLOWED_MIME_TYPES)[number],
          fileSize: img.file!.size,
          view: img.view,
          laterality: img.laterality,
        })),
      };

      const plan = await createStudy(studyPayload);
      const { studyId } = plan;

      setStage("Uploading images...");

      await Promise.all(
        plan.images.map(async (uploadDef, i) => {
          const imgEntry = images[i];

          if (!imgEntry?.file) {
            throw new Error(`No matching file for image ${uploadDef.imageId}`);
          }

          const response = await fetch(uploadDef.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": imgEntry.file.type,
            },
            body: imgEntry.file,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${imgEntry.file.name}`);
          }
        }),
      );

      setStage("Running Physis analysis...");
      const finalizeResult = await finalizeStudy(studyPayload, plan);

      if (!finalizeResult.success) {
        toast.error("Study uploaded, but analysis failed. Please check the worklist.");
      } else {
        toast.success("Study created and analyzed successfully.");
      }

      setStage("Saving results...");
      router.push(`/worklist/${studyId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while submitting.";
      toast.error(message);
      setIsSubmitting(false);
      setStage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 pb-12">
      <Card>
        <CardHeader>
          <CardTitle>Study Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="studyCode">Study Code</FieldLabel>
              <Input
                id="studyCode"
                placeholder="Leave blank to auto-generate"
                value={studyCode}
                onChange={(e) => setStudyCode(e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ageYears">Age (Years)</FieldLabel>
              <Input
                id="ageYears"
                type="number"
                min="0"
                max="25"
                required
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel>Sex</FieldLabel>
              <Select
                value={sex}
                onValueChange={(v: "male" | "female" | "unknown") => setSex(v)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="sm:col-span-2 lg:col-span-3">
              <FieldLabel htmlFor="notes">Clinical Notes</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Optional clinical notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                className="h-24 resize-none"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Radiographs</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddImage}
            disabled={isSubmitting}
          >
            <Plus data-icon="inline-start" />
            Add Image
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {images.map((img) => (
            <div key={img.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`file-${img.id}`}>File Upload</FieldLabel>
                  <Input
                    id={`file-${img.id}`}
                    type="file"
                    accept=".png,.jpg,.jpeg,.tif,.tiff,.bmp,.webp,.gif"
                    required
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      handleUpdateImage(img.id, { file });
                    }}
                  />
                </Field>

                <Field className="lg:w-48">
                  <FieldLabel>View</FieldLabel>
                  <Select
                    value={img.view}
                    onValueChange={(v: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN") =>
                      handleUpdateImage(img.id, { view: v })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="PA">PA</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="LATERAL">Lateral</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="UNKNOWN">Unknown</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="lg:w-48">
                  <FieldLabel>Laterality</FieldLabel>
                  <Select
                    value={img.laterality}
                    onValueChange={(v: "left" | "right" | "unknown") =>
                      handleUpdateImage(img.id, { laterality: v })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                {images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-start lg:self-auto"
                    onClick={() => handleRemoveImage(img.id)}
                    disabled={isSubmitting}
                  >
                    <X data-icon="inline-start" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col items-stretch gap-4 sm:items-end">
        {isSubmitting && stage && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground sm:justify-end">
            <Spinner />
            {stage}
          </div>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-44 sm:px-8">
          {isSubmitting ? "Processing..." : "Submit Study"}
        </Button>
      </div>
    </form>
  );
}
