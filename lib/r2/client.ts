import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/tiff": "tif",
  "image/bmp": "bmp",
  "image/webp": "webp",
  "image/gif": "gif",
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: getEnv("R2_ENDPOINT"),
      credentials: {
        accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

function getBucket(): string {
  return getEnv("R2_BUCKET_NAME");
}

/** Generate a short-lived presigned PUT URL for direct browser upload. */
export async function generateUploadUrl(
  objectKey: string,
  contentType: string,
  expiresInSeconds = 600,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
    ContentType: contentType,
  });
  return getSignedUrl(getR2Client(), command, {
    expiresIn: expiresInSeconds,
  });
}

/** Generate a short-lived presigned GET URL for viewing or inference. */
export async function generateViewUrl(
  objectKey: string,
  expiresInSeconds = 600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
  });
  return getSignedUrl(getR2Client(), command, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Delete a batch of objects (up to 1000 keys per call). No-op for an empty
 * list. Throws if any object fails to delete.
 */
export async function deleteObjects(objectKeys: string[]): Promise<void> {
  if (objectKeys.length === 0) return;
  const command = new DeleteObjectsCommand({
    Bucket: getBucket(),
    Delete: { Objects: objectKeys.map((Key) => ({ Key })), Quiet: true },
  });
  const { Errors } = await getR2Client().send(command);
  if (Errors && Errors.length > 0) {
    const failed = Errors.map((e) => `${e.Key} (${e.Code})`).join(", ");
    throw new Error(`Failed to delete objects: ${failed}`);
  }
}

/** HEAD an object to verify it exists and check metadata. */
export async function headObject(objectKey: string) {
  const command = new HeadObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
  });
  return getR2Client().send(command);
}

/** Build the standard object key for a study image from a validated MIME type. */
export function buildObjectKey(
  studyId: string,
  imageId: string,
  mimeType: string,
): string {
  const extension = MIME_EXTENSIONS[mimeType] ?? "bin";
  return `studies/${studyId}/images/${imageId}/original.${extension}`;
}
