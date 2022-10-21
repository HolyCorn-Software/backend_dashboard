/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The backend-dashboard faculty.
 * This module (scripts-processor) handles scripts that will get executed when user requests for a dashboard
 * 
 */

import os from 'node:os'
import libPath from 'node:path'
import shortUUID from 'short-uuid'
import fs from 'node:fs'
import { CallbackManager } from '../lib/callback-manager/callback-manager.mjs'


const scripts_symbol = Symbol(`DashboardScriptsProcessor.prototype.scripts`)



export class DashboardScriptsProcessor {

    constructor() {

        /** @type {[import('./types.js').DashboardScriptData]} */
        this[scripts_symbol] = []

        /** @type {import('./types.js').DashboardScript} */
        this.callbacks = new CallbackManager(this[scripts_symbol], {
            callbackTimeout: 5000
        });

        Reflect.defineProperty(this.callbacks, 'subjects', {
            get: () => this[scripts_symbol].map(x => x.script),
            set: v => this[scripts_symbol] = v,
            configurable: true,
            enumerable: true
        })

    }

    /**
     * This is called so that a script should be added to the processing queque
     * @param {object} param0 
     * @param {Buffer} param0.script
     * @param {string} param0.name Unique name for the script
     * @param {boolean} param0.override If true, we'll silently override any existing script with thesame name
     * @returns {Promise<import('./types.js').DashboardScriptTrackerInfo>}
     */
    async add({ script, name, override }) {

        //Just check that the name is not already taken
        if (typeof name !== 'undefined' && !override && await this.find({ name })) {
            throw new Exception(`There's already a script with the same name '${name}'`, {
                code: 'error.system.unplanned'
            })
        }

        //This method is used to safely quit the add() method, by cleaning up and throwing an exception
        const safe_end = (exception) => {
            //Before throwing that exception and ending execution, first clean temporal files
            if (script_tmp_path) {
                fs.rmSync(script_tmp_path)
            }
            throw exception;
        }

        //Now load the script (from the buffer)
        let scriptData;
        let script_tmp_path
        try {

            script_tmp_path = `${os.tmpdir()}${libPath.sep}${shortUUID.generate()}.mjs`
            fs.writeFileSync(script_tmp_path, script)
            scriptData = await import(script_tmp_path)

            //Now checking if the script follows the expected pattern
            let methods = ['onRequest']
            for (let method of methods) {
                if (typeof scriptData[method] !== 'function') {
                    //If not, throw an exception
                    safe_end(new Exception(`The script lacks the '${method}' method`, { code: 'error.input.validation' }))
                }
            }
        } catch (e) {
            if (e instanceof Exception) {
                throw e
            }
            safe_end(new Exception(`We could not add the script because: ${e}`, { code: 'error.system.unplanned' }))
        }

        //Now that we are done checking the script
        //Do everything necessary to store the script

        let final_script_data;

        //Creates a brand new record
        const brand_new = () => {
            final_script_data = {
                id: shortUUID.generate(),
                name
            }
        }

        let canOverride = false; //Yes, we have been asked to override. But can we ? The real value will be determined just below

        if (override) {
            let existing = this[scripts_symbol].filter(x => x.name === name)[0]
            if (!existing) { //We were asked to override, but there's nothing to override.
                brand_new() //Therefore, it's brand new
            } else {
                final_script_data = existing
                canOverride = true
                console.log(`Overriding script ${name}\n`)
            }
        } else { //When we are asked to create a new record
            brand_new()
        }

        //Whether overriding or creating a new record, the scriptData that's meant to be is the new one
        final_script_data.script = scriptData;

        if (!canOverride) {
            this[scripts_symbol].push(final_script_data)
            console.log(`New script called, ${name.magenta} added to Dashboard Scripts Processor`)
        }

        return { id: final_script_data.id }


    }

    /**
     * Find a script by name or by id
     * @param {object} param0
     * @param {string} param0.name
     * @param {string} param0.id 
     * @param {object} param0.flags
     * @param {boolean} param0.flags.throwError
     * @returns {Promise<import('./types.js').DashboardScriptTrackerInfo>}
     */
    async find({ name, id, flags: { throwError } = {} }) {
        if ((typeof name !== 'undefined') == (typeof id !== 'undefined')) {
            throw new Exception(`Specify 'name' or 'id'. Atleast one, not both`, {
                code: 'error.input.validation'
            })
        }
        let property = typeof name !== 'undefined' ? 'name' : 'id';

        let script = this[scripts_symbol].filter(x => x[property] === arguments[0][property])[0];

        if (!script && throwError) {
            throw new Exception(`No script found with ${property} ${arguments[0][property]}`, {
                code: 'error.system.unplanned'
            })
        }

        return script;

    }

}

