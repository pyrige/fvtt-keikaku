/* global game, Hooks */

import * as logger from "./logger.js";
import { initUiComponents, showReminder } from "./ui.js";

/** Register Keikaku settings */
function registerSettings() {
  game.settings.register("fvtt-keikaku", "showReminder", {
    name: game.i18n.localize("keikaku.settings.reminder.name"),
    hint: game.i18n.localize("keikaku.settings.reminder.hint"),
    scope: "client",
    config: true,
    type: String,
    choices: {
      never: game.i18n.localize("keikaku.settings.reminder.choice.never"),
      incomplete: game.i18n.localize("keikaku.settings.reminder.choice.incomplete"),
      always: game.i18n.localize("keikaku.settings.reminder.choice.always"),
    },
    default: "always",
  });
  game.settings.register("fvtt-keikaku", "defaultColor", {
    name: game.i18n.localize("keikaku.settings.default_color.name"),
    hint: game.i18n.localize("keikaku.settings.default_color.hint"),
    scope: "client",
    config: true,
    type: String,
    default: "#191813",
  });
}

Hooks.once("setup", async () => {
  registerSettings();
});

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
});

Hooks.on("renderJournalDirectory", async (_app, html, _data) => {
  await initUiComponents(html);
});

Hooks.once("renderJournalDirectory", async (_app, _html, _data) => {
  showReminder();
});
