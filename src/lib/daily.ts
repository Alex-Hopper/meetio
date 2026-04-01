const DAILY_API_URL = "https://api.daily.co/v1";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
  };
}

export async function createDailyRoom(roomName: string) {
  const res = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: roomName,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, // 4-hour expiry
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daily.co room creation failed: ${res.status} ${body}`);
  }

  return (await res.json()) as { name: string; url: string };
}

export async function deleteDailyRoom(roomName: string) {
  const res = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Daily.co room deletion failed: ${res.status} ${body}`);
  }
}
