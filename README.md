# Grade 8 Science: Matter Item Bank and Practice Assessments

75 Georgia Milestones-style items for Unit 5 (S8P1 Matter), a teacher page to pick items and make a student link, and a results page that tells you what to reteach on Monday.

Files that matter:
- `teacher.html` is for the teacher. `index.html` is what students open.
- `config.js` is the only file you edit.
- `apps-script/Code.gs` goes into your Google Sheet.
- `answer-key.md` lists every answer and explanation.

Until step 3 is done, everything runs in **practice mode**. The tool works, but results stay on one computer. Do not give students links until step 3 is done.

## Step 1. Put the files on GitHub

1. Make a new GitHub repository (public).
2. Upload everything in this folder (drag the files into the repo page, then Commit).
3. Settings > Pages > Source: **Deploy from a branch** > Branch: **main** / **(root)** > Save.
4. Wait 1 to 2 minutes. Your address will be `https://YOURNAME.github.io/REPONAME/`.

## Step 2. Check it loads

Open `https://YOURNAME.github.io/REPONAME/teacher.html`. You should see 75 items. Click **Preview** on one.

## Step 3. Connect a Google Sheet (so results save)

1. Make a new Google Sheet. Name it "Grade 8 Science Results".
2. Extensions > Apps Script. Delete what is there. Paste all of `apps-script/Code.gs`. Save.
3. Left side, gear icon (Project Settings) > Script Properties > Add property.
   Name: `TEACHER_PASSCODE`. Value: a passcode only you know. Save.
4. Deploy > New deployment > gear icon > **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy. Approve the permissions. Copy the **Web app URL** (ends in `/exec`).
5. In GitHub, open `config.js`, click the pencil, paste the URL between the quotes after `SCRIPT_URL:`. Commit.
6. Reload `teacher.html`. The top right badge must say **Results save to your Google Sheet**. If it still says Practice mode, the URL did not save.

If you change `Code.gs` later, use Deploy > Manage deployments > pencil > Version: New version > Deploy. The URL stays the same.

## Weekly routine

**Thursday or earlier**
1. Open `teacher.html`. Click **Week 1 Friday quiz set** (or Week 2, 3, 4, and 5 for the unit test).
2. Swap items in or out if you want. Check the DOK bar and standards line.
3. Choose what students see after submitting. Click **Create student link**.
4. Click **Try it as a student** once. Then **Copy link**.
5. Post the link in Google Classroom as a **Material** (not an Assignment).

**Friday:** students open the link, enter name and period, and test. Chromebooks work.

**Monday:** open `teacher.html` > **2. Student results** > enter your passcode > **Load my assessments** > pick the quiz. Start with the orange **Monday reteach** box.

## Good to know

- A student who resubmits is counted once (latest attempt).
- If a student's save fails, they see a red warning and a **Try again** button. Tell them to stay on the page until it says saved.
- Scoring is a practice rule: 1-point items need every part right. 2-point items give 2 for all correct and 1 for at least half correct. It is not official Milestones scoring.
- The answer key travels with the page code, so a determined student could find it. This is for practice, not secure testing.
- Item W4-10 (is this equation balanced?) goes a little past the GaDOE teacher notes. It is tagged "beyond GaDOE notes". Use the filter to hide it.
- Print the whole bank with answers from **Bank map and printing**.

## Lockdown helpers (on automatically)

While a student is testing:
- Copy, cut, paste, right-click, and text selection are blocked.
- Each time the student leaves the page (switches tabs or windows), it is logged. They get **one** warning when they come back. Their answers stay saved.
- Your results page shows **Left page** for each student (how many times, and total time away), a count at the top, and two columns in the CSV.

These are speed bumps, not a lock. A web page cannot stop a Chromebook from switching tabs, take screenshots away, or hide the page source. For a real lock, ask your tech department to run the quiz address in kiosk mode from Google Admin.
A student can trigger "Left page" by accident (a notification, a pop-up), so use it to start a conversation, not as proof.

## If you update these files later

Upload the changed files to GitHub (same names, same folder). Student links keep working. If `apps-script/Code.gs` changed, paste it into Apps Script and Deploy > Manage deployments > pencil > Version: New version > Deploy. The Sheet works without this update, but it adds the "Times left page" and "Seconds away" columns.

