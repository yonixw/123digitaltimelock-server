* app has pass in ENV.
APIs:
	[V] pass_id: () => {salt, hash(salt,pass)}
	[ ] locked_data: (data) => enc(pass,data), data_id=hash(salt,data), salt, pass_id
		- `pass_id` to help us know if originated from here
		- You keep!
	[ ] make_slot: (data, from, to) => hash(pass, from, to), pass_id
		- `data` to prove you are owner of data
		- `pass` to say it is relevant to this ENV
		- You keep!
	[ ] use_slot (locked_data, time slot) => plain_text
	[ ] admin_unlock (pass, locked_data) => plain_text
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