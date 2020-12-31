import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { encrypt, genKey, getKeyID } from '../crypto/encryption';
import {
    DataEncRow,
    DDB_TABLES,
    EncKeyRow, ExpressResult
} from './models';
import { ddbCreateUpdateRow, ddbQueryRowsById, ddbQueryRowsBy2Id } from './utils';
import { fastFail, fastData } from './models';


export interface CreateKeyCommandInput {
    nickname: string,
    key?: string
}

export interface CreateKeyCommandOutput {
    key: string,
    key_id: string,
    nickname: string
}

export async function apiCreateKey(
    client: DynamoDBClient, body: CreateKeyCommandInput, userId: string):
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
        key: key, key_id: key_id, nickname: body.nickname
    });
}


export type ListKeysCommandOutput = Array<{
    key_id: string,
    nickname: string
}>

export async function apiListUserKeys(
    client: DynamoDBClient, userId: string): Promise<ExpressResult<ListKeysCommandOutput>> {
    const listResult = await ddbQueryRowsById(client, DDB_TABLES.ENC_KEYS,
        userId, "user_id", ["nickname", "key_id"], -1);

    if (listResult.ok) {
        return fastData<ListKeysCommandOutput>(
            (listResult.data as Array<EncKeyRow>).map(e => {
                return {
                    key_id: e.key_id,
                    nickname: e.nickname
                }
            })
        );
    }
    return fastFail(listResult.error);
}

export interface EncDataCommandInput {
    // Either provide the key or its hash (=key_id)
    key?: string
    key_id?: string,

    rawdata: string,
    nickname: string
}

export interface EncDataCommandOutput {
    key_id: string,
    encdata: string,
    nickname: string
}

export async function apiCreateEncData(
    client: DynamoDBClient, body: EncDataCommandInput, userId: string):
    Promise<ExpressResult<EncDataCommandOutput>> {

    if (!body.nickname || !body.rawdata)
        return fastFail("Missing post values");

    if (!body.key && !body.key_id)
        return fastFail("No key sent")

    let keyId = body.key_id || getKeyID(body.key);
    let key = body.key;
    if (!key) {
        // TODO: find key by user id+key id
        const findKeyResult = await ddbQueryRowsBy2Id(client,
            DDB_TABLES.ENC_KEYS, userId, "user_id", keyId, "key_id");
        if (!findKeyResult.ok)
            return fastFail(findKeyResult.error);

        if (
            Array.isArray(findKeyResult.data) && findKeyResult.data.length > 0
        ) {
            const resultRow = (findKeyResult.data as Array<EncKeyRow>)[0];
            if (resultRow.key_id != keyId) {
                return fastFail(`Got key_id '${resultRow.key_id}' while sent '${keyId}'`)
            }
            key = resultRow.key;
        }
        else {            
            return fastFail("Can't find key_id under user")
        }
    }
    

    const encryptedData = encrypt(body.rawdata, key);

    const rowData: DataEncRow = {
        user_id: userId,
        nickname: body.nickname,
        data_enc_val: encryptedData,
        data_id: getKeyID(encryptedData),
        key_id: keyId,
    };

    const putResult = await ddbCreateUpdateRow(
        client, DDB_TABLES.ENC_DATA, rowData
    );

    if (!putResult.ok)
        return fastFail(putResult.error);

    return fastData<EncDataCommandOutput>({
        key_id: keyId, encdata: encryptedData, nickname: body.nickname
    });
}