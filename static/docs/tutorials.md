# reShapr — Tutorials

https://reshapr.io/docs/tutorials/getting-started

---

## Try reShapr Online

https://reshapr.io/docs/tutorials/try-reshapr-online

The fastest way to experience reShapr — no installation required. Head to https://try.reshapr.io to get started instantly.

### Login workflow

1. **Choose an authentication provider** — Select GitHub or Google to authenticate.
2. **Sign in with your provider** — Enter your credentials (e.g. GitHub login).
3. **Two-factor authentication** — If enabled, complete the verification step.
4. **Access the online dashboard** — Once authenticated, you land on the reShapr Try dashboard.
5. **Authenticate with the CLI** — Press Ctrl+C in the browser and log in using the reShapr CLI:
   ```bash
   reshapr login -s https://try.reshapr.io
   ```
   When the browser opens, authorize the CLI — the token is valid for 2 hours.
6. **You're all set!** — Login successful. Follow the Getting Started tutorial to continue.

---

## Getting Started with CLI

https://reshapr.io/docs/tutorials/getting-started

### Installation

```bash
npm install -g @reshapr/reshapr-cli
reshapr --version   # → 0.0.5
```

### Login

```bash
reshapr login -s https://try.reshapr.io
```

### Core workflow

**Step 1 — Import an artifact** (discovers the Service automatically):

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml
# → Discovered Service Open-Meteo APIs with ID: 0PXEW1ZDWFCZS
```

**Step 2 — Create a Configuration Plan** (define backend endpoint + security):

```bash
reshapr config create 'open-meteo-manual' \
  --serviceId 0PXEW1ZDWFCZS \
  --backendEndpoint https://api.open-meteo.com
# → Configuration plan created with ID: 0PXPDMB4MFE6H
```

**Step 3 — Expose** (deploy to a Gateway Group):

```bash
reshapr expo create --configuration 0PXPDMB4MFE6H --gateway-group 1
# → Endpoint: mcp.try.reshapr.io/mcp/<org>/Open-Meteo+APIs/1.0
```

### All-in-one magic command

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml \
  --backendEndpoint https://api.open-meteo.com
# → Endpoint: mcp.try.reshapr.io/mcp/<org>/Open-Meteo+APIs/1.0
```

---

*For the full site index see https://reshapr.io/llms.txt*
