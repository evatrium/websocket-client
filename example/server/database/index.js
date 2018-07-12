import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import {uniqueID} from '@iosio/utils/lib/number_generation';
import {removeItemFromObjArrById, updateItemInObjArrById} from '@iosio/utils/lib/crud_operations'
import Fuse from 'fuse.js';

const adapter = new FileSync('./database/data.json');
export const db = low(adapter);

const add_store = (name) => {
    if (!db.get(name).value()) {
        let state = db.getState();
        state[name] = [];
        db.setState(state);
    }
};

export class Crud {
    constructor({name, search_options}) {
        if (!name) {
            console.error('must provide name to crud');
            return;
        }
        add_store(name);
        this.crud_name = name;
        this.setSearchOptions(search_options);
    }


    create = (item) => {
        item._id = uniqueID();
        db.get(this.crud_name).push(item).write();
    };

    get = () => {
        return db.get(this.crud_name).value();
    };

    removeItemById = (id) => {
        let old_items = this.get();
        let updated_items = removeItemFromObjArrById(old_items, '_id', id);
        return this.setState(updated_items);
    };

    updateItem = (item) => {
        let old_items = this.get();
        let updated_items = updateItemInObjArrById(old_items, '_id', item._id, item);
        return this.setState(updated_items);
    };

    setState = (updated_items) => {
        if (!updated_items) {
            return {ok: false}
        }
        let store = db.getState();
        let combined = {...store, [this.crud_name]: updated_items};
        db.setState(combined).write();
        return {ok: true, data: this.get()};
    };


    setSearchOptions = (search_options) => {
        let search_options_defaults = {
            shouldSort: true,
            threshold: 0.3,
            location: 0,
            distance: 1000,
            maxPatternLength: 40,
            minMatchCharLength: 1,
            keys: ['name']
        };

        if (search_options) {
            this.search_options = {...search_options_defaults, ...search_options}
        } else {
            this.search_options = search_options_defaults;
        }
    };

    search = (search_value, options) => {
        options && this.setSearchOptions(options);

        if(!search_value){
            return this.get();
        }

        let old_items = this.get();

        let fuse = new Fuse(old_items, this.search_options);
        let results = fuse.search(search_value);
        return results;
    }

}


/*
     ------------ TESTER ------------
 */
// let items = new Crud({name: 'items'});
//
//
// items.setState([]);
//
// items.create({name: 'asdf'});
//
// console.log('created items', items.get());
//
// let them = items.get();
//
// them[0].name = 'derp'
//
// items.updateItem(them[0]);
//
// console.log('updated items', items.get());
//
// items.removeItemById(them[0]._id);
//
// console.log('item removed', items.get());
//
// items.create({name: 'asdf'});
//
// console.log('search results',items.search('asd'));