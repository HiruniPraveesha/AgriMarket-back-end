// types.d.ts
import 'multer';

declare module 'multer' {
  interface File {
    location?: string;
  }
}
