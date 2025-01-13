"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { VideoCopyStatus, VideoStatus } from "@/lib/types";
import {
  useCheckStatusQuery,
  useCheckVideoCopyStatusQuery,
  useGenerateVideoCopyMutation,
} from "@/lib/videoApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Show from "../show";

function AvatarCreated() {
  const [skipVideoCopy, setSkipVideoCopy] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("id") as string;
  const videoCopyId = searchParams.get("inference_id") as string;
  const [script, setScript] = useState("");
  const [generateVideoCopy, { isLoading: isGenerating }] =
    useGenerateVideoCopyMutation();
  const [error, setError] = useState("");

  const { data: statusData } = useCheckStatusQuery(
    {
      avatar_id: videoId,
    },
    {
      skip: !videoId,
      pollingInterval: 2000,
    }
  );

  const { data: videoCopyStatusData, error: videoCopyError } =
    useCheckVideoCopyStatusQuery(
      {
        inference_id: videoCopyId,
      },
      {
        skip: !videoCopyId || skipVideoCopy,
        pollingInterval: 2000,
      }
    );

  useEffect(() => {
    if (videoCopyStatusData?.status === VideoCopyStatus.Generated) {
      setSkipVideoCopy(true);
    }
  }, [videoCopyStatusData]);

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

  const alertDescription = () => {
    if (videoCopyError) {
      return "Failed to generate video copy. Please try again.";
    } else if (videoCopyStatusData?.status === VideoCopyStatus.Failed) {
      return "Failed to create video copy. Please try again.";
    } else if (videoCopyStatusData?.status === VideoCopyStatus.Processing) {
      return "Video copy is being processed. Please wait.";
    }
    return "";
  };

  return (
    <Card className="w-full max-w-md mt-8">
      <CardHeader>
        <CardTitle>2. Avatar Copy Creation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Show when={statusData?.status === VideoStatus.Generated}>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your script for avatar copy"
            />
            <Button
              onClick={handleGenerateVideoCopy}
              disabled={isGenerating || !script}
            >
              {isGenerating ? "Generating..." : "Generate avatar Copy"}
            </Button>
          </Show>
          <Show
            when={
              !!videoCopyId &&
              !!videoCopyStatusData &&
              videoCopyStatusData?.status !== VideoCopyStatus.Generated
            }
          >
            <Alert>
              <AlertTitle>Avatar Video Status</AlertTitle>
              <AlertDescription>{alertDescription()}</AlertDescription>
            </Alert>
          </Show>
          <Show
            when={
              videoCopyStatusData?.status === VideoCopyStatus.Generated &&
              !!videoCopyStatusData.video
            }
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Generated Video Copy
              </h3>
              <video controls className="w-full">
                <source src={videoCopyStatusData?.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Show>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarCreated;
