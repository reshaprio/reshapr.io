---
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Try reShapr online

The fastest way to experience reShapr is through our hosted online environment: no installation required 🙌

Head over to **[try.reshapr.io](https://try.reshapr.io/)** to get started instantly.

## Prerequisites

- A GitHub or Google account
- Node.js 20 or later to install the CLI
- A browser allowed to open the CLI authentication callback

## Login workflow

### Step 0 - Use your preferred web browser

And go to:

```shell
https://try.reshapr.io
```

![Step 0 — Use your preferred web browser and go to the reShapr Try](/img/docs/try-reshapr-online-0.png)

### Step 1 — Choose an authentication provider

Select **GitHub** or **Google** to authenticate with the reShapr online try.

![Step 1 — Select GitHub or Google to authenticate with reShapr Try](/img/docs/try-reshapr-online-1.png)

### Step 2 — Sign in with your provider

Enter your credentials. In this example, we are using GitHub.

![Step 2 — GitHub sign-in form for reShapr Try authentication](/img/docs/try-reshapr-online-2.png)

### Step 3 — Two-factor authentication

If you have two-factor authentication enabled, complete the verification step.

![Step 3 — Two-factor authentication prompt during GitHub login](/img/docs/try-reshapr-online-3.png)

### Step 4 — Setup your try org name

You can customize your trial organization (change its default name if you’d like).

![Step 4 — Customize your trial organization and follow the instructions](/img/docs/try-reshapr-online-4.png)

Then install the CLI:

```shell
npm install -g @reshapr/reshapr-cli --allow-scripts=@scarf/scarf
```

and log in to Reshapr online:

```shell
reshapr login -s https://try.reshapr.io
```

### Step 5 — Authenticate with the CLI

When the browser opens, authorize the CLI — the token is valid for **2 hours**.

![Step 5 — Authorize the reShapr CLI in the browser](/img/docs/try-reshapr-online-5.png)

### Step 6 — You're all set!

Login is successful. You can now use the CLI to import APIs, create expositions, and manage MCP servers.

![Step 6 — CLI login successful, ready to use reShapr](/img/docs/try-reshapr-online-6.png)

### Step 7 — Access the online dashboard

Once authenticated, you can go back to `https://try.reshapr.io` and you'll land on the reShapr Try dashboard.

![Step 7 — reShapr Try online dashboard after successful login](/img/docs/try-reshapr-online-7.png)

## Result

Your browser session and CLI are authenticated against the hosted reShapr environment. `reshapr info` should show your trial organization and server.

## Limits

- The CLI token is valid for two hours. Run `reshapr login -s https://try.reshapr.io` again after it expires.
- The hosted trial is shared infrastructure intended for evaluation, not production workloads.
- Identifiers, organization names, endpoints, and dashboard contents differ between accounts.

## Next step

Continue with **[Your First MCP Endpoint, End to End](./getting-started.md)**. It imports a versioned Open-Meteo contract, creates an Exposition in this environment, and calls the generated weather Tool.
