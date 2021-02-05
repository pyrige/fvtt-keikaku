/* global game, Hooks */

import * as logger from "./logger.js";
import { initUiComponents } from "./ui.js";

/** Register Keikaku settings */
function registerSettings() {
  game.settings.register("fvtt-keikaku", "showReminder", {
    name: game.i18n.localize("keikaku.settings.name"),
    hint: game.i18n.localize("keikaku.settings.hint"),
    scope: "client",
    config: true,
    type: String,
    choices: {
      never: game.i18n.localize("keikaku.settings.choice.never"),
      incomplete: game.i18n.localize("keikaku.settings.choice.incomplete"),
      always: game.i18n.localize("keikaku.settings.choice.always"),
    },
    default: "incomplete",
  });
}

Hooks.once("ready", async () => {
  const banner = `${game.i18n.localize("keikaku.initializing")}
============================================================
##    ## ######## #### ##    ##    ###    ##    ## ##     ##
##   ##  ##        ##  ##   ##    ## ##   ##   ##  ##     ##
##  ##   ##        ##  ##  ##    ##   ##  ##  ##   ##     ##
#####    ######    ##  #####    ##     ## #####    ##     ##
##  ##   ##        ##  ##  ##   ######### ##  ##   ##     ##
##   ##  ##        ##  ##   ##  ##     ## ##   ##  ##     ##
##    ## ######## #### ##    ## ##     ## ##    ##  #######
============================================================`;

  logger.info(banner);

  registerSettings();
});

Hooks.on("renderJournalDirectory", async (_app, html, _data) => {
  await initUiComponents(html);
});
