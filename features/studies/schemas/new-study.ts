import { z } from "zod";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../constants/upload";
import {
  MAX_AGE_YEARS,
  MIN_AGE_YEARS,
  SUPPORTED_LATERALITY,
  SUPPORTED_VIEWS,
} from "@/lib/inference/contract";

export const imageMetadataSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Unsupported file type",
  }),
  fileSize: z
    .number()
    .min(1, "File must not be empty")
    .max(MAX_FILE_SIZE_BYTES, "File exceeds the 32 MB limit"),
  view: z.enum(SUPPORTED_VIEWS),
  laterality: z.enum(SUPPORTED_LATERALITY),
});

export const newStudySchema = z.object({
  study_code: z.string().min(1, "Study code is required"),
  age_years: z
    .number()
    .min(MIN_AGE_YEARS, "Minimum age is 0.2 years")
    .max(MAX_AGE_YEARS, "Maximum age is 19 years"),
  sex: z.enum(["male", "female", "unknown"]),
  notes: z.string().optional(),
  images: z
    .array(imageMetadataSchema)
    .min(1, "At least one image is required")
    .max(8, "At most 8 images are allowed"),
});

export type NewStudyInput = z.infer<typeof newStudySchema>;
export type ImageMetadataInput = z.infer<typeof imageMetadataSchema>;
