declare module 'multer-s3' {
  import { StorageEngine } from 'multer';
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

  interface Options {
    s3: S3Client;
    bucket: string;
    key?: (req: Express.Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => void;
    acl?: string;
    contentType?: (req: Express.Request, file: Express.Multer.File, cb: (error: any, mime?: string) => void) => void;
    metadata?: (req: Express.Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => void;
  }

  function multerS3(options: Options): StorageEngine;

  export = multerS3;
}
