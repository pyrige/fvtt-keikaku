/* global Hooks */

import * as logger from './logger.js';
import { initUiComponents } from './ui.js';

Hooks.once('ready', async () => {
  const banner = `Initializing the to-do list manager
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
