import * as logger from "./logger";
import * as ui from "./ui";

/** Register Keikaku settings **/
function registerSettings() {
  game.settings.register("fvtt-keikaku", "showReminder", {
    name: game.i18n.localize("keikaku.settings.reminder.name"),
    hint: game.i18n.localize("keikaku.settings.reminder.hint"),
    scope: "client",
    config: true,
    type: String,
    choices: {
      never: game.i18n.localize("keikaku.settings.reminder.choice.never"),
      incomplete: game.i18n.localize(
        "keikaku.settings.reminder.choice.incomplete"
      ),
      always: game.i18n.localize("keikaku.settings.reminder.choice.always"),
    },
    default: "always",
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

Hooks.on(
  "renderJournalDirectory",
  async (_app: Application, html: JQuery, _data: object) => {
    await ui.initUiComponents(html);
  }
);

// we show a reminder once if it is enabled in the settings
Hooks.once(
  "renderJournalDirectory",
  async (_app: Application, _html: JQuery, _data: object) => {
    ui.showReminder();
  }
);
