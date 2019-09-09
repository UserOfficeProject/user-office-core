import { useState } from "react";
export function useFileUpload() {
  const [progress, setProgress] = useState<number>(80);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isAborted, setIsAborted] = useState<boolean>(false);

  const progressHandler = (event: ProgressEvent) => {
    var percent = (event.loaded / event.total) * 100;
    setProgress(percent);
  };

  const completeHandler = () => {
    setIsComplete(true);
  };

  const errorHandler = () => {
   setIsError(true);
  };

  const abortHandler = () => {
    setIsAborted(true);
  };

  const uploadFile = (file: File) => {
    var formdata = new FormData();
    formdata.append("file", file);
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", "/upload");
    ajax.send(formdata);
  };

  return { uploadFile, progress, isAborted, isError, isComplete };
}
