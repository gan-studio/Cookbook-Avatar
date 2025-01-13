export async function POST(request: Request) {
  const data = await request.json();
  /* 
        API reference -> https://developer.gan.ai/webhooks
        {
            "event_type": "avatar_event",
            "data": {
                    "avatar_id": "your_avatar_id",
                    "status": "processing"
                }
        }
    */
}
