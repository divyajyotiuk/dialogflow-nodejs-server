# dialogflow-nodejs-server

https://divyajyotiuk.github.io/dialogflow-nodejs-server/

This project aims to create a Custom Voice Assistant for Enterprise Usage. Your own Voice User Interface (VUI), enabling voice commands to make user experience richer in websites.

1. For capturing voice on browser - uses [RecordRTC](https://www.npmjs.com/package/recordrtc), a WebRTC Javascript library for audio/video/screen activity recording.
2. Using DialogFlow’s client library (available within npm) to make the bot that will enable VUI.


- Integrating website with Dialogflow agent.
- Google's Dialogflow is well known for natural language understanding platform. 
- It is recommended that you understand how Dialogflow Agent works before you use this project. Here is the [documentation](https://cloud.google.com/dialogflow/docs) and try training the agent on [console](https://dialogflow.cloud.google.com/) before you begin. 
  - Start by creating an Agent and understanding how Intents work. 

## Dailogflow Project Setup

- Create an agent on Dialogflow console. (https://dialogflow.cloud.google.com/)
- Enable Beta features in the settings. 
- In this project, [Node.js Client Library](https://cloud.google.com/dialogflow/docs/reference/libraries/nodejs) has been used to integrate the Dialogflow agent with the website. 
- You can find the github repo for [Dialogflow API: Node.js](https://github.com/googleapis/nodejs-dialogflow) Client here.

### Quick start
- [Select or create a Google Cloud Platform project](https://console.cloud.google.com/project). (If you've already created on Dialogflow, you'll find it with the same login on GCP)
- [Enable the Dialogflow API.](https://console.cloud.google.com/flows/enableapi?apiid=dialogflow.googleapis.com). After API is enabled, you'll need the credentials to use the API. 
- Set up authentication with a service account so you can access the API from your local workstation. Follow the steps given [here](https://cloud.google.com/docs/authentication/getting-started)
- Set the environment variable before running your client-server instances.
- `source env_vars.sh` where env_vars.sh has this content `export GOOGLE_APPLICATION_CREDENTIALS="[COMPLETE-PATH-TO-JSON-FILE]"`

## Settings

You can create a .env file for your environment constants. I have put the settings likewise. 
[dotenv](https://www.npmjs.com/package/dotenv) has been used to load these environment constants. 
```
const env = require('dotenv').config({ path: '.env' });
```

```
PROJECT_ID=your-project-id
LANGUAGE_CODE=en-US
ENCODING=AUDIO_ENCODING_LINEAR_16
SAMPLE_RATE_HERTZ=16000
SINGLE_UTTERANCE=false
SPEECH_ENCODING=LINEAR16
PORT=8000
```

### RecordRTC audio config

```js
//wav header
let options = {
	type: 'audio',
	mimeType: 'audio/webm',
	numberOfAudioChannels: 1,
	checkForInactiveTracks: true,
	bufferSize: 16384,
	sampleRate: 44100,
	desiredSampRate: 16000,
	recorderType: RecordRTC.StereoAudioRecorder,

	// get intervals based blobs
	// value in milliseconds
	// as you might not want to make detect calls every 5 seconds
	timeSlice: 5000,

	ondataavailable: (blob) => {
		// 3
		// making use of socket.io-stream for bi-directional
		// streaming, create a stream
		var ioStream = ss.createStream();
		console.log("streaming to server .....");
		// stream directly to server
		// it will be temp. stored locally
		ss(socket).emit('stream', ioStream, {
			name: 'stream.wav', 
			size: blob.size
		});
		// pipe the audio blob to the read stream to not overwhelm source and destination of different speeds
		ss.createBlobReadStream(blob).pipe(ioStream);
	}
};
```

### Dialogflow audio config

```js
oThis.request = {
    session: oThis.sessionPath,
    queryInput: {
	audioConfig: {
	    sampleRateHertz: process.env.SAMPLE_RATE_HERTZ,
	    encoding: process.env.ENCODING,
	    languageCode: process.env.LANGUAGE_CODE
	    // audioChannelCount: 2,                //for multi-channels
	    // enableSeparateRecognitionPerChannel: true
	},
	singleUtterance: process.env.SINGLE_UTTERANCE
    }
};
```

Dialogflow config and RecordRTC wav config should be in sync.

## Workflow Overview

Focuses on building an automatic speech recognition (ASR) engine that keeps running in the background. 

**Prerequisite:** 
Your agent should already be trained in the Dialogflow console.

**Step 1:** Continuosly recording audio using Javascript Library RecordRTC.

**Step 2:** Send the recorded chunks of audio wave to the server (using WebSockets).

**Step 3:** Stream the received audio to Dialogflow from the server.

**Step 4:** Collect the API response from Dialogflow on the server.

**Step 5:** Send a customized response to the client.

**Step 6:** Add action logic on client side based on the response. 



## References
[Blogpost by Lee Boonstra](https://medium.com/google-cloud/building-your-own-conversational-voice-ai-with-dialogflow-speech-to-text-in-web-apps-part-i-b92770bd8b47)

[Self Service Kiosk Demo](https://github.com/dialogflow/selfservicekiosk-audio-streaming)


## Create React App
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

**`yarn start`**

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

**`yarn test`**

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

**`yarn build`**

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

**`yarn eject`**

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

**`yarn build` fails to minify**

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
