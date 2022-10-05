/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (types) contains type definition for the backend-dashboard widget on the frontend
 */

import { DashboardDirectiveAction, DashboardDirectiveGroup } from "../../lib/directive/types.js";


export type BackendAction = DashboardDirectiveAction
export type BackendGroup = DashboardDirectiveGroup

export type FrontendAction = Omit<BackendAction, "group">{
    topActions: [string] | [HTMLElement]
}

export type FrontendGroup = Omit<BackendGroup & {
    items: FrontendFormat,

}, "supergroup">



export type FrontendFormat = {
    [key: string]: FrontendAction | FrontendGroup,
}