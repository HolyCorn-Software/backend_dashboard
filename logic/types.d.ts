/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The backend-dashboard faculty
 * The logic module.
 * This sub-module (types.d.ts) contains type definitions for the logic module
 */

import { DashboardDirective } from "../lib/directive/dashboard.mjs";
import { DashboardScriptSystemAPI } from "../lib/system-api/api.mjs";



/**
 * This is the structure of a script that will be executed when a dashboard is being constructed
 */
export type DashboardScriptMethods = {

    /** 
     * This method is called when a user is trying to fetch details to draw the dashboard on the frontend.
     * It is an opportunity to decide which components are on the dashboard.
     */
    onRequest: (args: Ds_onRequest_args) => Promise<void>
}

export type Ds_onRequest_args = {
    /** This object is a representation of the dashboard the user is going to see */
    dashboard: DashboardDirective,
    /** Parameters passed by the user */
    params: object,
    /** Contains useful functions e.g connecting to a faculty */
    system: DashboardScriptSystemAPI,
    /** Information about the user which can be used to make decisions */
    user: DashboardUserModel,
};

export type DashboardScriptData = {
    script: DashboardScriptMethods,
    name: string,
    id: string
}


export type DashboardUserModel = {
    rpc: FacultyPublicJSONRPC
}

export type DashboardScriptTrackerInfo = {
    id: string
}


/**
 * This defines the structure of a special dependency to the processor.
 * 
 * This dependency implements the details of important utilities such as getting user permissions.
 */
export type ProcessorHooks = {

    getUserPermissions: ({ userid }: { userid: string }) => Promise<{ [string] }>

}

let _DashboardScript = DashboardScriptMethods
global {
    declare type DashboardScriptMethods = _DashboardScript
}