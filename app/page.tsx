"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoCopyStatus, VideoStatus } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import {
  useCheckStatusQuery,
  useCheckVideoCopyStatusQuery,
  useGenerateVideoCopyMutation,
  useUploadVideoMutation,
} from "../lib/videoApi";

function VideoUploader() {
  const [videoLink, setVideoLink] = useState("");
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(false);
  const [script, setScript] = useState("");
  const [skipVideoCopy, setSkipVideoCopy] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("id") as string;
  const videoCopyId = searchParams.get("inference_id") as string;

  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();
  const { data: statusData, error: statusError } = useCheckStatusQuery(
    {
      avatar_id: videoId,
    },
    {
      skip: !videoId || skip,
      pollingInterval: 2000,
    }
  );

  const [generateVideoCopy, { isLoading: isGenerating }] =
    useGenerateVideoCopyMutation();
  const { data: videoCopyStatusData } = useCheckVideoCopyStatusQuery(
    {
      inference_id: videoCopyId,
    },
    {
      skip: !videoCopyId || skipVideoCopy,
      pollingInterval: 2000,
    }
  );

  useEffect(() => {
    if (statusData?.status === VideoStatus.Generated) {
      setSkip(true);
    }
  }, [statusData]);

  useEffect(() => {
    if (videoCopyStatusData?.status === VideoCopyStatus.Generated) {
      setSkipVideoCopy(true);
    }
  }, [videoCopyStatusData]);

  const handleUpload = async () => {
    try {
      const result = await uploadVideo({
        base_video_url: videoLink,
      }).unwrap();
      router.push(`?id=${result.avatar_id}`);
    } catch (err) {
      setError("Failed to upload video. Please try again.");
    }
  };

  const handleGenerateVideoCopy = async () => {
    if (!videoId) return;
    try {
      const result = await generateVideoCopy({
        avatar_id: videoId,
        text: script,
      }).unwrap();
      router.push(`?id=${videoId}&inference_id=${result.inference_id}`);
      setSkipVideoCopy(false);
    } catch (err) {
      setError("Failed to generate video copy. Please try again.");
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Avatar Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="Enter any download video link"
            />
            <Button onClick={handleUpload} disabled={isUploading || !videoLink}>
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {videoId && statusData?.status !== VideoStatus.Generated && (
              <Alert>
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>
                  {statusError
                    ? "Failed to check status"
                    : statusData
                    ? `Generation status: ${statusData.status}`
                    : "Checking status..."}
                  {!statusError && <p>Processing takes upto 1 hr.</p>}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      <Card
        className="w-full max-w-md mx-auto mt-8"
        style={{
          display:
            statusData?.status === VideoStatus.Generated ? "block" : "none",
        }}
      >
        <CardHeader>
          <CardTitle>Video Copy Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusData?.status === VideoStatus.Generated && (
              <>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your script for video copy"
                />
                <Button
                  onClick={handleGenerateVideoCopy}
                  disabled={isGenerating || !script}
                >
                  {isGenerating ? "Generating..." : "Generate Video Copy"}
                </Button>
              </>
            )}
            {videoCopyId &&
              videoCopyStatusData?.status !== VideoCopyStatus.Generated && (
                <Alert>
                  <AlertTitle>Video Copy Status</AlertTitle>
                  <AlertDescription>
                    {videoCopyStatusData?.status === VideoCopyStatus.Failed
                      ? "Failed to check video copy status"
                      : videoCopyStatusData
                      ? `Status: ${videoCopyStatusData.status}`
                      : "Checking status..."}
                  </AlertDescription>
                </Alert>
              )}
            {videoCopyStatusData?.status === VideoCopyStatus.Generated &&
              videoCopyStatusData.video && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Generated Video Copy
                  </h3>
                  <video controls className="w-full">
                    <source src={videoCopyStatusData.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function VideoUploaderWrapper() {
  return (
    <Provider store={store}>
      <VideoUploader />
    </Provider>
  );
}
