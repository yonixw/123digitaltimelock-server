import express, { Request } from "express";
import { CreateKeyCommandInput, EncDataCommandInput } from "./dynamodb/apis";

export function setUpExamples(app:express.Express, port:number) {
    
    app.get('/createkey_example1', async (req, res) => {
        const ep = "/createkey";
        const payload : CreateKeyCommandInput = {
            nickname: "key_nick_" + Date.now()
            //(optional) key: genKey()
        };
        const data = await postEndpoint<CreateKeyCommandInput>(ep, payload,req);
        res.send(data);
    })

    app.get('/createdata_example1', async (req, res) => {
        const ep = "/createdata";
        const payload : EncDataCommandInput = {
            nickname: "data_nick_" + Date.now(),
            key_id: "853de621d46a44ec1ec1ab1fe2ba60d4b3579e2b79f5aef46957f7c049876f0c",
            rawdata: "Encrypt me!"
            //(optional) key: genKey()
        };
        const data = await postEndpoint<EncDataCommandInput>(ep, payload,req);
        res.send(data);
    })
    
    app.get('/createdata_example2', async (req, res) => {
        const ep = "/createdata";
        const payload : EncDataCommandInput = {
            nickname: "data_nick_" + Date.now(),
            key: "k$1SWljYJbbu!(hkxXiV$Eyq^Y947b7c",
            rawdata: "Encrypt me!"
            //(optional) key: genKey()
        };
        const data = await postEndpoint<EncDataCommandInput>(ep, payload,req);
        res.send(data);
    })


    async function postEndpoint<T>(
        ep: string, payload: T,
            req: Request<any, any, any, any>) {
        const test_resp = await fetch(`http://localhost:${port}${ep}`, {
            method: "POST",
            headers: {
                "authorization":req.headers.authorization,
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await test_resp.json();
        return data;
    }
}




