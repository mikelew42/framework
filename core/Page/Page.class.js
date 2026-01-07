
export default class Page {
    constructor(...args){
        this.assign(...args);
        this.instantiate();
    }

    async instantiate(){
        this.config();
        await this.load();
        this.initialize();
    }

    // initial setup, requests, render page
    config(){
        
        // render *before* loading sub pages
        this.render();
    }

    // request and await the page, and then all the loaders
    async load(){

        if (this.remainder){
            
            await this.load_sub_page();
        }

        // page module can add additional loaders
        await this.loaded;
    }

    initialize(){
        // put the app in the dom
        this.inject();

        // app.ready!
        this.ready.resolve();
    }

    assign(...args){
        return Object.assign(this, ...args);
    }

    render(){
        this.$page = div.c("page");

        View.set_captor(this.$page);
    }
    
    async load_sub_page(){ // 3
        // "/" -> "/page.js"
        // "/path/" -> "/path/page.js"
        // "/path/sub" -> "/path/sub.page.js"

        try {
            const mod = await import(Page.path_to_page_url(this.remainder[0]));
            
            // the page.js can, but doesn't need to export a default
            this.sub = mod.default;
            
            // render the page
            if (this.sub){
                this.$page.append(this.sub);
                // this.$root is not in the body yet
            }
        } catch (error){
            this.$page.ac("error").append(() => {
                h3("Sub Page Load Error");
                pre.c("error", error.message);
            });
        }
    }

    inject(){
        this.$body.append(this.$app);
    }

    // loads a predefined font (see Font class below)
    font(name){
        if (!Font.fonts[name])
            throw "Unknown font";

        if (Font.fonts[name].font){
            console.warn("font already loaded");	
            return;
        }

        const font = new Font(Font.fonts[name]);
        const loaded = font.load(); // promise
        this.loaders.push(loaded); // save the promise
        Font.fonts[name].font = font; // cache the font
        return loaded; // allow await app.font(...)
    }

    stylesheet(meta, url){
        return View.stylesheet(meta, url);
    }

    get ready(){
        if (!this._ready){
            let resolve;
            this._ready = new Promise((res) => {
                resolve = res;
            });
            this._ready.resolve = resolve;
        }
        return this._ready;
    }

    get loaded(){
        return Promise.all(View.stylesheets.concat(this.loaders));
    }

    static stylesheet(meta, url){
        return View.stylesheet(meta, url);
    }

    static path_to_page_url(path){
        // "/" -> "/page.js"
        // "/path/" -> "/path/page.js"
        if (path.endsWith("/")){
            return path + "page.js";
        
        // "/sub" -> "/sub.page.js" or
        // "/path/sub" -> "/path/sub.page.js"
        } else {
            return path + ".page.js";
        }
    }

    static meta_to_url(meta, url){
        return new URL(url, meta.url).href;
    }
}