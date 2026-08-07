import { z } from "zod";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../constants/upload";

export const imageMetadataSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Unsupported file type",
  }),
  fileSize: z
    .number()
    .min(1, "File must not be empty")
    .max(MAX_FILE_SIZE_BYTES, "File exceeds the 32 MB limit"),
  view: z.enum(["PA", "AP", "LATERAL", "OTHER", "UNKNOWN"]),
  laterality: z.enum(["left", "right", "unknown"]),
});

export const newStudySchema = z.object({
  study_code: z.string().min(1, "Study code is required"),
  age_years: z.number().min(0, "Minimum age is 0").max(25, "Maximum age is 25"),
  sex: z.enum(["male", "female", "unknown"]),
  notes: z.string().optional(),
  images: z.array(imageMetadataSchema).min(1, "At least one image is required"),
});

export type NewStudyInput = z.infer<typeof newStudySchema>;
export type ImageMetadataInput = z.infer<typeof imageMetadataSchema>;
