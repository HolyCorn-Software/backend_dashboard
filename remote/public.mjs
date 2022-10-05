/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (public) provides the outside world with features from the Backend Dashboard faculty
 */

import muser_common from "muser_common";
import { FacultyPublicMethods } from "../../../system/comm/rpc/faculty-public-methods.mjs";
import { DashboardProcessor } from "../logic/processor.mjs";



const processor_symbol = Symbol(`BackendDashboardPublicMethods.prototype.processor`)

export class BackendDashboardPublicMethods extends FacultyPublicMethods {


    constructor({ processor }) {
        super();

        /** @type {DashboardProcessor} */ this[processor_symbol] = processor

    }

    /**
     * This returns the directive for a given dashboard.
     * @param {object} param0 
     * @param {string} param0.name
     * @param {object} param0.params
     * @returns {Promise<import("../lib/directive/types.js").RawDashboardDirective>}
     */
    async getDashboard({ name, params } = {}) {

        name = arguments[1]?.name
        params = arguments[1]?.params;

        let user = await getUser(...arguments);
        return await this[processor_symbol].getDashboard({ name, userid: user.id, params })
    }

}


/**
 * This is used to get the user that called a public method.
 * You call this method like this `getUser(...arguments)` Or better still getUser(arguments[0])
 * @returns {Promise<import("faculty/modernuser/profile/types.js").UserProfileData>}
 */
async function getUser() {
    return await muser_common.getUser(arguments[0])
}