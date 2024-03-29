import { Injectable, Inject } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class UploadsService {
  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {}
  AWS_S3_BUCKET = this.parameters.RABBLE_AWS_BUCKET_NAME;
  s3 = new S3Client({
    credentials: {
      accessKeyId: this.parameters.RABBLE_AWS_ACCESS_KEY_ID,
      secretAccessKey: this.parameters.RABBLE_AWS_SECRET_ACCESS_KEY,
    },
    region: 'us-east-2',
  });

  async uploadFile(
    file: Express.Multer.File,
    folderName: string,
    imageKey = '',
  ) {
    const { originalname } = file;
    try {
      const parallelUploads3 = new Upload({
        client: this.s3,
        params: {
          Bucket: this.AWS_S3_BUCKET,
          Key: `${folderName}${uuid()}-${originalname}`,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
          ContentDisposition: 'inline',
        },
      });

      if (imageKey) {
        await this.s3Delete(imageKey);
      }

      return await parallelUploads3.done();
    } catch (err) {
      console.error(err);
    }
  }

  async s3Delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    });

    try {
      await this.s3.send(command);
    } catch (err) {
      console.error(err);
    }
  }
}
