const { loadEnvFile } = require("node:process");
const { Game } = require("@gathertown/gather-game-client");
const { sendTelegram } = require("./telegram");

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
  console.log("[config] owner name =", OWNER_NAME);

  const game = new Game(SPACE_ID, () => Promise.resolve({ apiKey: API_KEY }));
  game.connect();
  game.subscribeToConnection((connected) =>
    console.log("connected?", connected),
  );

  game.subscribeToEvent("playerWaves", (data, context) => {
    const target = game.getPlayer(data.playerWaves.targetId);
    const targetName = target?.name?.trim() || "(unknown)";
    const isOwner = targetName === OWNER_NAME;

    const targetLabel = isOwner ? `你(${OWNER_NAME})` : targetName;
    const waver = context.player?.name?.trim() || "(unknown)";
    console.log(`[wave] ${waver} -> ${targetName}`);
    if (isOwner) {
      // Loud only when it is aimed at you; everyone else's waves go silent.
      sendTelegram(`${waver} 在 Gather 對 ${targetLabel} 揮手了`, {
        silent: !isOwner,
      });
    }
      
  });
}

main();
