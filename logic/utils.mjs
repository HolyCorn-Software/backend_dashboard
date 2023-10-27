/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (converter) converts the dashboard structure definition from a form that's well-understood by the backend, to one that's possible on the frontend
 * 
 */

import muser_common from "muser_common";



/**
 * Converts the input from the format well understood by the backend to a form usable on the frontend
 * @param {(import("../lib/types.js").DashboardDirectiveAction | import("../lib/types.js").DashboardDirectiveGroup)[]} items
 * 
 * @returns {import("../lib/types.js").DashboardCompactFormat}
 */
function convertToCompact(items) {


    // Before any processing, let's remove duplicate items
    items = cleanItems(items);


    const actions = items.filter(x => x.group || x.view)
    const groups = items.filter(x => x.supergroup || (!x.group && !x.view))

    /** @type {import("../lib/types.js").DashboardCompactFormat} Final output */
    const tree = {

    }

    /** @param {import("../lib/types.js").DashboardDirectiveAction|import("../lib/types.js").DashboardDirectiveGroup} item  Finds the parent of a single item*/
    const find_parent = (item) => groups.filter(x => x.name === (item.supergroup || item.group))[0]

    /**
     * This function tells us the star_index (how far it is from the top. An action with no group or a group with no supergroup has a star_index of zero(0). One with a parent that has a parent that has a super group has a star_index of 2)
     * @param {import("../lib/types.js").DashboardDirectiveAction|import("../lib/types.js").DashboardDirectiveGroup} item 
     * @returns {number}
     */
    const get_star_index = (item) => {

        //Shortcut... If it has no parent group at all, then it's index is zero(0)
        if (typeof item.group === 'undefined' && typeof item.supergroup === 'undefined') {
            return 0;
        }

        let index, current_item = item
        for (index = 0; current_item = find_parent(current_item); index++) {
            //This loop will stop when the current_item has no parent
        }
        return index;
    }

    /**
     * This method gets all items that have a certain star index
     * @param {number} index 
     */
    const get_items_by_star_index = (index) => [...groups, ...actions].filter(x => get_star_index(x) === index)

    /**
     * This method returns the highest star index found
     * @returns {number}
     */
    const get_max_star_index = () => [...groups, ...actions].map(x => get_star_index(x)).sort().at(-1);


    //First get the top-tier groups (with no supergroups) and super actions (actions having no groups)
    let super_stars = get_items_by_star_index(0);

    for (let item of super_stars) {
        tree[item.name] = item;
        // delete item.name
    }

    const max_star_index = get_max_star_index()
    for (let i = max_star_index; i > 0; i--) {
        let items_i = get_items_by_star_index(i);
        //Remember that the tree has the same copy of the variables as the arrays. Therefore, we may just as well change them from the arrays instead
        for (let item of items_i) {
            const parent = find_parent(item)
            if (!parent) {
                console.warn('Did not find parent for item ', item)
                continue
            }
            parent.items ||= [];
            parent.items.push(item)

        }
    }

    //Finally, we are done
    return tree;

}


/**
 * This method removes duplicate entries
 * @param {(import("../lib/types.js").DashboardDirectiveAction | import("../lib/types.js").DashboardDirectiveGroup)[]} items
 * @returns 
 */
function cleanItems(items) {
    let cleanedItems = [];
    for (const item of items) {
        if ((cleanedItems.find(it => it.name == item.name)?.priority || 0) <= (item.priority || 0)) {
            cleanedItems = [
                ...cleanedItems.filter(x => x.name !== item.name),
                item
            ]
        }
    }
    return cleanedItems;
}

/**
 * This method converts data that's suitable for the frontend, to one that's usable by the backend
 * @param {import("../lib/types.js").DashboardCompactFormat} input 
 * @returns {import('../lib/types.js').RawDashboardDirective}
 */
function convertToExpanded(input) {


    /**
     * 
     * @param {input} instance 
     * @returns {Omit<import('../lib/types.js').RawDashboardDirective, "name">}
     */
    function convert(instance, groupName) {

        /** @type {import('../lib/types.js').RawDashboardDirective['actions']} */
        const actions = []

        /** @type {import('../lib/types.js').RawDashboardDirective['groups']} */
        const groups = []

        for (let name in instance) {

            if (instance[name].view || instance[name].group) { //Then it's an action
                actions.push({ name, ...instance[name], group: groupName || instance[name].group || undefined })
            } else {
                //Then it's a group
                const { items, ...data } = instance[name]
                groups.push({ ...data, supergroup: groupName || instance[name].supergroup || undefined })
                const conversions = convert(items, name)
                groups.push(...conversions.groups)
                actions.push(...conversions.actions);
            }
        }

        return { actions, groups }
    }

    const results = convert(input)
    return results;
}



/**
 * This method removes or allows items on a dashboard directive based on whether the item is permitted by the list of permissions
 * @param {import("../lib/types.js").DashboardCompactFormat} input 
 * @param {string[]} permissions The user's permissions
 * @returns {Promise<import("../lib/types.js").DashboardCompactFormat>}
 */
async function removeByPermission(input, permissions) {

    const output = {}

    const promises = []

    for (let name in input) {
        promises.push(
            (async () => {
                const itemPermissions = [...(input[name]?.permissions || [])]
                if (itemPermissions.length > 0) {
                    let qualifies = false
                    for (let itmPerm of itemPermissions) {
                        qualifies = await muser_common.qualifyPermissionByPermissions(itmPerm, permissions);
                        if (qualifies) {
                            break;
                        }
                    }
                    if (qualifies) {
                        output[name] = input[name]
                    }
                } else {
                    output[name] = input[name]
                }
                if (input[name].items) {
                    input[name].items = await removeByPermission(input[name].items, permissions)
                }
            })()
        )
    }

    await Promise.all(promises)

    return output
}

const dashboardLogicUtils = {
    convertToExpanded,
    convertToCompact,
    removeByPermission
}


export default dashboardLogicUtils