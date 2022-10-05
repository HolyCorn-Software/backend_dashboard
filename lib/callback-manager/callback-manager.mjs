/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Faculty of Data
 * 
 * This module (callback-manager) allows other modules to effectively manage callbacks, by giving them the possibility of calling one method that applies to all subjects
 */

import { Exception } from "../../../../system/errors/backend/exception.js"
import { callWithTimeout } from "../../../../system/util/util.js"


/**
 * @typedef CallbackManagerOptions
 * @property {number} callbackTimeout The maximum time for any callback. Therefore, subjects should use no more than that time to respond to process
 */


/**
 * This class allows other modules to effectively manage callbacks.
 * It gives the caller the possibility of calling a single method, which gets called up on all subjects
 * 
 * @template Methods
 * 
 */
export class CallbackManager {


    /**
     * 
     * @param {[import("./types.js").CallbackSubject]} subjects The subjects that will receive the callback methods. Note that every callback subject must have a 'name' field
     * @param {CallbackManagerOptions} options
     */
    constructor(subjects, options = {}) {


        /** @type {[{name:string} & Methods]} */
        this.subjects = [...subjects || []]


        return new Proxy(this, {
            get: (target, property, receiver) => {
                return new CallbackManagerFunctionProxy(property, this.subjects, options)
            }
        })

    }

}


class CallbackManagerFunctionProxy {

    /**
     * 
     * @param {object} propertyPath 
     * @param {[import("./types.js").CallbackSubject]} subjects
     * @param {CallbackManagerOptions} options
     */
    constructor(propertyPath, subjects, options) {


        return new Proxy(()=>1, {
            get: (target, property, receiver) => {
                //This is what gives the callback-manager it's recursive ability.
                //So a method like someInterface.somesubInterface.someMethod() can be called
                return new CallbackManagerFunctionProxy(`${propertyPath}.${property}`, subjects, options)

            },
            apply: (target, thisArg, args) => {

                //Here we handle provision of callback methods
                //This section executes when for example, someone calls callbackMan.onFinished()
                return new Promise((resolve, reject) => {

                    //Stop hack attempts by detecting characters other than abc123ABC
                    if (/[^A-Za-z0-9.]/.test(propertyPath)) {
                        return reject(
                            new Exception(`Possible hack attempt detected.`, {
                                code: 'error.system.unplanned'
                            })
                        )
                    }

                    let errors = []
                    let returns = []
                    let completionCount = 0;

                    const done = () => {
                        resolve({ values: returns, errors })
                    }

                    for (let _subject of subjects) {
                        const subject = _subject;

                        (async () => {
                            try {
                                const method = eval(`subject.${propertyPath}`)
                                if(typeof method !== 'function'){
                                    throw new Error(`${propertyPath} is not a method`)
                                }
                                returns.push({
                                    subject: subject.name,
                                    value: await callWithTimeout(() => method(...args), {
                                        label: `Calling ${propertyPath} on ${subject.name}`,
                                        timeout: options.callbackTimeout || Infinity
                                    })
                                });
                            } catch (e) {
                                errors.push({ subject: subject.name, error: e })
                            }
                            completionCount++
                            if (completionCount >= subjects.length) {
                                //Then we are done
                                done()
                            }
                        })()
                    }

                    //If there were no subjects at all...
                    if (subjects.length === 0) {
                        done()
                    }

                })

            }
        })

    }



}