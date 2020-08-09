import deepGet from 'lodash/get';

const LOG_TAG = "responseHandler :: ";
class ResponseHandler {

    getResponse = (res, callback) => {
        this.response = res;
        
        this[callback].apply(this);     //context[fnName].apply(context)
        return this[callback]();
    }

    getQueryText = () => {
        this.queryText = deepGet(this.response, `queryResult.queryText`);
        return this.queryText;
    }

    getIntentName = () => {
        this.intent = deepGet(this.response, `queryResult.intent`);
        if(this.intent){
            this.intentDisplayName = deepGet(this.response, `queryResult.intent.displayName`);
            return this.intentDisplayName;
        }
        return this.intent;
    }

    getCustomPayload = () => {
        let payloadObj = {
            success: false,
            data: {}
        };
        this.fullfillmentMsgs = deepGet(this.response, `queryResult.fulfillmentMessages`);

        if(this.fullfillmentMsgs && this.fullfillmentMsgs[0]){
            let fullfillmentObj = this.fullfillmentMsgs[0];

            if(fullfillmentObj.message == 'payload'){
                this.payload = fullfillmentObj.payload;
            }
        }
        
        if(this.payload && this.payload.fields){
            let fields = this.payload.fields;

            if(fields && fields.feedback && fields.feedback.kind == 'numberValue'){
                payloadObj.data['feedback'] = fields.feedback && fields.feedback.numberValue;
                let feedback = payloadObj.data['feedback'];

                if(feedback > 0){
                    payloadObj['success'] = true;
                }
            }

            if(fields && fields.action && fields.action.kind == 'stringValue'){
                payloadObj.data['action'] = fields.action && fields.action.stringValue;
            }

            if(fields && fields.entity && fields.entity.kind == 'stringValue'){
                payloadObj.data['entity'] = fields.entity && fields.entity.stringValue;
            }
        }

        console.log(LOG_TAG, payloadObj);

        return payloadObj;
    }

    isEndOfConversation = () => {
        let diagnose = deepGet(this.response, `queryResult.diagnosticInfo.fields.end_conversation`);
        if(diagnose && diagnose.kind == "boolValue"){
            return diagnose.boolValue;
        }
        return false;
    }
}

export default new ResponseHandler();