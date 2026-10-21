# Workflow Studio

Workflow Studio automates the process of moving a newly issued Coursera
certificate to a portfolio and LinkedIn:

1. Opens Coursera and reads the latest certificate.
2. Skips processing when the certificate was already handled.
3. Downloads the certificate PDF.
4. Logs in to the Portfolio API and creates/resolves the issuer, skills, and
   certificate.
5. Uses OpenAI to generate a LinkedIn post.
6. Publishes the post and adds the certificate to the LinkedIn profile.

The automation uses Playwright persistent browser profiles. This means the
browser sessions for Coursera and LinkedIn can be authenticated once and
reused on later runs.

## Requirements

- Windows with PowerShell
- Node.js 20 LTS or newer
- npm
- Accounts with access to:
  - Coursera, including a certificate to process
  - LinkedIn
  - The Portfolio admin API
  - OpenAI API

Node.js 20 is recommended because the project uses the built-in `fetch` API
when downloading the Coursera PDF.

## Installation

Clone the repository and open a PowerShell terminal at the repository root:

```powershell
git clone <repository-url>
Set-Location .\Workflow-Studio
```

Install the pinned dependencies from `package-lock.json`:

```powershell
npm ci
```

Install the Playwright Chromium browser if it is not already installed:

```powershell
npx playwright install chromium
```

Create the local directory used for downloaded certificates:

```powershell
New-Item -ItemType Directory -Force `
  -Path 'D:\OneDrive\Desktop\Certificates'
```

If your OneDrive or certificate location is different, update the
`pdfPath` in `src/coursera/scrapper.js` and the `pdfPath` in
`src/linkedin/certificates.js` to the same writable location.

## Configuration

Create a `.env` file in the repository root. Do not commit this file.

```dotenv
ADMIN_EMAIL=your-portfolio-admin-email
ADMIN_PASSWORD=your-portfolio-admin-password
OPENAI_API_KEY=your-openai-api-key
```

The credentials are used as follows:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` authenticate against the configured
  Portfolio admin API.
- `OPENAI_API_KEY` generates the LinkedIn post using the `gpt-4o-mini` model.

The Portfolio API base URL is currently configured in
`src/portfolio/api.js`:

```text
https://portify-backend-5xiz.onrender.com/api/admin
```

Change that file if the Portfolio API is hosted elsewhere.

## First-run browser authentication

Each service uses a separate persistent profile under `profiles\`:

| Service | Profile directory | URL |
| --- | --- | --- |
| Coursera | `profiles\coursera` | `https://www.coursera.org` |
| LinkedIn | `profiles\linkedin` | `https://www.linkedin.com/feed/` |
| ChatGPT | `profiles\chatgpt` | `https://chatgpt.com` |

The Portfolio integration does not use a browser profile. It authenticates
through the API with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

Before running the full workflow, authenticate the browser profiles:

1. Run the automation from the repository root.
2. When the Coursera browser opens, sign in manually if required.
3. Complete any MFA or verification steps.
4. Leave the browser session available for the workflow to continue.
5. Complete the same process for LinkedIn when its browser opens.

Playwright stores session data in the profile directories, so subsequent runs
normally do not require another login. If a session expires, sign in again
using the corresponding profile.

Do not copy, publish, or commit these profile directories. They may contain
cookies and other sensitive browser data. The repository `.gitignore` excludes
`profiles\`, `node_modules\`, `.env`, and the generated automation state.

## Run the certificate automation

There is currently no npm script for the workflow, so run the entry point
directly:

```powershell
node .\src\automation\certificateAutomation.js
```

Run the command from the repository root. The workflow expects
`src\automation\state.json` relative to the current working directory.

The workflow pauses on the LinkedIn page near the end with Playwright's
inspector because `page.pause()` is intentionally left in the automation
script while it is being tested. Use the Playwright inspector to resume the
script. The certificate ID is saved to
`src\automation\state.json` only after the LinkedIn steps finish
successfully.

### What a successful run does

- Scrapes the latest certificate from Coursera.
- Writes a PDF named after the certificate to
  `D:\OneDrive\Desktop\Certificates`.
- Resolves the issuer and skills and creates the certificate in the Portfolio
  service.
- Generates and publishes a LinkedIn post.
- Adds the certificate and its PDF to the LinkedIn profile.
- Stores the processed certificate ID in `src\automation\state.json`.

If the latest Coursera certificate ID matches the saved ID, the workflow
prints `No new certificate found.` and stops without making changes.

## Optional ChatGPT browser launcher

The ChatGPT launcher can be run independently:

```powershell
node .\src\automation\gpt.js
```

This opens the persistent `profiles\chatgpt` browser profile at
`https://chatgpt.com`. It is separate from the OpenAI API call used to
generate LinkedIn posts.

## Troubleshooting

### Browser does not start

Run the browser installation again:

```powershell
npx playwright install chromium
```

Close other Chromium instances using the same profile and retry. A persistent
browser profile cannot be opened by multiple browser processes at the same
time.

### Coursera or LinkedIn requires login again

Sign in manually in the browser window opened by the workflow. If the profile
is corrupted, close all related browser processes and rename the affected
profile directory, for example:

```powershell
Rename-Item .\profiles\linkedin .\profiles\linkedin.backup
```

The next run creates a fresh profile. Keep the backup until the new login has
been verified.

### Portfolio authentication fails

Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then verify that the
Portfolio API URL in `src\portfolio\api.js` is reachable. API failures are
printed with the request, HTTP status, and response body.

### OpenAI generation fails

Check `OPENAI_API_KEY` and confirm that the account can use the configured
`gpt-4o-mini` model. The key is loaded from the root `.env` file.

### Certificate PDF cannot be uploaded

Confirm that `D:\OneDrive\Desktop\Certificates` exists and that the path is
writable. The downloaded filename is based on the certificate title, so avoid
certificate titles containing characters that Windows does not permit in file
names. If the folder is elsewhere, update both PDF paths described in the
installation section.

### A certificate is skipped unexpectedly

The last processed certificate ID is stored in
`src\automation\state.json`. To process the current certificate again, remove
that file and rerun the workflow:

```powershell
Remove-Item .\src\automation\state.json
```

Only remove this file when you understand that the Portfolio and LinkedIn
steps may be repeated.

## Project structure

```text
src/
  automation/
    certificateAutomation.js  # End-to-end certificate workflow
    gpt.js                    # Optional ChatGPT browser launcher
    state.js                  # Last processed certificate ID
  browser/
    browser.js                # Persistent Playwright browser setup
    profiles.js               # Profile names
  chatgpt/                    # ChatGPT browser launcher
  coursera/                   # Coursera login and certificate scraping
  linkedin/                   # LinkedIn login, posts, and certificates
  portfolio/                  # Portfolio API authentication and resources
profiles/                     # Local browser sessions; do not commit
```

## Testing

No automated tests are currently defined. The `npm test` command is still the
default placeholder from the initial project setup and exits with an error.
Validate changes by running the relevant workflow carefully with test accounts
or by exercising the affected module against a controlled environment.