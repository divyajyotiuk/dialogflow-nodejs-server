const dialogflow = require('dialogflow').v2beta1;
const uuid = require('uuid');
const pump = require('pump');
const { Transform } = require('stream');

class DialogFlowService {
    constructor(){
        this.projectId      = process.env.PROJECT_ID;    //The project to be used
        this.sessionId      = uuid.v4();                 // A unique identifier for the given session
        this.sessionClient  = null;
        this.sessionPath    = null;
        this.request        = null;
        this.response       = null;
        this.init();
    }

    init = async () => {
        this.sessionClient = await new dialogflow.SessionsClient();
        this.setProjectAgentSessionPath();
    }

    setRequest = () => {
        const oThis = this;

        oThis.request = {
            session: oThis.sessionPath,
            queryInput: {
                audioConfig: {
                    sampleRateHertz: process.env.SAMPLE_RATE_HERTZ,
                    encoding: process.env.ENCODING,
                    languageCode: process.env.LANGUAGE_CODE
                    // audioChannelCount: 2,
                    // enableSeparateRecognitionPerChannel: true
                },
                singleUtterance: process.env.SINGLE_UTTERANCE
            }
        };
    }

    setProjectAgentSessionPath = () => {
        this.sessionPath = `projects/${this.projectId}/agent/sessions/${this.sessionId}`;
    }

    /**
     * DetectIntent it receives the intent match results after all audio has been sent and processed.
     * @param {AudioBuffer} audio 
     */
    detectIntentDialogflow = async (audio) => {
        const oThis = this;

        oThis.request.inputAudio = audio;
        const responses = await oThis.sessionClient.detectIntent(oThis.request);
        oThis.response = responses[0].queryResult;
    }

    /**
     * The StreamingDetectIntent performs bidirectional streaming intent detection: receive results while sending audio. 
     * This method is only available via the gRPC API (not REST).
     * @param {AudioStream} audio 
     * @param {function} callback 
     */
    detectIntentStreamDialogFlow = async (audio, callback) => {
        const oThis = this;
        oThis.setRequest();
        const detectStream = oThis.sessionClient.streamingDetectIntent()
                        .on('data', (data) => {
                            if (data.recognitionResult) {
                                console.log(
                                  `Intermediate transcript:
                                  ${data.recognitionResult.transcript}`
                                );
                              } else {
                                  console.log(`Detected intent:`);
                                  callback(data);
                              }
                        })
                        .on('error', (err) => {
                            console.log(err);
                        })
                        .on('end', () => {
                            console.log('on end...');
                        });
                        
        detectStream.write(oThis.request);

        await pump(audio, 
            new Transform({
                objectMode: true,
                transform: (obj, _, next) => {
                    next(null, { inputAudio: obj });
                }
            }),
            detectStream
        );
    }

    /**
     * returns custom payload
     * The custom response which you set in DialogFlow console
     * @returns {object} with keys 
     * @name action @type {string} 
     * @name entity @type {string}
     * @name feedback @type {number}
     */
    getPayloadObject = () => {
        if(!this.response) return;

        if(!this.response.fulfillmentMessages) return;

        let payload = this.response.fulfillmentMessages[0] && this.response.fulfillmentMessages[0].payload;
        return payload;
    }

    getQueryText = () => this.response.queryText;

    /**
     * @returns {object}
     */
    getResponse = () => this.response;

    /**
     * @returns {object} with keys
     * @name name @type {string}
     * @name displayName @type {string}
     * @name endInteraction @type {boolean}
     */
    getIntentObject = () => this.response.intent;

}

module.exports = new DialogFlowService();

/* Raw DialogFlow Response
{
    "responseId": "fc02cc03-8993-4b56-a703-3dda4be7ade2-0820055c",
    "queryResult": {
        "queryText": "hey lucy, turn off the video",
        "parameters": {},
        "allRequiredParamsPresent": true,
        "fulfillmentMessages": [
            {
                "payload": {
                    "entity": "video",
                    "feedback": 1,
                    "action": "off"
                }
            }
        ],
        "intent": {
            "name": "projects/lucy-krbhsb/agent/intents/e53cb0ef-e525-4d72-9297-c92f9cb13928",
            "displayName": "Hey Lucy, turn OFF video",
            "endInteraction": true
        },
        "intentDetectionConfidence": 1,
        "diagnosticInfo": {
            "end_conversation": true
        },
        "languageCode": "en"
    }
}
*/