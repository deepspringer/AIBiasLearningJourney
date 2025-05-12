import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.S3_BUCKET_NAME || "ltdreading";

/**
 * Upload a file buffer to S3
 * @param fileBuffer The file buffer to upload
 * @param mimeType The mime type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(fileBuffer: Buffer, mimeType: string): Promise<string> {
  const key = `uploads/${uuidv4()}`;
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL parameter removed as your bucket has ACLs disabled
  };

  try {
    // Upload the file
    await s3Client.send(new PutObjectCommand(params));

    // Generate a presigned URL that will work even if the bucket doesn't allow public access
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 * 7 }); // URL valid for 7 days
    return url;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Generate a presigned URL for a file in S3
 * @param key The key of the file in S3
 * @returns The presigned URL
 */
export async function getPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}