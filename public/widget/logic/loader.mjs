/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module contains the logic for loading dashboard directives
 */

import bdRpc from "../../lib/rpc.mjs";
import BackendDashboard from "../widget.mjs";


/**
 * 
 * @param {object} param0 
 * @param {string} param0.name
 * @param {object} param0.params
 * @param {BackendDashboard} widget 
 */
export async function loadDashboard({ name, params }, widget) {

    let directive = await bdRpc.backend_dashboard.getDashboard({
        name, params
    });

    widget.menu.structure = directive;
    await new Promise(x => setTimeout(x, 250))
    await widget.loadWhilePromise(Promise.allSettled([widget.menu.itemWidgets.map(x => x.header.viewLoadPromise)]))
}