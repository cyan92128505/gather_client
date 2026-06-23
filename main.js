const fs = require("node:fs");
const path = require("node:path");
const { loadEnvFile } = require("node:process");
const { Game } = require("@gathertown/gather-game-client");
const { sendTelegram } = require("./telegram");


const LOG_DIR = process.env.LOG_DIR || "/app/logs";
const LOG_FILE = path.join(LOG_DIR, "app.log");

const formatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  hour12: false,
  minute: "numeric",
  weekday: "long",
  timeZone: "Asia/Taipei",
});

// Fail fast at boot if the log dir is not writable, instead of throwing per line.
fs.mkdirSync(LOG_DIR, { recursive: true });

function log(...args) {
  const line = `[${formatter.format(new Date())}] ${args.join(" ")}`;
  console.log(line);                    // keep stdout so docker logs stays alive
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function main() {
  try {
    loadEnvFile(".env");
  } catch {
    // env provided by the runtime environment (e.g. Docker compose env_file)
  }

  const { API_KEY, SPACE_ID, OWNER_NAME } = process.env;
  if (!OWNER_NAME) {
    console.error("[config] missing OWNER_NAME");
    process.exit(1);
  }
  log("[config] owner name =", OWNER_NAME);

  const game = new Game(SPACE_ID, () => Promise.resolve({ apiKey: API_KEY }));
  game.connect();
  game.subscribeToConnection((connected) => log("connected?", connected));

  game.subscribeToEvent("playerWaves", (data, context) => {
    const target = game.getPlayer(data.playerWaves.targetId);
    const targetName = target?.name?.trim() || "(unknown)";
    const isOwner = targetName.toLowerCase() === OWNER_NAME.toLowerCase();

    const targetLabel = isOwner ? `你(${OWNER_NAME})` : targetName;
    const waver = context.player?.name?.trim() || "(unknown)";
    log(`[wave] ${waver} -> ${targetName}`);

    if (isOwner) {
      // Loud only when it is aimed at you; everyone else's waves go silent.
      sendTelegram(`${waver} 在 Gather 對 ${targetLabel} 揮手了`, {
        silent: !isOwner,
      });
    }
  });
}

main();
