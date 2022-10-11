/**
 * 
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This widget is allows easy one line use of a dashboard
 * 
 */

import { loadDashboard } from "./logic/loader.mjs";
import { SideMenu } from "./side-menu/menu.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export class BackendDashboard extends Widget {


    constructor() {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-backend-dashboard'],
            innerHTML: `
                <div class='container'>

                    <div class='left-section'>
                        <div class='main'>
                            <div class='logo'>
                                <img src='/$/shared/static/logo.png'>
                                <div class='text'>HCTS</div>
                            </div>

                            <div class='side-menu'>

                            </div>
                            
                        </div>
                    </div>

                    <div class='right-section'>
                        <div class='top-right'>
                            <div class='left'>
                                <div class='menu-toggle'>
                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30" style=" fill:#000000;">
                                        <path d="M 3 7 A 1.0001 1.0001 0 1 0 3 9 L 27 9 A 1.0001 1.0001 0 1 0 27 7 L 3 7 z M 3 14 A 1.0001 1.0001 0 1 0 3 16 L 27 16 A 1.0001 1.0001 0 1 0 27 14 L 3 14 z M 3 21 A 1.0001 1.0001 0 1 0 3 23 L 27 23 A 1.0001 1.0001 0 1 0 27 21 L 3 21 z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <div class='right'>
                                <!-- Top actions go here -->
                            </div>
                        </div>

                        <div class='bottom-right'>
                            
                        </div>
                    </div>
                
                </div>
            `
        });

        /** @type {[HTMLElement]} */ this.topActions
        this.pluralWidgetProperty({
            selector: '*',
            immediate: true,
            childType: 'html',
            property: 'topActions',
            parentSelector: ".container >.right-section >.top-right >.right"
        })

        /** @type {SideMenu} */ this.menu
        this.widgetProperty({
            selector: '.hc-cayofedpeople-backend-dashboard-menu',
            parentSelector: '.container >.left-section .side-menu',
            property: 'menu',
            transforms: {
                /** @param {SideMenu} widget */
                set: (widget) => {
                    widget.addEventListener('change', () => {
                        this.mainContent = widget.currentView;
                        this.topActions = widget.topActions||[]
                    })
                    return widget.html
                },
                get: (x) => x?.widgetObject
            }
        });

        /** @type {import("/$/system/static/html-hc/lib/widget/widget.mjs").ExtendedHTML} */ this.mainContent
        this.widgetProperty({
            selector: '*',
            parentSelector: '.container .right-section >.bottom-right',
            property: 'mainContent',
        })

        this.menu = new SideMenu();

        let menu_toggle = this.html.$('.right-section >.top-right .menu-toggle')

        menu_toggle.addEventListener('click', () => {
            this.menu_active = !this.menu_active
        })

    }

    async loadFromServer({name, params}){
        this.loadBlock();
        try{
            await loadDashboard({name, params}, this)
        }catch(e){
            this.loadUnblock();
            throw e;
        }
        this.loadUnblock()
    }

    /**
     * Setting this expands or contracts the side menu
     * @param {boolean} state
     */
    set menu_active(state) {
        state = !!state;
        this.menu.collapsed = state;

        this.html.classList.toggle('menu-collapsed', state)
    }

    /**
     * Tells us the current state of the side menu. Is it active or collapsed ?
     * @return {boolean}
     */
    get menu_active() {
        let state_value = this.menu.collapsed
        this.menu_active = state_value; //To iron out inconsistencies between this.html.classList and this.menu.collapsed
        return state_value
    }


    /**
     * Finds BackendDashboard the given HTMLElement is attached to. 
     * @param {HTMLElement} html
     * @returns {BackendDashboard}
     */
    static findDashboard(html) {
        let target = html;
        while ((target = target.parentElement)) {
            if (target.widgetObject instanceof BackendDashboard) {
                return target.widgetObject;
            }
        }
    }
}