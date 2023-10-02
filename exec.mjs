/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The backend-dashboard faculty.
 * This faculty provides the special ability to have a dashboard that's built by the interaction of backend components
 */

import { DashboardProcessor } from "./logic/processor.mjs"
import { BackendDashboardInternalMethods } from "./remote/internal.mjs"
import { BackendDashboardPublicMethods } from "./remote/public.mjs"


const faculty = FacultyPlatform.get()

export default async function init() {


    const processor = new DashboardProcessor({
        hooks: {
            getUserPermissions: async ({ userid }) => {
                return [] //Nothing for now
            }
        }
    })

    //Now, provide remote methods
    faculty.remote.internal = new BackendDashboardInternalMethods({
        processor
    })

    faculty.remote.public = new BackendDashboardPublicMethods({
        processor
    })

    console.log(`${faculty.descriptor.label.yellow} is running!`)
}