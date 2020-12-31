import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { decrypt, encrypt, genKey, getKeyID } from '../crypto/encryption';
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

    if (!body["nickname"])
        return fastFail("Please specify nickname")

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

// == == == == == == == == == == == == == == == == == == == ==

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

// == == == == == == == == == == == == == == == == == == == ==

export interface EncDataCommandInput {
    // Either provide the key or its hash (=key_id)
    key?: string
    key_id?: string,

    rawdata: string,
    nickname: string
}

export interface EncDataCommandOutput {
    key_id: string,
    data_id: string,
    encdata: string,
    nickname: string
}

async function findKey(client: DynamoDBClient,userId: string, keyId: string)  {
    const findKeyResult = await ddbQueryRowsBy2Id(client,
        DDB_TABLES.ENC_KEYS, userId, "user_id", keyId, "key_id");
    if (!findKeyResult.ok)
        throw findKeyResult.error;

    if (
        Array.isArray(findKeyResult.data) && findKeyResult.data.length > 0
    ) {
        const resultRow = (findKeyResult.data as Array<EncKeyRow>)[0];
        if (resultRow.key_id != keyId) {
            throw `Got key_id '${resultRow.key_id}' while sent '${keyId}'`
        }
         return resultRow.key;
    }
    else {            
        throw "Can't find key_id under user"
    }
}

export async function apiCreateEncData(
    client: DynamoDBClient, body: EncDataCommandInput, userId: string):
    Promise<ExpressResult<EncDataCommandOutput>> {

    if (!body.nickname || !body.rawdata)
        return fastFail("Missing post values");

    if (!body.key && !body.key_id)
        return fastFail("No key/id sent")

    let keyId = body.key_id || getKeyID(body.key);
    let key = body.key;
    if (!key) {
        try {
            key = await findKey(client, userId, keyId)
            if (key == "")
                return fastFail("Key came up empty for id " + keyId)
        } catch (error) {
            return fastFail(error)
        }
    }
    
    const encryptedData = encrypt(body.rawdata, key);
    const dataId  = getKeyID(encryptedData);

    const rowData: DataEncRow = {
        user_id: userId,
        nickname: body.nickname,
        data_enc_val: encryptedData,
        data_id: dataId,
        key_id: keyId,
    };

    const putResult = await ddbCreateUpdateRow(
        client, DDB_TABLES.ENC_DATA, rowData
    );

    if (!putResult.ok)
        return fastFail(putResult.error);

    return fastData<EncDataCommandOutput>({
        key_id: keyId,  data_id: dataId, encdata: encryptedData, nickname: body.nickname
    });
}

// == == == == == == == == == == == == == == == == == == == ==

export interface DecDataFullKeyCommandInput {
    // Either provide the key or its hash (=key_id)
    key: string,
    data_id: string,
}

export interface DecDataCommandOutput {
    data_id: string,
    nickname: string,
    plaindata: string
}

export async function apiDecDataByFullKey(
    client: DynamoDBClient, body: DecDataFullKeyCommandInput, userId: string):
    Promise<ExpressResult<DecDataCommandOutput>> {

    if (!body.data_id)
        return fastFail("Missing data_id");

    if (!body.key )
        return fastFail("No key/keyid sent")

    let encDataRow = await ddbQueryRowsBy2Id<DataEncRow>(client,
        DDB_TABLES.ENC_DATA, userId, "user_id", body.data_id, "data_id");
    if (!encDataRow.ok)
        return fastFail(encDataRow.error)
    if (!Array.isArray(encDataRow.data) || encDataRow.data.length < 1)
        return fastFail("Can't find data for data_id=" + body.data_id)

    let keyId = getKeyID(body.key);
    let key = body.key;

    if (encDataRow.data[0].key_id != keyId)
        return fastFail(`Got keyId '${keyId}' != ` + 
        `stored id of '${encDataRow.data[0].key_id}'`)

    const dataEncrypred = encDataRow.data[0].data_enc_val;
    const decryptedData = decrypt(dataEncrypred, key);

    return fastData<DecDataCommandOutput>({
        data_id: encDataRow.data[0].data_id, 
        nickname:  encDataRow.data[0].nickname,
        plaindata: decryptedData
    });
}


/* export async function apiDecDataByTimeSlot(
    client: DynamoDBClient, body: DecDataCommandInput, userId: string):
    Promise<ExpressResult<DecDataCommandOutput>> {

    if (!body.data_id)
        return fastFail("Missing data_id");

    if (!body.key && !body.key_id)
        return fastFail("No key/keyid sent")

    let encDataRow = await ddbQueryRowsBy2Id<DataEncRow>(client,
        DDB_TABLES.ENC_DATA, userId, "user_id", body.data_id, "data_id");
    if (!encDataRow.ok)
        return fastFail(encDataRow.error)
    if (!Array.isArray(encDataRow.data) || encDataRow.data.length < 1)
        return fastFail("Can't find data for data_id=" + body.data_id)

    let keyId = body.key_id || getKeyID(body.key);
    let key = body.key;
    if (!key) {
        try {
            key = await findKey(client, userId, keyId)
            if (key == "")
                return fastFail("Key came up empty for id " + keyId)
        } catch (error) {
            return fastFail(error)
        }
    }

    if (encDataRow.data[0].key_id != keyId)
        return fastFail(`Got keyId '${keyId}' != ` + 
        `stored id of '${encDataRow.data[0].key_id}'`)

    const dataEncrypred = encDataRow.data[0].data_enc_val;
    const decryptedData = decrypt(dataEncrypred, key);

    return fastData<DecDataCommandOutput>({
        data_id: encDataRow.data[0].data_id, 
        nickname:  encDataRow.data[0].nickname,
        plaindata: decryptedData
    });
} */