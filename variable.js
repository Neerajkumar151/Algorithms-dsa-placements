import fs from "fs";
import path from "path";
import moment from "moment";
import simpleGit from "simple-git";

// --- CONFIGURE HERE ---
const COMMIT_DAYS_AGO = 58; // Change to any number of days
const AUTHOR_NAME = "Neeraj Kumar"; // ✅ Your GitHub name (not username)
const AUTHOR_EMAIL = "thakurneerajkumar17@gmail.com"; // ✅ Must be GitHub-verified email
const BRANCH_NAME = "main"; // Or 'master' based on your repo
const LOCAL_REPO = "."; // Assuming you're running inside repo folder
const DUMMY_FILE = ".backdate"; // This file will be used for commit

// --- CALCULATE BACKDATE ---
const commitDate = moment().subtract(COMMIT_DAYS_AGO, 'days').toDate();
const commitDateStr = commitDate.toISOString();
const filePath = path.join(LOCAL_REPO, DUMMY_FILE);

// --- Set environment variables for backdating ---
process.env.GIT_AUTHOR_NAME = AUTHOR_NAME;
process.env.GIT_AUTHOR_EMAIL = AUTHOR_EMAIL;
process.env.GIT_COMMITTER_NAME = AUTHOR_NAME;
process.env.GIT_COMMITTER_EMAIL = AUTHOR_EMAIL;
process.env.GIT_AUTHOR_DATE = commitDateStr;
process.env.GIT_COMMITTER_DATE = commitDateStr;

// --- Start Git actions ---
const git = simpleGit({ baseDir: LOCAL_REPO });

(async () => {
  try {
    // Step 1: Create dummy file to commit
    fs.writeFileSync(filePath, `Backdated commit on ${commitDateStr}\n`);

    // Step 2: Add and commit the file with backdate
    await git.add(DUMMY_FILE);
    await git.commit(`Backdated commit - ${commitDateStr}`, undefined, {
      '--date': commitDateStr,
    });

    // Step 3: Push to GitHub
    await git.push('origin', BRANCH_NAME);
    console.log("✅ Backdated commit pushed successfully!");

    // Step 4: Optional cleanup - remove dummy file
    fs.unlinkSync(filePath);
    await git.rm(DUMMY_FILE);
    await git.commit("🧹 Cleanup: removed .backdate file");
    await git.push('origin', BRANCH_NAME);
    console.log("🧹 Dummy file cleaned up!");
  } catch (error) {
    console.error("❌ Error:", error.message || error);
  }
})();
