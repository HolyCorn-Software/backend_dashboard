/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 */

import { BackendDashboard } from "./widget/widget.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";

hc.importModuleCSS(import.meta.url);


const dashboard = new BackendDashboard({
    name:'user'
})

document.body.appendChild(dashboard.html);