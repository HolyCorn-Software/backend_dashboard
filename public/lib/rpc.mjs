/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This module (rpc) offers extra documentation for the publicly available methods from the backend_dashboard faculty
 */


import hcRpc from '/$/system/static/comm/rpc/aggregate-rpc.js'

/**
 * @type {{
 * backend_dashboard: import('faculty/backend_dashboard/remote/public.mjs').BackendDashboardPublicMethods
 * }}
 */
let bdRpc = window.bdRpc = hcRpc

export default bdRpc