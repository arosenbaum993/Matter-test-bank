/* config.js: the only file you edit to connect results saving.
   1. Follow README.md step 3 to create the Google Sheet and Apps Script web app.
   2. Paste the web app URL (it ends in /exec) between the quotes below.
   While SCRIPT_URL is empty the tool runs in PRACTICE MODE: results are kept only in the browser on the
   computer where the test was taken, and both the student page and the teacher page say so on screen. */
window.SCI_CONFIG = {
  SCRIPT_URL: "",
  SCHOOL: "McIntosh County Middle School",
  COURSE: "Grade 8 Science",
  PERIODS: ["1", "2", "3", "4", "5", "6", "7", "8"]
};
