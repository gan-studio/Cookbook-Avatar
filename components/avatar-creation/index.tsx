"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VideoStatus } from "@/lib/types";
import { useUploadFileMutation } from "@/lib/uploadFileApi";
import {
  useCheckStatusQuery,
  useListAvatarsQuery,
  useUploadVideoMutation,
} from "@/lib/videoApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Show from "../show";
import { Progress } from "../ui/progress";

function AvatarCreation() {
  const [videoFile, setVideoFile] = useState<File>();
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(false);
  const { data: avatars, isLoading: isLoadingAvatars } = useListAvatarsQuery({
    skip: 0,
    limit: 10,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("id") as string;

  const [uploadFile, { isLoading: isUploadingFile, progress }] =
    useUploadFileMutation();
  const [uploadVideo, { isLoading: isMakingAvatar }] = useUploadVideoMutation();
  const skipPolling = !videoId || skip;
  const { data: statusData, error: statusError } = useCheckStatusQuery(
    {
      avatar_id: videoId,
    },
    {
      skip: skipPolling,
      pollingInterval: skipPolling ? 0 : 2000,
    }
  );

  useEffect(() => {
    if (
      statusData?.status === VideoStatus.Generated ||
      statusData?.status === VideoStatus.Failed
    ) {
      setSkip(true);
    }
  }, [statusData]);

  const isLoading = isUploadingFile || isMakingAvatar;

  const handleUpload = async () => {
    try {
      const videoLink = await uploadFile(videoFile!);
      const result = await uploadVideo({
        base_video_url: videoLink.data.url,
      }).unwrap();
      router.push(`?id=${result.avatar_id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to upload video. Please try again.");
    }
  };

  const alertDescription = () => {
    if (statusError) {
      return "Failed to upload video. Please try again.";
    } else if (statusData?.status === VideoStatus.Failed) {
      return "Failed to create avatar. Please try again.";
    } else if (statusData?.status === VideoStatus.Processing) {
      return "Video is being processed. Please wait.";
    } else if (statusData?.status === VideoStatus.Generated) {
      return "Avatar created successfully. Please wait while we generate your video.";
    } else {
      return "Please upload a video to get started.";
    }
  };

  return (
    <Card className="w-full max-w-md mt-8">
      <CardHeader>
        <CardTitle>1. Create/select avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={(e) => {
              setVideoFile(e.target.files![0]);
            }}
            accept="video/*"
          />
          <Button onClick={handleUpload} disabled={isLoading || !videoFile}>
            {isLoading ? "Uploading..." : "Upload Video (max 100 MB)"}
          </Button>
          <Show when={isUploadingFile}>
            <p>
              <Progress className="h-[2px]" value={progress} />
            </p>
          </Show>
          <Show
            when={!!videoId && statusData?.status !== VideoStatus.Generated}
          >
            <Alert>
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>
                {alertDescription()}
                <Show when={statusData?.status === VideoStatus.Processing}>
                  <p>Processing takes upto 1 hr.</p>
                </Show>
              </AlertDescription>
            </Alert>
          </Show>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarCreation;
