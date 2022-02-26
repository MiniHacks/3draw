# 3Draw.live

To run: 
- install [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/#macos)
- **copy the cert.pem in Discord to `~/.cloudflared/` (you may need to rename it to cert.pem or cert.cer)**
- install packages with `yarn install`
- run `yarn start -- -h <name>.3draw.live`
- live-reloading website will be available at `https://<name>.3draw.live`
  - you may still need to refresh the static html though, it's only hot-reloading the server
