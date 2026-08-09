"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { ImageDropzone } from "@/features/studies/components/image-dropzone";

interface ImageEntry {
  id: string;
  file: File | null;
  view: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN";
  laterality: "left" | "right" | "unknown";
}

type SubmitState = {
  status: "idle" | "success" | "error";
  studyId?: string;
};

const INITIAL_STATE: SubmitState = { status: "idle" };

function freshImageEntry(): ImageEntry {
  return {
    id: crypto.randomUUID(),
    file: null,
    view: "UNKNOWN",
    laterality: "unknown",
  };
}

export function NewStudyForm() {
  const router = useRouter();
  const [stage, setStage] = useState<string | null>(null);

  const [studyCode, setStudyCode] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "unknown">("unknown");
  const [notes, setNotes] = useState("");

  const [images, setImages] = useState<ImageEntry[]>([freshImageEntry()]);

  const valuesRef = useRef({ studyCode, ageYears, sex, notes, images });
  useEffect(() => {
    valuesRef.current = { studyCode, ageYears, sex, notes, images };
  }, [studyCode, ageYears, sex, notes, images]);

  const navigatedRef = useRef(false);

  const handleAddImage = () => {
    if (images.length >= 8) {
      toast.error("At most 8 images are allowed.");
      return;
    }
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

  const submitStudy = async (): Promise<SubmitState> => {
    const {
      studyCode: currentCode,
      ageYears: currentAge,
      sex: currentSex,
      notes: currentNotes,
      images: currentImages,
    } = valuesRef.current;

    for (const img of currentImages) {
      const file = img.file;
      if (!file) {
        toast.error("Please select a file for all image entries.");
        return { status: "error" };
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
        toast.error(`${file.name} uses an unsupported format.`);
        return { status: "error" };
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name} exceeds the 32 MB limit.`);
        return { status: "error" };
      }
    }

    const parsedAge = parseFloat(currentAge);
    if (isNaN(parsedAge) || parsedAge < 0.2 || parsedAge > 19) {
      toast.error("Age must be a number between 0.2 and 19 years.");
      return { status: "error" };
    }

    try {
      const generatedCode = currentCode.trim() || `ST-${Math.floor(100000 + Math.random() * 900000)}`;

      const studyPayload = {
        study_code: generatedCode,
        age_years: parsedAge,
        sex: currentSex,
        notes: currentNotes.trim() || undefined,
        images: currentImages.map((img) => ({
          fileName: img.file!.name,
          fileType: img.file!.type as (typeof ALLOWED_MIME_TYPES)[number],
          fileSize: img.file!.size,
          view: img.view,
          laterality: img.laterality,
        })),
      };

      setStage("Preparing study...");

      const plan = await createStudy(studyPayload);
      const { studyId } = plan;

      setStage("Uploading images...");

      await Promise.all(
        plan.images.map(async (uploadDef, i) => {
          const imgEntry = currentImages[i];

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

      return { status: "success", studyId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while submitting.";
      toast.error(message);
      return { status: "error" };
    } finally {
      setStage(null);
    }
  };

  const [state, formAction, isPending] = useActionState(submitStudy, INITIAL_STATE);

  useEffect(() => {
    if (state.status === "success" && state.studyId && !navigatedRef.current) {
      navigatedRef.current = true;
      setStudyCode("");
      setAgeYears("");
      setSex("unknown");
      setNotes("");
      setImages([freshImageEntry()]);
      router.replace(`/worklist/${state.studyId}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex w-full flex-col gap-6 pb-12">
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
                name="studyCode"
                placeholder="Leave blank to auto-generate"
                value={studyCode}
                onChange={(e) => setStudyCode(e.target.value)}
                disabled={isPending}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ageYears">Age (Years)</FieldLabel>
              <Input
                id="ageYears"
                name="ageYears"
                type="number"
                min="0.2"
                max="19"
                step="0.1"
                required
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                disabled={isPending}
              />
            </Field>

            <Field>
              <FieldLabel>Sex</FieldLabel>
              <Select
                value={sex}
                onValueChange={(v: "male" | "female" | "unknown") => setSex(v)}
                disabled={isPending}
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
                name="notes"
                placeholder="Optional clinical notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
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
            disabled={isPending}
          >
            <Plus data-icon="inline-start" />
            Add Image
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {images.map((img) => (
            <div key={img.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor={`file-${img.id}`}>Radiograph</FieldLabel>
                  <ImageDropzone
                    id={`file-${img.id}`}
                    file={img.file}
                    disabled={isPending}
                    onFileChange={(file) => handleUpdateImage(img.id, { file })}
                  />
                </Field>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <Field className="flex-1">
                    <FieldLabel>View</FieldLabel>
                    <Select
                      value={img.view}
                      onValueChange={(v: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN") =>
                        handleUpdateImage(img.id, { view: v })
                      }
                      disabled={isPending}
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

                  <Field className="flex-1">
                    <FieldLabel>Laterality</FieldLabel>
                    <Select
                      value={img.laterality}
                      onValueChange={(v: "left" | "right" | "unknown") =>
                        handleUpdateImage(img.id, { laterality: v })
                      }
                      disabled={isPending}
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
                      className="self-start sm:self-auto"
                      onClick={() => handleRemoveImage(img.id)}
                      disabled={isPending}
                    >
                      <X data-icon="inline-start" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col items-stretch gap-4 sm:items-end">
        {isPending && stage && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground sm:justify-end">
            <Spinner />
            {stage}
          </div>
        )}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:min-w-44 sm:px-8">
          {isPending ? "Processing..." : "Submit Study"}
        </Button>
      </div>
    </form>
  );
}
