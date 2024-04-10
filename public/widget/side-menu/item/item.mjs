/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The backend-dashboard widget
 * The item widget which is a part of the side-menu widget manages wholly, items added to the dashboard
 * 
 * There's no way from distinguishing actions from groups, except that groups are items that contain other items
 */

import BackendDashboard from "../../widget.mjs";
import DashboardObject from "../object.mjs";
import { MenuItemHeader } from "./header.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";
import Spinner from "/$/system/static/html-hc/widgets/infinite-spinner/widget.mjs";


export class MenuItem extends DashboardObject {

    /**
     * 
     * @param {object} param0 
     * @param {string} param0.label
     * @param {string} param0.icon
     * @param {import("../../../../lib/types.js").DashboardCompactFormat[]} param0.items
     * @param {string} param0.name
     * @param {HTMLElement} viewHTML
     * @param {string} view
     * @param {HTMLElement]|[HTMLElement[]} topActions
     */
    constructor({ label, icon, items, name, view, viewHTML, topActions } = {}) {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-backend-dashboard-menu-item'],
            innerHTML: `
                <div class='container'>
                    <div class='header'></div>
                    <div class='content'></div>
                </div>
            `
        });


        //The header widget contains the most relevant parts of this item widget, such as label and icon
        /** @type {MenuItemHeader} */ this.header
        this.widgetProperty({
            selector: '.hc-cayofedpeople-backend-dashboard-menu-item-header',
            property: 'header',
            parentSelector: '.container >.header',
            transforms: {
                get: x => x?.widgetObject,
                /** @param {MenuItemHeader} x */
                set: x => {
                    x.addEventListener('select', () => {
                        this.viewHTML = x.viewHTML
                        BackendDashboard.findDashboard(this.html)?.menu.highlightItem(this.name)
                        this.dispatchEvent(new CustomEvent('select'))
                    });

                    //So when the header is expanded or closed
                    x.addEventListener('statechange', () => {
                        //Hide or display the content
                        if (x.isGroup) {
                            this.html.classList[x.state === 'open' ? 'add' : 'remove']('isShowing')
                        }
                    });

                    return x.html
                }
            }
        });
        this.header = new MenuItemHeader()

        /** @type {HTMLElement} */ this.viewHTML
        /** @type {HTMLElement[]} */ this.topActions


        /** @type {string} */ this.name
        Widget.__htmlProperty(this, this.html, 'name', 'attribute', undefined, 'name')

        hc.watchToCSS(
            {
                signal: this.destroySignal,
                source: this.html.$(':scope >.container >.content'),
                watch: {
                    dimension: 'height'
                },
                apply: () => {
                    let maxHeight = 0;
                    this.itemWidgets.forEach(item => {
                        maxHeight += (item.html.getBoundingClientRect().height * 2.5) + 10
                    });
                    this.html.style.setProperty('--content-height', `${maxHeight}px`)
                }
            }
        )



        //Now, we are relaying over the 'label', 'view', and 'icon properties to the header widget
        /** @type {string} */ this.label
        /** @type {string} */ this.icon
        /** @type {string} */ this.view
        for (let _property of ['label', 'icon', 'view']) {
            let property = _property
            Reflect.defineProperty(this, property, {
                get: () => this.header[property],
                set: v => this.header[property] = v,
                configurable: true
            })
        }




        //this.viewHTML stores the view that has been selected either by clicking the header or by clicking a sub-item
        /** @type {htmlhc.lib.widget.ExtendedHTML} */ this.viewHTML


        //this.itemWidgets is an array that directly manipulates the sub-items contained by this item
        /** @type {import('/$/system/static/html-hc/lib/widget/pluralWidgetProperty.mjs').PluralWidgetArray<MenuItem>} */ this.itemWidgets
        this.pluralWidgetProperty({
            selector: '.hc-cayofedpeople-backend-dashboard-menu-item',
            parentSelector: '.container >.content',
            childType: 'widget',
            property: 'itemWidgets',
            transforms: {
                /** @param {MenuItem} item */
                set: (item) => {
                    item.addEventListener('select', () => {
                        this.onSelect(item);
                        this.dispatchEvent(new CustomEvent('select'))
                    });

                    return item.html
                }
            }
        });


        //When an item is added, call the change function, so that we can compute whether or not this item is a group
        //You know groups are not selectable on their own, and contain a rotatable arrow indicating whether it is expanded or contracted
        this.itemWidgets.events.addEventListener('change', () => {
            this.header.isGroup = (this.itemWidgets.length > 0);
        });


        /**
         * Here's the logic for collapsing the menu item. 
         * A collapsed item is different from a contracted item. Contracted is used to refer to groups, and it means non of the sub items are visible
         * Collapsed means nothing else show apart from the icon on the header
         */

        /** @type {boolean} */ this.collapsed

        Widget.__htmlProperty(this, this.html, 'collapsed', 'class', (value) => {
            value = !!value; //Convert to boolean

            //So when collapsing the current item, also collapse the sub-items
            for (let itemWidget of this.itemWidgets) {
                itemWidget.collapsed = value
            }
            this.header.collapsed = value;
        }, 'collapsed')



        /** @type {htmlhc.lib.widget.ExtendedHTML} */ this.viewHTML
        Reflect.defineProperty(this, 'viewHTML', {
            get: () => this.header.viewHTML,
            set: (html) => this.header.viewHTML = html,
            configurable: true,
            enumerable: true
        })


        Object.assign(this, arguments[0])


    }

    /**
     * Gives a object structured representation of the items that exist under this item
     * @returns {{[key:string]: import("../../../../lib/types.js").CompactFormatAction & import("../../../../lib/types.js").CompactFormatGroup}}
     */
    get items() {
        let structure = {}
        for (let item of this.itemWidgets) {
            structure[item.name] = {
                icon: item.header.icon,
                label: item.header.label,
                meta: item.meta,
                items: item.items,
                name: item.name
            }
        }
        return structure
    }


    /**
     * Setting an object-like representation here will automatically alter the items that are found under this item in order to follow the structure
     * @param {{[key:string]: import("../../../../lib/types.js").CompactFormatAction|import("../../../../lib/types.js").CompactFormatGroup}} structure
     */
    set items(structure) {
        for (let name in structure) {
            let item = new MenuItem(structure[name])
            this.itemWidgets.push(item)

            // Now watch this new item. If it is clicked, then indirectly we (this bigger item) have been clicked, and our view is it's view
            item.addEventListener('select', () => {
                this.onSelect(item);
            })
        }
    }

    /**
     * @param {string]|[HTMLElement[]} actions
     */
    set topActions(actions) {
        //Resolve the strings, by importing them

        //What were doing in this method is fetching actions that have only been defined with a string (url)
        //We import the module, then instantiate and make use of it's 'html' property
        //While loading, we use a placeholder HTMLElement that only contains a spinner

        if (!actions) {
            return;
        }

        for (let i = 0; i < actions.length; i++) {

            let action = actions[i];
            let index = i;

            if (typeof action === 'string') {

                let actionPlaceholder = hc.spawn({});
                actions[index] = actionPlaceholder;

                let spinner = new Spinner();
                spinner.start();
                spinner.attach(actionPlaceholder);


                (async () => {

                    try {

                        //Import the class

                        let ModuleClass = (await import(action)).default
                        if (!ModuleClass) {
                            throw new Error(`${action} is not a valid action because it doesn't export a default class`)
                        }

                        //Instantiate it
                        let module = new ModuleClass(this);
                        //Then Add it
                        if (!module.html) {
                            throw new Error(`${action} is not a valid action because an instance of it doesn't contain the 'html' property. This 'html' property should be an HTMLElement. `)
                        }

                        //Now that we're done adding it...
                        actions[index] = module.html;

                        //We remove the placeholder
                        actionPlaceholder.replaceWith(module.html);
                    } catch (e) {
                        //Since there's an error resolving the action, remove it altogether
                        actions = actions.filter(x => x !== action);
                        console.log(`Could not add action ${action}, because `, e)
                        actionPlaceholder.remove();
                    }

                    spinner.stop()
                    spinner.detach();
                })()
            }
        }

        this[topActions_symbol] = actions
    }
    get topActions() {
        return this[topActions_symbol]
    }

    /**
     * 
     * @param {MenuItem} item 
     */
    onSelect(item) {
        this.viewHTML = item.viewHTML
        this.topActions = item.topActions
        this.dispatchEvent(new CustomEvent('select'))
        if (this.header.isGroup) {
            this.html.classList.add('isShowing')
        }
    }
}

const topActions_symbol = Symbol(`MenuItem.prototype.topActions`)