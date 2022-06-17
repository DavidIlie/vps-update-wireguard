# WireGuard VPS Public IP Updater

There are probably more efficient ways to do this, such as using a dynamic DNS but I like to complicate my life so I created this tool, which in basic terms SSHs into my DigitalOcean VPS and updates the WireGuard configuration file to point to my current IP address. This background job runs every minute.

> **Warning**: I am not responsible for any data loss that occurs when running this tool. It is recommened you make a backup of your WireGuard configuration before you run the script for the first time.

## Getting Started

You need to configure **four envionment variables**:

-  `SSH_IP` - The IP address of your SSH server.
-  `SSH_PRIVATE_KEY` - Your private key registered on the server. It needs to be encoded in [Base64](https://www.base64encode.org/).
-  `SSH_WG_FILE` - The path for your WireGuard configration file. Normally `/etc/wireguard/wg0.conf`
-  `WG_PORT` - The port of your WireGuard server. Normally `51820`.

You can deploy this via Docker with the published docker image:

```bash
docker pull https://ghcr.io/davidilie/vps-update-wireguard:latest
```

You can then deploy this on any Docker-capable machine and it should all _hopefully_ work.
