* app has pass in ENV.
APIs:
	[V] pass_id: () => {salt, hash(salt,pass)}
	[V] locked_data: (data) => enc(pass,data), data_id=hash(salt,data), salt, pass_id
		- `pass_id` to help us know if originated from here
		- You keep!
	[V] make_slot: (data, from, to) => hash(pass,data, from, to), pass_id, from,to
		- `data` to prove you are owner of data
		- `pass` to say it is relevant to this ENV
		- You keep!
	[V] use_slot (locked_data, time slot) => plain_text
	[V] admin_unlock (pass, locked_data) => plain_text
* IBY=I Believ You (per data), only in far places
	[ ] data=> IBY = {encdata, hash(data_id,pass)}
	[ ] IBY, from,to = IBY_slot with {enc_data, hash(IBY_hash,from,to)}
	[ ] IBY_SLOT => data
UIs:
	plain data
		- show as Image
		- show as text
		- show as base64

What to have in backup stash (for emergency) (=> private data):
	- pass
What to have always on you (=> public data):
	- locked_data
	- time slots

UI flows:
	- At home, new data, let me prepare LOCKS
		[[- If SaaS, enc_data]]
		- If Hosted, IBY
	- At home, I have timeslot, decrypt it

	Create timeslot:
	[[- Far away, I have my data (But not server pass=>Only SaaS)]]
	- Far away, I have my IBY