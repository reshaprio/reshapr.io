# Try reShapr online

The fastest way to experience reShapr is through our hosted online environment — no installation required.

Head over to [try.reshapr.io](https://try.reshapr.io/) to get started instantly.

## Login workflow

### Step 1 — Choose an authentication provider

Select **GitHub** or **Google** to authenticate with the reShapr online try.

![Step 1 — Select GitHub or Google to authenticate with reShapr Try](/img/docs/try-reshapr-online-1.png)

### Step 2 — Sign in with your provider

Enter your credentials. In this example we are using GitHub.

![Step 2 — GitHub sign-in form for reShapr Try authentication](/img/docs/try-reshapr-online-2.png)

### Step 3 — Two-factor authentication

If you have two-factor authentication enabled, complete the verification step.

![Step 3 — Two-factor authentication prompt during GitHub login](/img/docs/try-reshapr-online-3.png)

### Step 4 — Access the online dashboard

Once authenticated, you land on the reShapr Try dashboard.

![Step 4 — reShapr Try online dashboard after successful login](/img/docs/try-reshapr-online-4.png)

### Step 5 — Authenticate with the CLI

Press `Ctrl+C` in the browser and log in using the reShapr CLI. When the browser opens, authorize the CLI — the token is valid for **2 hours**.

```shell
❯ reshapr login -s https://try.reshapr.io
ℹ️  Opening browser: https://try.reshapr.io/cli/login?redirect_uri=http://localhost:5556
ℹ️  Listening for authentication callback on http://localhost:5556
^C
❯ reshapr login -s https://try.reshapr.io
ℹ️  Opening browser: https://try.reshapr.io/cli/login?redirect_uri=http://localhost:5556
ℹ️  Listening for authentication callback on http://localhost:5556
✅ Login successful!
ℹ️  Welcome, yada!
ℹ️  Organization: yada
✅ Configuration saved to /Users/yacine/.reshapr/config
```

![Step 5 — Authorize the reShapr CLI in the browser](/img/docs/try-reshapr-online-5.png)

### Step 6 — You're all set!

Login is successful. You can now use the CLI to import APIs, create expositions, and manage MCP servers. Follow the instructions in the [Getting Started](/docs/tutorials/getting-started) tutorial to continue.

![Step 6 — CLI login successful, ready to use reShapr](/img/docs/try-reshapr-online-6.png)

