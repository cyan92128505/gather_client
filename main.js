const { loadEnvFile } = require("node:process");
const { Game } = require("@gathertown/gather-game-client");

async function main() {
  await loadEnvFile(".env");
  const API_KEY = process.env.API_KEY;
  const SPACE_ID = process.env.SPACE_ID;

  const game = new Game(SPACE_ID, () => Promise.resolve({ apiKey: API_KEY }));
  game.connect();
  game.subscribeToConnection((connected) =>
    console.log("connected?", connected),
  );
}

main();
