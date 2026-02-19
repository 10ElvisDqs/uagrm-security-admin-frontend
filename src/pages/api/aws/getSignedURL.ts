import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { NextApiRequest, NextApiResponse } from 'next';

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // ── MinIO ──────────────────────────────────────────────────────────────────
  // Endpoint interno: Next.js corre en el host, MinIO está expuesto en localhost:9000
  endpoint: process.env.AWS_S3_ENDPOINT_URL, // http://localhost:9000
  // Obligatorio con MinIO: usa /bucket/key en lugar de bucket.host/key
  forcePathStyle: true,
  // ──────────────────────────────────────────────────────────────────────────
});

type ResponseData = {
  results?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  const { key, bucket } = req.body;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  // ⚠️ La URL firmada apunta a http://localhost:9000 (accesible desde el navegador).
  // Si la URL devuelta dijera "uagrm-auth-minio:9000", reemplázala aquí:
  // const publicUrl = signedUrl.replace('http://uagrm-auth-minio:9000', process.env.AWS_S3_ENDPOINT_URL!);

  return res.status(200).json({ results: signedUrl });
}