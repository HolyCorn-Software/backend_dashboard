/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The backend-dashboard faculty
 * The entire module (lib/directive) contains information needed by a client to draw a dashboard
 * This module (lib/directive/dashboard) contains specific information about how the final dashboard will look like to the user
 */




/**
 * This is the storage structure of client-available information, that tells us how the dashboard will be structured.
 * This structure is especially useful in the onRequest() method of dashboard scripts whereby scripts can manipulate the final outcome of the dashboard
 */
export class DashboardDirective {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.name
     * @param {import('../types.js').DashboardDirectiveAction[]} param0.actions
     * @param {import('../types.js').DashboardDirectiveGroup[]} param0.groupss
     */
    constructor({ name, actions, groups }) {


        /** @type {DashboardItemsProcessor<import('../types.js').DashboardDirectiveAction>} */
        this.actions = new DashboardItemsProcessor(actions)

        /** @type {DashboardItemsProcessor<import('../types.js').DashboardDirectiveGroup>} */
        this.groups = new DashboardItemsProcessor(groups)

        /** @type {string} */
        this.name = name

    }

    /**
     * The Raw representation of this directive, usable to the client
     */
    get raw() {
        return {
            name: this.name,
            groups: this.groups.array,
            actions: this.actions.array
        }
    }



}



/**
 * @typedef {{
 * name: string,
 * label: string,
 * icon: string,
 * meta: object
 * }} DashboardItem
 */

const items_array_symbol = Symbol(`DashboardItemsProcessor.prototype.items`)


/**
 * @template {DashboardItem} ItemType 
 */
class DashboardItemsProcessor {

    /**
     * 
     * @param {ItemType[]} array 
     */
    constructor(array) {

        /** @type {ItemType []} */
        this[items_array_symbol] = [...(array || [])]
    }
    /**
     * This is an internal method used to find either groups or actions
     * @param {object} param0 
     * @param {string} param0.name
     * @returns {ItemType}
     */
    find({ name }) {
        return this[items_array_symbol].filter(x => x.name === name)[0]
    }

    /**
     * Adds an item
     * @param {ItemType} item
     */
    add(item) {
        const { name, label, icon, meta, ...rest } = item;

        if (this.find({ name })) {
            throw new Exception(`There's already an item with the name '${name}'`, { code: 'error.system.unplanned' })
        }
        this[items_array_symbol].push({ name, label, icon, meta, ...rest })
    }

    /**
     * This is used to modify an item
     * @param {string} name 
     * @param {ItemType} info 
     */
    setInfo(name, info) {
        let item = this[items_array_symbol].filter(x => x.name === name)[0]
        if (!item) {
            throw new Exception(`No item was found with name '${name}'`, {
                code: 'error.system.unplanned'
            })
        }

        //Modify the item and maintain it's name
        item = { ...item, ...info, name }

        //Remove the previous copy
        this.remove({ name })

        //Add the new copy
        this[items_array_symbol].push(item);

    }

    /**
     * Removes an item
     * @param {object} param0 
     * @param {string} param0.name
     */
    remove({ name }) {
        this[items_array_symbol] = this[items_array_symbol].filter(x => x.name !== name)
    }

    /**
     * @type {ItemType[]}
     */
    get array() {
        return this[items_array_symbol].slice(0,)
    }
}