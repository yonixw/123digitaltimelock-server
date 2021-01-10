import express, { Request } from "express";
import fetch from 'node-fetch'

import { genKey, getKeyID } from "./crypto/encryption";

require("dotenv").config();

const app = express()
const port = 3000
app.use(require("morgan")("dev"));
app.use(express.json({ limit: "5mb" }))


app.listen(port, () => {
    console.log(`❤ ❤ [APP] listening at http://localhost:${port}`)
})

