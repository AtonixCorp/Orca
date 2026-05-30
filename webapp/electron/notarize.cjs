/* ============================================================================
   File: webapp/electron/notarize.cjs
   Purpose: Conditionally notarize signed macOS desktop builds on CI.
   ============================================================================ */

const { notarize } = require("@electron/notarize");

module.exports = async function notarizeMacBuild(context) {
  const { electronPlatformName, appOutDir, packager } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const applePassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const appleTeamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !applePassword || !appleTeamId) {
    console.log("Skipping macOS notarization: Apple notarization credentials are not configured.");
    return;
  }

  const appName = packager.appInfo.productFilename;

  await notarize({
    appBundleId: packager.appInfo.id,
    appPath: `${appOutDir}/${appName}.app`,
    appleId,
    appleIdPassword: applePassword,
    teamId: appleTeamId,
  });
};