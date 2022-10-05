/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (converter) converts the dashboard structure definition from a form that's well-understood by the backend, to one that's possible on the frontend
 * 
 */



/**
 * Converts the input from the format well understood by the backend to a form usable on the frontend
 * @param {[import("../types.js").BackendAction]} actions 
 * @param {[import("../types.js").BackendGroup]} groups 
 * 
 * @returns {import("../types.js").FrontendFormat}
 */
export function convert(actions, groups) {
    actions = [...actions]
    groups = [...groups];

    /** @type {import("../types.js").FrontendFormat} Final output */
    const tree = {

    }

    /** @param {import("../types.js").BackendAction|import("../types.js").BackendGroup} item  Finds the parent of a single item*/
    const find_parent = (item) => groups.filter(x => x.name === (item.supergroup || item.group))[0]

    /**
     * This function tells us the star_index (how far it is from the top. An action with no group or a group with no supergroup has a star_index of zero(0). One with a parent that has a parent that has a super group has a star_index of 2)
     * @param {import("../types.js").BackendAction|import("../types.js").BackendGroup} item 
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
