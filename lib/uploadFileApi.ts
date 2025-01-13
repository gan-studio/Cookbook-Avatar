import axios, { AxiosResponse } from "axios";
import React from "react";

interface UploadResponse {
  data: {
    url: string;
    size: number;
    expires: string;
    downloads: number;
  };
  status: string;
}

export const useUploadFileMutation = () => {
  const [data, setData] = React.useState<UploadResponse | null>(null);
  const [error, setError] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);

  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);
      const uninterceptedAxiosInstance = axios.create();
      const response = await uninterceptedAxiosInstance.postForm<
        any,
        AxiosResponse<UploadResponse>
      >(
        "https://tmpfiles.org/api/v1/upload",
        { file },
        {
          onUploadProgress(progressEvent) {
            setProgress(() => progressEvent?.progress! * 100);
          },
        }
      );
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return [uploadFile, { isLoading, error, data, progress }] as [
    typeof uploadFile,
    {
      isLoading: boolean;
      error: any;
      data: UploadResponse | null;
      progress: number;
    }
  ];
};
