const dialogflow = require('dialogflow').v2beta1;
const uuid = require('uuid');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function init(projectId = process.env.PROJECT_ID) {  //update your project ID

    // A unique identifier for the given session
    const sessionId = uuid.v4();

    console.log(dialogflow);
    // Create a new session

    const sessionClient = await new dialogflow.SessionsClient();
    console.log(sessionClient);
    //const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const sessionPath = `projects/${projectId}/agent/sessions/${sessionId}`;

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: 'hello',
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        }
    };

    // audio query request
    // const request = {
    //     session: sessionPath,
    //     queryInput: {
    //         audioConfig: {
    //             sampleRateHertz: process.env.SAMPLE_RATE_HERTZ,
    //             encoding: process.env.ENCODING,
    //             languageCode: process.env.LANGUAGE_CODE
    //         },
    //         singleUtterance: process.env.SINGLE_UTTERANCE
    //     }
    // };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);

    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
}

module.exports = init;