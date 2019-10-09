import express from 'express'
import multer from "multer";
import { unlink } from 'fs';
import baseContext from "../buildContext";

const router = express.Router();
var upload = multer({ dest: "uploads/" });

router.post("/files/upload", upload.single("file"), async (req, res) => {
    try {
      const { originalname, size, mimetype, path } = req.file as Express.Multer.File;
      var result = await baseContext.mutations.file.put(
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
  
router.get("/files/download/:file_id", async (req, res) => {
try {
    const fileId =  req.params.file_id;
    const path = await baseContext.mutations.file.prepare(fileId);
    const metaData = await baseContext.queries.file.getFileMetadata([fileId]);
    if(path && metaData) {
        res.download(path, metaData[0].originalFileName, () => {
        unlink(path, () => { }); // delete file once done
        });
    }
} catch (e) {
    res.status(500).send(e);
}
});

module.exports = router;