/**
 * Copyright 2023 HolyCorn Software
 * The Backend Dashboard faculty
 * This module (auto-dashboard), provides the ability for other faculties and frontend components, to define entries in a dashboard.
 * This is done, by placing a configuration file in the likeness of <something>.backend_dashboard.config.json
 * 
 */

import DelayedAction from "../../../system/public/html-hc/lib/util/delayed-action/action.mjs"
import libPath from 'node:path'
import libFs from 'node:fs'
import dashboardLogicUtils from "./utils.mjs"
import nodeUtil from 'node:util'


const refresh = Symbol()
const entries = Symbol()

export default class AutoDashboard {

    constructor() {






        const faculty = FacultyPlatform.get()

        faculty.connectionManager.events.addListener('frontend-manager-files-ready', this[refresh])
        faculty.connectionManager.events.addListener('frontend-manager-files-change', this[refresh])



    }

    /**
     * This method gets all dashboard entries for a given dashboard name
     * @param {string} name 
     * @returns {import("../lib/types.js").RawDashboardDirective}
     */
    getEntries(name) {

        const values = (this[entries]?.map(x => x[name]))?.map(
            x => dashboardLogicUtils.convertToExpanded(x)
        );

        return (values?.length > 0) ? values?.reduce((prev, current) => {
            prev.actions.push(...current.actions)
            prev.groups.push(...current.groups)
            return {
                groups: [...prev?.groups],
                actions: [...prev?.actions],
                name
            }
        }) : {
            actions: [],
            groups: [],
            name
        }

    }

    [refresh] = new DelayedAction(async () => {

        try {
            const data = await FacultyPlatform.get().base.channel.remote.frontendManager.fileManager.getURLs('.*backend_dashboard\\.config\\.json')

            this[entries] = await Promise.all(
                data.map(async config => {
                    /** @type {import("../lib/types.js").DashboardCompactFormat} */
                    const entry = JSON.parse(await libFs.promises.readFile(config.path))

                    /**
                     * This method moves through dashboard directive, and parses the relative paths, into absolute paths
                     * @param {import("../lib/types.js").CompactFormatGroup|import("../lib/types.js").CompactFormatAction} item 
                     */
                    function resolvePath(item) {
                        const resolveOne = (string) => libPath.resolve(config.url, '../', string)
                        item.view &&= resolveOne(item.view)
                        item.icon &&= resolveOne(item.icon)
                        if (item.items) {
                            Reflect.ownKeys(item.items).forEach(resolvePath)
                        }
                    }

                    for (const dashboardName in entry) {
                        for (const item of entry[dashboardName]) {
                            resolvePath(item)
                        }
                    }

                    return entry
                })
            );

        } catch (e) {
            console.error(`Failed to refresh auto-dashboard information.\n`, e)
        }

    }, 1000, 5000);

}