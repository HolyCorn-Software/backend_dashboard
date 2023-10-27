/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (types) contains type definition for the backend-dashboard widget on the frontend
 */

import { BackendDashboardInternalMethods } from "../remote/internal.mjs"
import { BackendDashboardPublicMethods } from "../remote/public.mjs"



global {
    namespace faculty {
        interface faculties {
            backend_dashboard: {
                remote: {
                    internal: BackendDashboardInternalMethods
                    public: BackendDashboardPublicMethods
                }
            }
        }
    }
}



export interface DashboardDirectiveAction extends DashboardDirectiveItemCommon {
    meta: object
    group: string
    view: string
}

export interface DashboardDirectiveGroup extends DashboardDirectiveItemCommon {
    supergroup: string
    meta: object
    topActions: [string]
}
export interface DashboardDirectiveItemCommon {
    name: string
    label: string
    icon: string
    /** A list of permissions, whereby, having any, qualifies the user to access the item */
    permissions: string[]
    /** An optional parameter that helps the system decide which declaration to consider over the other, in cases where more than one declaration has the same name */
    priority: number
}

export type RawDashboardDirective = {
    name: string
    actions: DashboardDirectiveAction[]
    groups: DashboardDirectiveGroup[]
}


export type CompactFormatAction = Omit<DashboardDirectiveAction, "group">

export type CompactFormatGroup = Omit<DashboardDirectiveGroup & {
    items: DashboardCompactFormat

}, "supergroup">



export type DashboardCompactFormat = {
    [name: string]: CompactFormatAction & CompactFormatGroup
}
