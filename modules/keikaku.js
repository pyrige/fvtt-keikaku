/* global game, Hooks */

import * as logger from './logger.js';
import { initUiComponents } from './ui.js';

Hooks.once('ready', async () => {
  const banner = `${game.i18n.localize('keikaku.initializing')}
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

Hooks.once('renderJournalDirectory', async (_app, html, _data) => {
  await initUiComponents(html);
});
