"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudyDetail } from "../api/get-study-detail";
import { submitReview } from "../actions/submit-review";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const OUTCOMES = [
  { value: "fracture", label: "Fracture" },
  { value: "no_fracture", label: "No Fracture" },
  { value: "uncertain", label: "Uncertain" },
] as const;

type Outcome = (typeof OUTCOMES)[number]["value"];

export function ReviewPanel({ study }: { study: StudyDetail }) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome | null>(
    (study.review?.outcome as Outcome | undefined) ?? null,
  );
  const [notes, setNotes] = useState(study.review?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [nextId, setNextId] = useState<string | null>(null);

  const isReviewed = !!study.review;

  const handleSubmit = async () => {
    if (!outcome) {
      toast.error("Please select an outcome");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview({ studyId: study.id, outcome, notes });
      if (result.success) {
        toast.success("Review submitted successfully");
        setSuccessMode(true);
        setNextId(result.nextStudyId ?? null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to submit review");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMode && nextId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
          <p className="font-medium">Review saved</p>
          <Button
            onClick={() => {
              setSuccessMode(false);
              router.push(`/worklist/${nextId}`);
            }}
          >
            Next Study
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isReviewed ? "Review (Completed)" : "Radiologist Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Outcome</FieldLabel>
            <ToggleGroup
              type="single"
              value={outcome ?? undefined}
              onValueChange={(v) => {
                if (v) setOutcome(v as Outcome);
              }}
            >
              {OUTCOMES.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="review-notes">Notes (Optional)</FieldLabel>
            <Textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional observations..."
              rows={4}
            />
          </Field>

          <Button
            onClick={handleSubmit}
            disabled={!outcome || isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting
              ? "Submitting..."
              : isReviewed
                ? "Update Review"
                : "Submit Review"}
          </Button>

          {isReviewed && (
            <p className="text-xs text-muted-foreground">
              Last reviewed on {new Date(study.review!.reviewed_at).toLocaleString()}
            </p>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
