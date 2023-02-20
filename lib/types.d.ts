/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * This module (types) contains type definition for the backend-dashboard widget on the frontend
 */






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
    [key: string]: CompactFormatAction & CompactFormatGroup
}
