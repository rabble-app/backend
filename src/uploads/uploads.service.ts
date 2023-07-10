import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadsService {
  AWS_S3_BUCKET = process.env.RABBLE_AWS_BUCKET_NAME;
  s3 = new S3({
    accessKeyId: process.env.RABBLE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RABBLE_AWS_SECRET_ACCESS_KEY,
  });

  async uploadFile(
    file: Express.Multer.File,
    folderName: string,
    imageKey = '',
  ) {
    const { originalname } = file;
    const result = await this.s3Upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      `${folderName}${uuid()}-${originalname}`,
      file.mimetype,
    );

    if (imageKey) {
      await this.s3Delete(imageKey);
    }

    return result;
  }

  async s3Upload(file: Buffer, bucket: string, name: string, mimetype: string) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: process.env.RABBLE_AWS_REGION,
      },
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {
      console.log(e);
    }
  }

  async s3Delete(key: string) {
    try {
      await this.s3
        .deleteObject({ Bucket: this.AWS_S3_BUCKET, Key: key })
        .promise();
    } catch (e) {
      console.log(e);
    }
  }
}
