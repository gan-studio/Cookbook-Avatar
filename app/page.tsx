"use client";

import AvatarCreation from "@/components/avatar-creation";
import AvatarCreated from "@/components/avatar-creation/avatar-created";
import Show from "@/components/show";
import { VideoStatus } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { useCheckStatusQuery } from "../lib/videoApi";

function VideoUploader() {
  const [skip, setSkip] = useState(false);

  const searchParams = useSearchParams();
  const videoId = searchParams.get("id") as string;

  const { data: statusData } = useCheckStatusQuery(
    {
      avatar_id: videoId,
    },
    {
      skip: !videoId || skip,
      pollingInterval: 2000,
    }
  );

  useEffect(() => {
    if (statusData?.status === VideoStatus.Generated) {
      setSkip(true);
    }
  }, [statusData]);

  return (
    <div className="flex justify-start flex-col gap-4 p-8">
      <AvatarCreation />
      <Show when={statusData?.status === VideoStatus.Generated}>
        <AvatarCreated />
      </Show>
    </div>
  );
}

export default function VideoUploaderWrapper() {
  return (
    <Provider store={store}>
      <VideoUploader />
    </Provider>
  );
}
