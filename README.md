# Tone playtest

A self-guided feedback form for friends testing Tone on TestFlight. Testers work through 11 tasks in the app, rate each one from 0 (couldn't do it) to 5 (super easy), and share a few overall thoughts. Answers go to a Google Sheet.

**Live form:** https://lachiebanham-collab.github.io/tone-playtest/

## Connecting the Google Sheet (one-time, ~5 min)

1. Create a new Google Sheet (e.g. "Tone playtest responses").
2. In the sheet, go to **Extensions → Apps Script**. Delete the starter code, paste in everything from [`apps-script.gs`](apps-script.gs), and save.
3. Click **Deploy → New deployment**. Under the gear icon, choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**. Approve the permissions prompt: it may warn that the app isn't verified. Click *Advanced → Go to (project)*. It's your own script.
4. Copy the **Web app URL** (it ends in `/exec`).
5. Paste it into `SCRIPT_URL` at the top of `shared.js`, then commit and push.

Opening the `/exec` URL in a browser should show "Tone playtest collector is running." Until `SCRIPT_URL` is set, the form shows a "not connected yet" notice and offers testers a **Copy my answers** fallback.

> If you edit `apps-script.gs` later, redeploy with **Deploy → Manage deployments → Edit → New version**. This keeps the same URL.

## What testers see

1. Intro: what Tone is and how the test works
2. About you: name, iPhone, design background
3. 11 tasks, each with an ease rating from 0 to 5 and an optional note
4. Overall: would they keep it, what they loved, what bugged them, what they'd use it for, and one wish
5. Thanks, plus Send / Copy my answers as a backup

Progress saves in the browser, so testers can switch between Tone and the form without losing answers.

## Results page

**https://lachiebanham-collab.github.io/tone-playtest/results.html** shows every answer as a card. You can group cards by task or by person, sort tasks with the hardest first, and hide individual testers. Test entries (names starting with "TEST") are hidden unless you switch them on. The page is password-protected:

1. In Apps Script, open **Project Settings** (the gear icon) → **Script Properties** → **Add script property**. Set the property to `RESULTS_KEY` and the value to a password of your choice. Save.
2. Make sure the latest `apps-script.gs` is pasted in and saved. Then go to **Deploy → Manage deployments → pencil → Version: New version → Deploy**. This keeps the same URL.
3. Open the results page and enter the password. It's remembered on that device.
