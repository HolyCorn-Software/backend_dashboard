/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * The BackendDashboard widget
 * This module provides functionalities useful for every structure in the BackendDashboard widget
 * 
 */

import { MenuItem } from "./item/item.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class DashboardObject extends Widget {

    constructor() {

        super();

        hc.importModuleCSS(hc.getCaller(2));

        /** @type {[MenuItem]} Objects that extend this class must implement this property in their own way*/ this.itemWidgets

        /** @type {string} */ this.name


        /** @type {MenuItem} */ this[highlighted_item_symbol]
    }

    /**
     * Selects an item
     * @param {string} name 
     */
    async highlightItem(name) {
        //First or all, unhighlight the previously highlighted item
        /** @type {MenuItem} */
        let previous = this[highlighted_item_symbol]

        previous?.header.html.classList.remove('highlighted');

        let current = await this.findItem(name);
        current.header.html.classList.add('highlighted')
        this[highlighted_item_symbol] = current;

    }


    /**
     * This finds an item no matter how nested
     * @param {string} name 
     * @param {number} timeout
     * @returns {Promise<MenuItem>}
     */
    findItem(name, timeout = 5000) {
        return new Promise(async (resolve, reject) => {

            if (this.name === name) {
                return resolve(this);
            }
            
            const iw = [...(this.itemWidgets || [])]

            setTimeout(() => reject(new Error(`Timeout searching for ${name}`)), timeout)

            for (let item of iw) {

                let found = await item.findItem(name);


                if (found) {
                    //Wait till any ongoing loading is done
                    try {
                        await found?.header?.viewLoadPromise;
                    } catch (e) {
                        return reject(e)
                    }

                    return resolve(found);
                }
            }

            resolve()

        })
    }

}


const highlighted_item_symbol = Symbol(`SideMenu.prototype.highlighted_item`)