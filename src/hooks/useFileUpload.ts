import { useState } from "react";
import { FileMetaData } from "../model/FileUpload";
import { useDataAPI } from "./useDataAPI";

export enum UPLOAD_STATE 
{
  PRISTINE,
  UPLOADING,
  COMPLETE,
  ERROR,
  ABORTED
}

export function useFileUpload() 
{
  const [progress, setProgress] = useState<number>(0);
  const [state, setState] = useState<UPLOAD_STATE>(UPLOAD_STATE.PRISTINE);

  const reset = () => 
  {
    setProgress(0);
    setState(UPLOAD_STATE.PRISTINE);
  }

  const uploadFile = (file: File, completeHandler:Function) => 
  {
    setState(UPLOAD_STATE.UPLOADING);
    var formdata = new FormData();
    formdata.append("file", file);
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => 
      {
        var percent = (event.loaded / event.total) * 100;
        setProgress(percent);
      }, false);

    xhr.addEventListener("load", (event) => {
      const {responseText} = event.currentTarget as XMLHttpRequest;
      try 
        {
          if(responseText)
          {
            const metaData: FileMetaData = JSON.parse(responseText);
            completeHandler(metaData);
            reset(); //auto reset
          }
        }
        catch(e) 
        {
          setState(UPLOAD_STATE.ERROR)
        }
     }, false);

    xhr.addEventListener("error", () => { setState(UPLOAD_STATE.ERROR) }, false);

    xhr.addEventListener("abort", () => { setState(UPLOAD_STATE.ABORTED) }, false);

    xhr.open("POST", "/files/upload");
    xhr.send(formdata);
  };

  return { uploadFile, progress, state };
}


export function useGetFileMetadata() {
  const sendRequest = useDataAPI();
  const [filesMetadata, setFilesMetadata] = useState<FileMetaData[]>([]);
  const getFileMetadata = (fileIds:string[]) => {
    const query = `
        query($fileIds: [String]!) {
          fileMetadata(fileIds: $fileIds) {
            fileId
            originalFileName
            mimeType
            sizeInBytes
            createdDate
          }
        }`;

      const variables = {
        fileIds
      };
      sendRequest(query, variables).then(data => {
        setFilesMetadata(data.fileMetadata)
      });
  }

  return { getFileMetadata, filesMetadata }
}