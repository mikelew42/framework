function pad2(n){
    return n.toString().padStart(2, '0');
}

export default {
    tid(){
        const now = new Date();
        return now.getFullYear() + "-" +
            pad2(now.getMonth() + 1) + "-" +
            pad2(now.getDate()) + "@" +
            pad2(now.getHours()) + "." +
            pad2(now.getMinutes()) + "." +
            pad2(now.getSeconds()) + "." + now.getMilliseconds();
    }
};