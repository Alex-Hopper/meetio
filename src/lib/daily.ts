const DAILY_API_URL = "https://api.daily.co/v1";

/**
 * Max participant-minutes allowed before blocking new room creation.
 * Daily.co free tier = 10,000/month. Keep this well under to avoid charges.
 */
export const DAILY_PARTICIPANT_MINUTES_LIMIT = 5000;

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
  };
}

/**
 * Estimates participant-minutes used in the current billing month by summing
 * (max_participants × duration) for each meeting session from Daily.co's API.
 * This is a conservative overestimate (assumes all participants stayed the
 * full duration), which is intentional for a safety check.
 */
export async function getDailyUsageMinutes(): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const timeframeStart = Math.floor(startOfMonth.getTime() / 1000);

  const res = await fetch(
    `${DAILY_API_URL}/meetings?timeframe_start=${timeframeStart}&limit=100`,
    { headers: headers() }
  );

  if (!res.ok) {
    throw new Error(`Daily.co usage check failed: ${res.status}`);
  }

  const json = await res.json();
  const meetings = json.data ?? json;

  let totalMinutes = 0;
  for (const m of meetings) {
    totalMinutes +=
      ((m.max_participants ?? 0) * (m.duration ?? 0)) / 60;
  }
  return Math.ceil(totalMinutes);
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
