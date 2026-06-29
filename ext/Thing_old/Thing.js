import Savable from '../Savable/Savable.js';

export default class Thing extends Savable {
    thing(){
        console.log("This is a thing");
    }
}