# RootSys Quota & Expiry Checker

A lightweight, secure, client-side web utility built with **HTML**, **Tailwind CSS**, and **JavaScript** to inspect your API key quota, token consumption rate, burn rate, and expiry status from `rootsys.cloud`.

---

## Features

- 🔒 **Client-Side Security**: Your API key stays entirely in your browser and is sent directly to the official endpoint—never stored or shared.
- 📊 **Interactive KPI Dashboard**: 
  - **Token Consumption Rate** with a visual progress bar.
  - **Burn Rate** with compacted numbers (e.g., `1.27B`, `45.2M`).
  - **Runway** simplified into clean **Days and Hours**.
  - **Remaining (%)** tracker and snapshot timestamps.
- 🎨 **Dark / Light Mode**: Automatically adapts to your system preferences with a manual toggle switch.
- 📋 **Raw JSON Inspector**: View and copy the raw API payload instantly.

---

## How to Run Locally

Because modern web browsers enforce CORS security policies on direct API fetches to external domains, running this tool locally requires one of the following methods:

### Option A: Local Dev Server
1. Clone or download this repository.
2. Spin up a local static server using Node.js:
   ```bash
   npx serve .