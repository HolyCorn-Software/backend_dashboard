/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (internal) provides features to other faculties, especially in relation to modifying a dashboard
 * 
 */

import { DashboardProcessor } from "../logic/processor.mjs";

const processor_symbol = Symbol('BackendDashboardInternalMethods.prototype.processor')

/**
 * @typedef {import("../logic/types.js").DashboardScriptMethods} DashboardScript
 */

export class BackendDashboardInternalMethods extends FacultyFacultyRemoteMethods {

    /**
     * 
     * @param {object} param0 
     * @param {DashboardProcessor} param0.processor
     */
    constructor({ processor } = {}) {
        super();
        /** @type {DashboardProcessor} */
        this[processor_symbol] = processor;
    }

    /**
     * Adds a script that will be executed when a client requests for a dashboard. Of course, the purpose of a script is to determine which actions are added to the user's final request. Every script is called for every request a user makes. So scripts have to be super efficient.
     * The expected structure of a script is documented in ../logic/types.d.ts
     * @see {@link DashboardScript}
     * @param {object} param0 
     * @param {string} param0.name Unqiue name for the script
     * @param {string} param0.base64 Content of the script in Base64
     * @param {boolean} param0.override This tells us to quietly override any existing script with the same name
     * @returns {Promise<import("../logic/types.js").DashboardScriptTrackerInfo>}
     */
    async addScript({ name, base64, override } = {}) {
        name = arguments[1].name;
        base64 = arguments[1].base64;
        override = arguments[1].override
        
        return await this[processor_symbol].scripts.add({
            name,
            script: Buffer.from(base64, 'base64'),
            override
        })
    }


}