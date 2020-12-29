import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { genKey, getKeyID } from '../crypto/encryption';
import {  DDB_TABLES, 
    EncKeyRow, ExpressResult } from './models';
import { ddbCreateUpdateRow, ddbQueryRowsById } from './utils';
import { fastFail, fastData } from './models';


export interface CreateKeyCommandInput {
    nickname:string,
    key?: string
}

export interface CreateKeyCommandOutput {
    key: string,
    key_id: string,
    nickname: string
}

export async function apiCreateKey(
        client: DynamoDBClient, body: CreateKeyCommandInput, userId:string) : 
            Promise<ExpressResult<CreateKeyCommandOutput>> {
                   
    const key = body["key"] || genKey(32);
    const key_id = getKeyID(key);
    const rowData: EncKeyRow = {
        user_id: userId,
        key_id: key_id,
        key: key,
        nickname: body.nickname
    };

    const putResult = await ddbCreateUpdateRow(
        client, DDB_TABLES.ENC_KEYS, rowData
    );

    if (!putResult.ok)
        return fastFail(putResult.error);

    return fastData<CreateKeyCommandOutput>({
        key: key, key_id: key_id, nickname:body.nickname
    });
}


export  type ListKeysCommandOutput  = Array<{
    key_id: string,
    nickname: string
}>

export async function apiListUserKeys(
    client: DynamoDBClient, userId:string): Promise<ExpressResult<ListKeysCommandOutput>>
{
    const listResult = await ddbQueryRowsById(client, DDB_TABLES.ENC_KEYS,
        userId,"user_id",["nickname","key_id"],-1);

    if (listResult.ok) {
        return fastData<ListKeysCommandOutput>(
            (listResult.data as Array<EncKeyRow>).map(e=>{return {
                key_id: e.key_id,
                nickname: e.nickname
            }})
        );
    }
    return fastFail(listResult.error);
}