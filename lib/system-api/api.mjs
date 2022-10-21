/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The backend-dashboard faculty
 * This module(system-api) provides necessary methods used in scripts, especially related to communication
 */

import { FacultyFacultyInterface } from "../../../../system/comm/rpc/faculty-faculty-rpc.mjs";

const faculty = FacultyPlatform.get()


export class DashboardScriptSystemAPI {

    constructor() {
        this.faculties = new ScriptSystemFacultyAPI()
    }



}


class ScriptSystemFacultyAPI {

    constructor() {

    }

    /**
     * Connects to a faculty.
     * 
     * This method is already optimized to cache previous connections.
     * @param {string} name faculty name
     * @returns {Promise<FacultyFacultyInterface>}
     */
    async connect(name) {
        return await faculty.connectionManager.connect(name)
    }
}