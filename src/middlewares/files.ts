import { existsSync, unlink } from 'fs';

import { logger } from '@user-office-software/duo-logger';
import express, { Request, Response } from 'express';
import multer from 'multer';

import baseContext from '../buildContext';
import { isRejection } from '../models/Rejection';

const files = () => {
  const router = express.Router();
  const upload = multer({ dest: 'uploads/' });
  const fileDownloadHandler = async (req: Request, res: Response) => {
    try {
      const fileId = req.params.file_id;
      const path = await baseContext.mutations.file.prepare(fileId);
      const metaData = await baseContext.queries.file.getFileMetadata([fileId]);
      if (!isRejection(path) && metaData) {
        res.download(path, metaData[0].originalFileName, (err) => {
          if (err) {
            throw err;
          }
          if (existsSync(path)) {
            unlink(path, () => {
              // delete file once done
            });
          }
        });
      } else {
        throw new Error('Could not prepare file');
      }
    } catch (e) {
      logger.logException('Could not download file', e, { req });
      res.status(500).send(e);
    }
  };

  const fileUploadHandler = async (req: Request, res: Response) => {
    try {
      const { originalname, size, mimetype, path } =
        req.file as Express.Multer.File;
      const result = await baseContext.mutations.file.put(
        originalname,
        mimetype,
        size,
        path
      );
      if (!isRejection(result)) {
        res.status(200).send(result);
      } else {
        res.status(500).send(result);
      }
    } catch (e) {
      logger.logException('Could not upload file', e, { req });
      res.status(500).send(e);
    }
  };

  router.get('/files/download/:file_id', fileDownloadHandler);

  router.post('/files/upload', upload.single('file'), fileUploadHandler);

  return router;
};

export default files;
