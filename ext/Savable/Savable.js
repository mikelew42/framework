export default class Savable {
    set(name, value){
        // if name is pojo, iterate
        this.data[name] = value;
        this.save();
    }

    save(){
        this.app.socket.send({
            path: this.path,
            method: "set",
            data: this.data
        })
    }
}