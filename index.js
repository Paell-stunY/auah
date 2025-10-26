import fetch from "node-fetch";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const CHECK_URL = process.env.CHECK_URL || "https://hoang.cloud/status_trial_ugphone";
const CHANNEL_ID = process.env.CHANNEL_ID;
let lastStatus = "unknown";

async function checkStock() {
  try {
    const res = await fetch(CHECK_URL);
    const text = await res.text();

    const hasStock = /Available|In Stock|✅|🟢/i.test(text);
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (hasStock && lastStatus !== "available") {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🎉 Trial Stock Available!")
        .setDescription("UGPhone trial is now available in one or more regions.")
        .addFields({ name: "Check Here", value: `[Open Status Page](${CHECK_URL})` })
        .setTimestamp();

      await channel.send({ content: "@everyone", embeds: [embed] });
      console.log("✅ Stock detected — notification sent.");
      lastStatus = "available";
    } else if (!hasStock && lastStatus !== "empty") {
      console.log("❌ Out of stock.");
      lastStatus = "empty";
    }
  } catch (err) {
    console.error("Error checking stock:", err);
  }
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  checkStock();
  setInterval(checkStock, 60000); // every 1 min
});

client.login(process.env.DISCORD_TOKEN);
