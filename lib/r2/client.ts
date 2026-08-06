import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const bucket = () => process.env.R2_BUCKET_NAME!;

/** Generate a short-lived presigned PUT URL for direct browser upload. */
export async function generateUploadUrl(
  objectKey: string,
  contentType: string,
  expiresInSeconds = 600,
) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: objectKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/** Generate a short-lived presigned GET URL for viewing or inference. */
export async function generateViewUrl(
  objectKey: string,
  expiresInSeconds = 3600,
) {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: bucket(),
    Key: objectKey,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/** HEAD an object to verify it exists and check metadata. */
export async function headObject(objectKey: string) {
  const client = getR2Client();
  const command = new HeadObjectCommand({
    Bucket: bucket(),
    Key: objectKey,
  });
  return client.send(command);
}

/** Build the standard object key for a study image from an original filename. */
export function buildObjectKey(
  studyId: string,
  imageId: string,
  fileName: string,
) {
  const ext = fileName.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "bin";
  const safeExt = ext || "bin";
  return `studies/${studyId}/images/${imageId}/original.${safeExt}`;
}
