declare module 'multer-s3' {
    import { StorageEngine } from 'multer';
    import AWS from 'aws-sdk';
  
    interface Options {
      s3: AWS.S3;
      bucket: string;
      acl?: string;
      key?: (req: any, file: any, cb: (error: any, key?: string) => void) => void;
      metadata?: (req: any, file: any, cb: (error: any, metadata?: any) => void) => void;
      contentType?: (req: any, file: any, cb: (error: any, mime?: string) => void) => void;
      cacheControl?: (req: any, file: any, cb: (error: any, cacheControl?: string) => void) => void;
      serverSideEncryption?: string;
    }
  
    function multerS3(options: Options): StorageEngine;
  
    export = multerS3;
  }
  