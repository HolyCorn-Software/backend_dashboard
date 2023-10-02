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
import AutoDashboard from './auto-dashboard.mjs'
import { DashboardScriptsProcessor } from './scripts-processor.mjs'
import dashboardLogicUtils from './utils.mjs'


const dashboards_symbol = Symbol(`DashboardProcessor.prototype.dashboards`)

const faculty = FacultyPlatform.get();


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

        this.autoDashboard = new AutoDashboard()
    }

    /**
     * This method is used to get the client-usable structure of a named dashboard constrained by a specified userid. 
     * The userid serves discriminate which actions will be sent.
     * @param {object} param0 
     * @param {string} param0.name
     * @param {string} param0.userid
     * @param {object} param0.params Additional parameters
     * @returns {Promise<import('../lib/types.js').DashboardCompactFormat>}
     */
    async getDashboard({ name, userid, params }) {

        const userPermissions = await this.hooks.getUserPermissions({ userid })
        //Get permissions for the user requesting a view of the dashboard.
        //The permissions information is necessary in the decision making process of scripts
        const user_directive = new UserDirective({
            userid,
            permissions: userPermissions
        });


        //Here, let's process the static elements of the dashboard (elements of the dashboard declared in faculty descriptors)

        //First things first, let's get the faculty descriptors that have static elements in this dashboard
        //We should get it, and then convert to a compact format
        let dashboardDesc = dashboardLogicUtils.convertToCompact((await faculty.base.channel.remote.faculties()).filter(x => x.meta?.backend_dashboard?.[name]).map(x => x.meta.backend_dashboard[name]).flat(1))

        //Now, filter the ones that the user should have access to

        const finalDesc = await dashboardLogicUtils.removeByPermission(dashboardDesc, userPermissions)
        const finalDescExpanded = dashboardLogicUtils.convertToExpanded(finalDesc)


        const dashboard_directive = new DashboardDirective({ name, actions: finalDescExpanded.actions, groups: finalDescExpanded.groups })

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


        // Now, get the static dashboard entries from auto-dashboard
        const autoEntries = this.autoDashboard.getEntries(name)

        //After the call, every script has modified the final outcome of the dashboard
        //So let's let the client know
        return dashboardLogicUtils.convertToCompact([...autoEntries.actions, ...autoEntries.groups, ...dashboard_directive.raw.actions, ...dashboard_directive.raw.groups]);
    }


}