/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The dashboard-directive module, which contains information needed by a client to construct a dashboard
 * The types sub-module contains type definitions needed throughout the module
 */


export type DashboardDirectiveAction = {
    name: string,
    label: string,
    icon: string,
    meta: object,
    group: string,
    view: string
}

export type DashboardDirectiveGroup = {
    name: string,
    label: string,
    icon: string,
    supergroup: string,
    meta: object,
    topActions: [string]
}

export type RawDashboardDirective = {
    name: string,
    actions: [DashboardDirectiveAction],
    groups: [DashboardDirectiveGroup]
}