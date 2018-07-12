

//find object in array where property <match_prop> matches the given value <id>
export const deepClone = (check_obj) => {
    return JSON.parse(JSON.stringify(check_obj));
};

/**
 * grabs an object from an array by a key value match, will return false if no match is found
 * @param {Array} arr - array to search in
 * @param {String} match_prop - the property on the object to look on
 * @param {String|Number} id - the value on the match_prop to search for
 * @returns {Array|Boolean} - array or boolean
 */
export const findByIdInObjArr = (arr, match_prop, id) => {
    let item = false;
    //Object.keys iterates through an object returning keys an values: //{key: value} *or {key: o[key]}
    if (arr && match_prop && (id || id === 0)) {
        arr.forEach((obj) => {
            Object.keys(obj).forEach((key) => {
                if (key === match_prop) {
                    if (obj[key] === id) {
                        item = obj;
                    }

                }
            });
        });
    }
    return item;
};

const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};
export const uniqueID = () => {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};


/**
 * removes an item from an array by its index
 * @param {Array} arr - array to filter
 * @param {Number} index - index to remove
 * @returns {Array} - the updated array
 */
export const removeItemFromArrayByIndex = (arr, index) => {
    arr.splice(index, 1);
    return arr;
};

/**
 * finds an object on an array by the given key value (match_prop: id)
 * removes the object from the array and returns a new array
 * @param {Array} arr - the array to search in
 * @param {String} match_prop - the property containing the value (id)
 * @param {String} id - the value on the property to find (match_prop)
 * @returns {Array} - the updated array - or original if not found
 */
export const removeItemFromObjArrById = (arr, match_prop, id) => {
    let index = findByIdInObjArr_give_index(arr, match_prop, id);
    if (index !== false) {
        return removeItemFromArrayByIndex(arr, index);
    }else{
        return arr;
    }
};




/**
 * gives the index of the object looking for, given the key value
 * @param {Array} arr - array to search in
 * @param {String} match_prop -  the property on the object to look on
 * @param {String|Number} id - the value on the match_prop to search for
 * @returns {Number|Boolean} - or false if no match is found
 */
export const findByIdInObjArr_give_index = (arr, match_prop, id) => {
    let item = false;
    //Object.keys iterates through an object returning keys an values: //{key: value} *or {key: o[key]}
    if (arr && match_prop && (id || id === 0)) {

        arr.forEach((obj, indi) => {
            Object.keys(obj).forEach((key) => {

                if (key === match_prop) {
                    if (obj[key] === id) {
                        item = indi;
                    }

                }
            });
        });
    }

    return item;
};


/**
 * finds an object in an array by an id , updates it to a new value and returns the updated array
 * @param {Array} arr - array to search in
 * @param {String} match_prop - the property on the object to look on
 * @param {String|Number} id -  the value on the match_prop to search for
 * @param {*} update_to - the value to update to
 * @returns {Array} - the updated array
 */
export const updateItemInObjArrById = (arr, match_prop, id, update_to) => {
    let item_index = findByIdInObjArr_give_index(arr, match_prop, id);
    arr[item_index] = update_to;
    return arr;
};




/**
 * attempts to parse stringified data safely and returns an object with the data
 * @param {String} data - stringified json
 * @returns {{ok: boolean, data: any, error: boolean}|{ok: boolean, data: null, error: *}}
 */
export const tryParse = (data) => {

	let parsed_data;

	try {
		parsed_data = {ok: true, data: JSON.parse(data), error: false};
	} catch (e) {

		parsed_data = {ok: false, data: false, error: e.message};
	}

	return parsed_data;
};

