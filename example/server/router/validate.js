import { tryParse } from "../utils";


export const validateRequest = (req, routes) => {



	let err_msg = false;


	if (!req) {

		err_msg = 'invalid request data';

		console.error(err_msg);

		return {
			ok: false,
			err_msg,
			data: false,
		};

	} else if (typeof req !== 'string') {

		err_msg = 'request data must be of type string';

		console.error(err_msg);

		return {
			ok: false,
			err_msg,
			data: false,
		};
	} else {


		let { ok, data, error } = tryParse(req);


		if (!ok) {

			err_msg = 'invalid data format, error:' + error;

			console.error(err_msg);

			return {
				ok: false,
				err_msg,
				data: false,
			};

		} else if (!data.event) {

			err_msg = 'missing event property';

			console.error(err_msg);

			return {
				ok: false,
				err_msg,
				data: false,
			};

		} else if (!routes[data.event]) {

			err_msg = 'no matching event type ' + data.event;

			console.error(err_msg);

			return {
				ok: false,
				err_msg,
				data: false,
			};

		} else {

			return {
				ok: true,
				err_msg: false,
				data,
			};
		}
	}


};
