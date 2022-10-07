/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 */

import { BackendDashboard } from "./widget/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

hc.importModuleCSS(import.meta.url);


const dashboard = new BackendDashboard({
    name:'user'
})

document.body.appendChild(dashboard.html);