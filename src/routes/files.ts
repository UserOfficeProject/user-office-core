import { unlink, existsSync } from 'fs';

import express from 'express';
import multer from 'multer';

import baseContext from '../buildContext';
import { isRejection } from '../rejection';
import { logger } from '../utils/Logger';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/files/upload', upload.single('file'), async (req, res) => {
  try {
    const {
      originalname,
      size,
      mimetype,
      path,
    } = req.file as Express.Multer.File;
    const result = await baseContext.mutations.file.put(
      originalname,
      mimetype,
      size,
      path
    );
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/files/download/:file_id', async (req, res) => {
  try {
    const fileId = req.params.file_id;
    const path = await baseContext.mutations.file.prepare(fileId);
    const metaData = await baseContext.queries.file.getFileMetadata([fileId]);
    if (!isRejection(path) && metaData) {
      res.download(path, metaData[0].originalFileName, err => {
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
});

export default router;
