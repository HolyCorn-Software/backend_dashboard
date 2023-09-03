/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This widget (header) is part of the backend-dashboard widget and represents the top row of a item on the sidebar menu
 */

import { report_error_direct } from "/$/system/static/errors/error.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

export class MenuItemHeader extends Widget {

    constructor({ label, icon, state, isGroup, view } = {}) {
        super();

        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-backend-dashboard-menu-item-header'],
            innerHTML: `
                <div class='container'>
                    <div class='icon'></div>
                    <div class='label'>Some Option</div>
                    <div class='drop-down-arrow'></div>
                </div>
            `
        });

        let iconUrlRegExp = /url('(.+)')/

        /** @type {string} */ this.icon
        Reflect.defineProperty(this, 'icon', {
            get: () => iconUrlRegExp.exec(this.html.$('.icon').style.getPropertyValue('--img'))[1],
            set: v => {
                //When setting the image url, calculate it relative to the caller
                this.html.$('.icon').style.setProperty('--img', `url('${new URL(v, hc.getCaller()).href}')`)
            },
            enumerable: true,
            configurable: true
        });

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML',)

        /** @type {function(('statechange'|'select'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        /** @type {('open'|'close')} */ this.state
        Reflect.defineProperty(this, 'state', {
            get: () => this.html.classList.contains('isShowing') ? 'open' : 'close',
            set: v => {
                this.html.classList[v === 'open' ? 'add' : 'remove']('isShowing')
                this.dispatchEvent(new CustomEvent('statechange'))
            },
            configurable: true,
            enumerable: true
        });

        /** @type {boolean} */ this.isGroup
        Reflect.defineProperty(this, 'isGroup', {
            get: () => this.html.classList.contains('isGroup'),
            set: v => this.html.classList[v ? 'add' : 'remove']('isGroup'),
            configurable: true,
            enumerable: true
        });

        this.html.addEventListener('click', () => {
            if (this.isGroup) {
                this.html.classList.toggle('isShowing')
                this.state = this.state; //Just to trigger the 'statechange' event
            } else {
                this.dispatchEvent(new CustomEvent('select'))
            }
        });


        /** @type {boolean} */ this.collapsed

        Widget.__htmlProperty(this, this.html, 'collapsed', 'class', undefined, 'collapsed')




        Object.assign(this, arguments[0])
    }

    set view(view) {
        this.viewLoadPromise = (async () => {
            let module = await import(view);
            if (!(module.default) instanceof Widget) {
                throw new Error(
                    `The view (${view}) did not export a default class which extends Widget.\nIn general it something like this is expected\n
                    import {Widget} from '/$/system/static/html-hc/lib/widget/widget.mjs'
                    
                    export default SomeClass extends Widget{
                        constructor(){
                            super();
                            super.html = document.createElement('div')
                            super.html.innerHTML=\`My sample HTML\`;
                        }
                    }
                    `
                );
            }

            let instance = new module.default(this)
            this[view_html_symbol] = instance.html;
            this[view_symbol] = view;
        })().catch(e=>{
            console.log(`Could not load view `, view, `\nError: `, e)
            report_error_direct(e)
        })
    }
    get view() {
        return this[view_symbol]
    }
    /**
     * @returns {htmlhc.lib.widget.ExtendedHTML}
     */
    get viewHTML() {
        return this[view_html_symbol]
    }

    /**
     * Directly set the HTML content 
     */
    set viewHTML(html) {
        this[view_html_symbol] = html;
    }

}


const view_html_symbol = Symbol(`MenuItem.prototype.view_widget`)
const view_symbol = Symbol(`MenuItem.prototype.view`)