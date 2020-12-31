For all:
	key can be id or in post.
		for poeple like me that need key behind admin space

(key name, key_id, key_value)
(data_name, data_id, data_enc_value, key_id)
(data_id, start, end, HMAC(start,end,data_id,key_id))

Non locked APIs:
[V] *. Generate Secret=Enc.Key String and return it in full (key name,key_id = hash of key).
	(QR code will contain Secret+ Original data since Secret is enough to get data, see bellow)
*. Delete key_id key_value but keep an ID (For users like me, no point to hold key in DB)
[V]*  List all keys
[X]* List data of keys
*. Get all timeslots and their proofs for data_id

DB Keys (Non locked) or Post Keys:
*. Add data (name:value) & encrypt using key (in db\sent) => return data_id 
*. Show data in timeslot, and decrypt by key_id/key

Key locked APIs:
*. Decrypt data immeditly.
*. Add timeslot (start,end) and proofstring (calculate by HMAC key (**ONLY SENT=like login**)) 
			for (key_id (hash of key), data_id)
    *. For each key, have "X time in advance" which will not be key locked to create time lock

TODO:
	- cut id's length in half