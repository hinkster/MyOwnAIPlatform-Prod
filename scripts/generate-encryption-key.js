#!/usr/bin/env node
"use strict";
const crypto = require("crypto");
const key = crypto.randomBytes(32).toString("hex");
console.log("Add this to your .env as APP_ENCRYPTION_KEY=");
console.log(key);
