/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The backend-dashboard widget
 * This widget (menu) is part of the backend-dashboard widget and controls the multi-layer menu on the left
 */

import { MenuItem } from "./item/item.mjs";
import DashboardObject from "./object.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";


export class SideMenu extends DashboardObject {

    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-backend-dashboard-menu'],
            innerHTML: `
                <div class='container'>
                    <div class='items'>
                        
                    </div>
                </div>
            `
        });

        /** @type {[MenuItem]} */ this.itemWidgets

        /** @type {[HTMLElement]} */ this.topActions

        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-backend-dashboard-menu-item',
            childType: 'widget',
            parentSelector: '.container >.items',
            property: 'itemWidgets',
            transforms: {
                /** @param {MenuItem} item */
                set: (item) => {

                    //When any of the items, are selected, set the current view to the current view of the item that was selected
                    item.addEventListener('select', () => {
                        this.currentView = item.viewHTML
                        this.topActions = item.topActions
                    })
                    return item.html
                }
            }
        });

        /** @type {function(('change'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener

        /** @type {boolean} */ this.collapsed
        Reflect.defineProperty(this, 'collapsed', {
            get: () => this.collapsed = this.html.classList.contains('collapsed'), //The reason we are setting this.collapsed when trying to read it, is to synchronize
            set: v => {
                v = !!v; //convert to a boolean

                //Collapse all menu items
                for (let item of this.itemWidgets) {
                    item.collapsed = v
                }

                //Now, collapse itself
                this.html.classList.toggle('collapsed', v);
            }
        })


    }

    /**
     * Setting this will alter how the dashboard is structured
     * @param {import("../../../lib/types.js").DashboardCompactFormat} data
     */
    set structure(data) {
        let caller = hc.getCaller();

        for (let name in data) {

            //If there's an icon, compute the final location of the icon relative to the caller

            //Do same for the children and children's children
            /**@param {import("../../../lib/types.js").CompactFormatAction|import("../../../lib/types.js").CompactFormatGroup} item */
            const exec_once = (item) => {
                item.icon &&= new URL(item.icon, caller).href
                for (let child in item.items) {
                    exec_once(item.items[child])
                }
            }

            exec_once(data[name])

            let item_widget = new MenuItem({
                ...data[name],
            });

            this.itemWidgets.push(item_widget);
        }
    }

    /**
     * @param {import("/$/system/static/html-hc/lib/widget/widget.mjs").ExtendedHTML}
     */
    set currentView(widget) {

        this[current_view_symbol] = widget;
        this.dispatchEvent(new CustomEvent('change'))
    }

    /**
     * @returns {ExtendedHTML}
     */
    get currentView() {
        return this[current_view_symbol]
    }



    /**
     * This selets an item no matter how nested, and selects it
     * @param {string} name 
     */
    async directSelect(name) {
        const item = await this.findItem(name)
        if (!item) {
            throw new Error(`Cannot select ${name} on the dashboard, because it could not be found.`)
        }
        item.header.dispatchEvent(new CustomEvent('select'))
    }

    /**
     * This directly adds a group to the dashboard. 
     * @param {import("../../../lib/types.js").CompactFormatGroup & {supergroup: string}} groupdata 
     * @returns {Promise<MenuItem>}
     */
    async addGroup(groupdata) {
        let target = groupdata.supergroup ? await this.findItem(groupdata.supergroup) : this

        let widget = new MenuItem({ ...groupdata })

        target.itemWidgets.push(widget);

        return widget;
    }

    /**
     * This adds an action to the menu. You can specify the name of the group the action belongs to.
     * If the action specified doesn't exist, it is automatically created.
     * @param {import("../../../lib/types.js").CompactFormatAction & {group: string}} itemdata 
     */
    async addAction(itemdata) {

        let item = new MenuItem(itemdata);
        let target = this;

        if (itemdata.group) {
            target = await this.findItem(itemdata.group) || await this.addGroup({
                label: 'No Name',
                name: itemdata.group
            });

        }

        target.itemWidgets.push(item);

        return item
    }


}

const current_view_symbol = Symbol(`SideMenu.prototype.current_view`)