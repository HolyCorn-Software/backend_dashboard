/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The backend-dashboard faculty
 * This module (logic) controls the core logic of the faculty
 * 
 */

import { DashboardDirective } from '../lib/directive/dashboard.mjs'
import { UserDirective } from '../lib/directive/user.mjs'
import { DashboardScriptSystemAPI } from '../lib/system-api/api.mjs'
import { DashboardScriptsProcessor } from './scripts-processor.mjs'


const dashboards_symbol = Symbol(`DashboardProcessor.prototype.dashboards`)


export class DashboardProcessor {

    /**
     * 
     * @param {object} param0 
     * @param {import('./types.js').ProcessorHooks} param0.hooks
     */
    constructor({ hooks }) {

        /** @type {{[x:string]: import('../lib/directive/dashboard.mjs').DashboardDirective}} */
        this[dashboards_symbol] = {}

        /** @type {import('./scripts-processor.mjs').DashboardScriptsProcessor} */
        this.scripts = new DashboardScriptsProcessor()

        /** @type {import('./types.js').ProcessorHooks} */
        this.hooks = hooks;
    }

    /**
     * This method is used to get the client-usable structure of a named dashboard constrained by a specified userid. 
     * The userid serves discriminate which actions will be sent.
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.userid
     * @param {object} param0.params Additional parameters
     * @returns {Promise<import('../lib/directive/types.js').RawDashboardDirective>}
     */
    async getDashboard({ name, userid, params }) {
        const dashboard_directive = new DashboardDirective({ name })

        //Get permissions for the user requesting a view of the dashboard.
        //The permissions information is necessary in the decision making process of scripts
        const user_directive = new UserDirective({
            userid,
            permissions: await this.hooks.getUserPermissions({ userid })
        })

        const scripts_system_api = new DashboardScriptSystemAPI()

        //Now we have all three(3) parameters ready for the onRequest() call
        //So let's make the call

        let result = await this.scripts.callbacks.onRequest({
            dashboard: dashboard_directive,
            user: user_directive,
            system: scripts_system_api,
            params
        });

        if (result.errors.length > 0) {
            console.warn(`Errors encounterd when calling the onRequest() method\n`, ...result.errors)
        }

        //After the call, every script has modified the final outcome of the dashboard
        //So let's let the client know
        return dashboard_directive.raw;
    }


}