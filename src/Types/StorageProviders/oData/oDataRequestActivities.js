export class RequestBuilder {
    constructor(context, request){
        this._context = context;
        this._request = request || {};
        this._activities = [];
    }
    get(){
        return this._request; 
    }
    add(activity){
        this._activities.push(activity);
        return this;
    }
    build(){
        this._request.headers = this._request.headers || {}
        this._request.data = this._request.data || {}
        
        this._activities.forEach((a) =>  a instanceof RequestActivity ? 
            a.implementation(this._request, this._context) :
            a(this._request, this._context))
        
        this._activities = [];
        return this;
    }
}

class RequestActivity {
    constructor(){}
    implementation(request, provider){ }
}

class SetRequestActivity extends RequestActivity {
    constructor(key, value){
        super()
        this.key = key;
        this.value = value;
    }
    implementation(request, provider){ }
}

export class SetRequestProperty extends SetRequestActivity {
    implementation(request, provider){
        request[this.key] = this.value
    }
}

export class SetDataProperty extends SetRequestActivity {
    implementation(request, provider){
        request.data[this.key] = this.value
    }
}

export class SetHeaderProperty extends SetRequestActivity {
    implementation(request, provider){
        request.headers[this.key] = this.value
    }
}

export class SetUrl extends SetRequestProperty {
    constructor(url){
        super('requestUri', url)
    }
}

export class AppendUrl extends SetUrl {
    implementation(request, provider){
        request[this.key] == request[this.key] || ""
        request[this.key] += this.value
    }
}

export class SetMethod extends SetRequestProperty {
    constructor(method){
        super('method', method)
    }
}

export class SetProperty extends SetDataProperty {
}

export class SetNavigationProperty extends SetDataProperty {
    implementation(request, provider){
        request.data[this.key] = this.value
    }
}

export class ClearRequestData extends RequestActivity {
    implementation(request, provider){
        delete request.data;
    }
}
