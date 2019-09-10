import { useState } from "react";
import { FileMetaData } from "../model/FileUpload";

export enum UPLOAD_STATE 
{
  PRISTINE,
  UPLOADING,
  COMPLETE,
  ERROR,
  ABORTED
}

export function useFileUpload(completeHandller:Function) 
{
  const [progress, setProgress] = useState<number>(0);
  const [state, setState] = useState<UPLOAD_STATE>(UPLOAD_STATE.PRISTINE);

  const progressHandler = (event: ProgressEvent) => 
  {
    var percent = (event.loaded / event.total) * 100;
    setProgress(percent);
  };

  const completeHandler = (data:any) => 
  {
    try 
    {
      const responseText = data.target.responseText;
      if(responseText)
      {
        const metaData: FileMetaData = JSON.parse(responseText);
        completeHandller(metaData);
        reset(); //auto reset
      }
    }
    catch(e) 
    {
      setState(UPLOAD_STATE.ERROR)
    }
  };

  const reset = () => 
  {
    setProgress(0);
    setState(UPLOAD_STATE.PRISTINE);
  }

  const uploadFile = (file: File) => 
  {
    setState(UPLOAD_STATE.UPLOADING);
    var formdata = new FormData();
    formdata.append("file", file);
    const ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", () => { setState(UPLOAD_STATE.ERROR) }, false);
    ajax.addEventListener("abort", () => { setState(UPLOAD_STATE.ABORTED) }, false);
    ajax.open("POST", "/upload");
    ajax.send(formdata);
  };

  return { uploadFile, progress, state };
}


