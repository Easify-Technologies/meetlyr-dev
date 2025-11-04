export async function joinEvent({ userId, eventId, token }: { userId: string; eventId: string; token: string }) {
  console.log("📡 Sending join event request:", { userId, eventId, token }); // 👈 add this

  const res = await fetch(`/api/event/join/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, eventId }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Join Event Error:", err);
    throw new Error("Failed to join event: " + err);
  }

  return res.json();
}
