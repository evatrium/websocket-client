import {validateRequest} from "./validate";


export const router = (socket, routes, req) => {

    let err;

    if (!socket) {
        err = 'no socket provided to the router';
        console.log(err);
        return;
    }

    let {
        ok,
        err_msg,
        data,
    } = validateRequest(req, routes);


    if (!ok) {

        socket.send(JSON.stringify({
            data: {error: err_msg},
            event: 'server_error'
        }));


    } else {

        // console.log(data.event);


        let controller = routes[data.event].controller ? routes[data.event].controller : false;

        let respond_to = routes[data.event].respond_to ? routes[data.event].respond_to : false;

        if (!controller) {

            err_msg = 'no controller provided for this event';

            console.error(err_msg);

            socket.send(JSON.stringify({
                data: {error: err_msg},
                event: 'server_error'
            }));

        }
        // console.log('dataaaaaa', data);
        if (data.data && data.data.type && data.data.type === 'request' && data.data.response_id) {
            respond_to = data.data.response_id;
        }

        //perform the logic and stringify the response
        controller(data.data || data.data.data, (resp) => {

            if (!respond_to) {

                console.error('no respond_to provided');

            } else {

                socket.send(JSON.stringify({

                    event: respond_to, //the event type the client will check for
                    data: resp

                }));

            }

        });

    }


};
