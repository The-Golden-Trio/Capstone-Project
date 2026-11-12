import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '../../config/env';
import type { StorageService } from './storage.port';

/** S3 hoặc MinIO (dev: infra/local/dev-stack.yml). */
export class S3StorageAdapter implements StorageService {
  readonly available: boolean;
  private readonly client: S3Client | null;
  /** Ký URL bằng endpoint trình duyệt thấy được (MinIO trong docker vs localhost). */
  private readonly publicClient: S3Client | null;
  private readonly bucket: string;

  constructor(
    env: Pick<
      Env,
      | 'S3_ENDPOINT'
      | 'S3_PUBLIC_ENDPOINT'
      | 'S3_REGION'
      | 'S3_BUCKET'
      | 'S3_ACCESS_KEY'
      | 'S3_SECRET_KEY'
    >,
  ) {
    this.bucket = env.S3_BUCKET;
    this.available = Boolean(
      env.S3_ENDPOINT && env.S3_ACCESS_KEY && env.S3_SECRET_KEY,
    );
    const make = (endpoint: string | undefined) =>
      this.available && endpoint
        ? new S3Client({
            endpoint,
            region: env.S3_REGION,
            forcePathStyle: true,
            credentials: {
              accessKeyId: env.S3_ACCESS_KEY as string,
              secretAccessKey: env.S3_SECRET_KEY as string,
            },
          })
        : null;
    this.client = make(env.S3_ENDPOINT);
    this.publicClient = make(env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT);
  }

  private require(client: S3Client | null): S3Client {
    if (!client) throw new Error('Chưa cấu hình kho object (S3_ENDPOINT)');
    return client;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.require(this.client).send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  signedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      this.require(this.publicClient),
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
