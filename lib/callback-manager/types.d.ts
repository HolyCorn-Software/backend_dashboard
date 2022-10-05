/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The callback-manager module
 * This file (types.d.ts) contains type definitions used by the callback-manager
 */




export declare type CallbackSubject = { [key: string]: ()=>Promise<void> }