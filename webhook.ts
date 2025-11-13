import axios from "axios";

async function triggerMatchGroup(): Promise<void> {
  try {
    const url = "https://app.meetlyr.com/api/event/matchGroup";
    const response = await axios.get(url);

    console.log(`[${new Date().toISOString()}] Webhook triggered successfully:`);
    console.log(response.data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to trigger webhook:, error.message`);
  }
}

triggerMatchGroup();