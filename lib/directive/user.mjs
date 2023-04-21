/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The backend-dashboard faculty
 * This module(lib/directive/user) contains necessary information describing the user requesting a dashboard view
 * 
 */



export class UserDirective {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string[]} param0.permissions
     */
    constructor({ userid, permissions,  } = {}) {

        /** @type {string} */ this.userid
        /** @type {string[]} */ this.permissions


        Object.assign(this, arguments[0]);
    }

}