# Gather Wave Notifier

A small Node.js service that connects to a Gather space and posts a Telegram
message whenever a player is waved at. Waves aimed at a chosen person are sent
with sound; every other wave is posted silently.

Built on the [Gather game client](http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/index.html).

## How it works

The service connects to a Gather space as a headless API client and listens for
`playerWaves` events. For each wave it resolves who was waved at and posts to
Telegram:

- Wave aimed at `OWNER_NAME` → message with a notification (sound).
- Any other wave → message sent silently (`disable_notification`).

It reports every wave in the space, not only the owner's, so a busy space
produces a steady stream of silent messages.

## Prerequisites

- Docker and Docker Compose v2 (the `docker compose` command, with a space).
- A Gather API key, a Telegram bot, and a Telegram chat to post into.

That is all that is needed on the host; the application itself runs inside the
container.

## Configuration

Copy `.env.example` to `.env` and fill it in file in the project root with these five values:

```
API_KEY=your_gather_api_key
SPACE_ID=xxxxxxxxxxxxxxxx\your-space-name
OWNER_NAME=Display Name To Watch
TG_BOT_TOKEN=123456:ABC...
TG_CHAT_ID=-1001234567890
```

Never commit `.env`. It is already listed in `.gitignore` and `.dockerignore`,
so it stays on the host and is not baked into the image.

### Where each value comes from

**API_KEY** — create one at https://app.gather.town/apikeys.

**SPACE_ID** — open the space and look at the URL
`https://app.gather.town/app/<id>/<name>`. The space id is the two segments
joined with a backslash: `<id>\<name>` (for example `wS6oJCz9Nw6IIetI\vvvspace`).

**OWNER_NAME** — the Gather display name of the person you want to be notified
about, copied exactly (see Notes on matching).

**TG_BOT_TOKEN** — create a bot by messaging @BotFather in Telegram and copy the
token it returns.

**TG_CHAT_ID** — the chat the bot will post into:

1. Send any message to the bot. For a group, add the bot to the group and
   mention it (`@yourbot`).
2. Open `https://api.telegram.org/bot<TG_BOT_TOKEN>/getUpdates` in a browser.
3. Read `result[].message.chat.id`. Direct chats are positive numbers; groups
   are negative; supergroups start with `-100`.

If `getUpdates` returns nothing, send the message again — updates are
short-lived. If the bot previously had a webhook configured, call
`https://api.telegram.org/bot<TG_BOT_TOKEN>/deleteWebhook` once, then retry.

## Deploy

```
make up        # build the image and start the container (detached)
make logs      # follow logs; look for "connected? true" and the owner name
```

To make the service come back automatically after a host reboot, run once:

```
make enable    # enable the Docker daemon on boot (needs sudo)
```

With `restart: unless-stopped` set in `docker-compose.yml`, the container is
brought back after a reboot as long as the Docker daemon is enabled on boot.

### Verify

With the service running, have someone wave at `OWNER_NAME` in the space. A
Telegram message with sound should arrive. A wave between two other people
should arrive silently.

## Make targets

| Command        | Action                                                  |
| -------------- | ------------------------------------------------------- |
| `make up`      | Build the image and start the container (detached)      |
| `make down`    | Stop and remove the container                           |
| `make restart` | Restart the service                                     |
| `make logs`    | Follow the logs                                         |
| `make ps`      | Show container status                                   |
| `make build`   | Rebuild the image only                                  |
| `make enable`  | One-time: enable the Docker daemon on boot (needs sudo) |

## Notes

- `OWNER_NAME` is matched exactly against the Gather display name. Leading and
  trailing whitespace is trimmed; the rest is case-sensitive. If it does not
  match, the owner's waves are treated like anyone else's (silent).
- Gather display names are not unique. If two people share a name, both will
  trigger the loud notification.
- If the watched person renames themselves in Gather, update `OWNER_NAME` and
  redeploy with `make up`.

## Local development

Requires Node.js 20.12 or newer (for `process.loadEnvFile` and global `fetch`).

```
npm install
# create .env as described above
npm start
```