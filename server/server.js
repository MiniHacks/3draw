/* eslint-disable @typescript-eslint/no-var-requires */
const http = require("http");
const path = require("path");
const express = require("express");
const socketIo = require("socket.io");
const easyrtc = require("open-easyrtc");
const grinkus = require("@google-cloud/speech").v1p1beta1,
      grinkusClient = new grinkus.SpeechClient({
          projectId: 'speechtotext@draw-342602.iam.gserviceaccount.com',
          keyFile: './google-creds.json'
      });
const fs = require("fs");

process.title = "NAF-server";
const port = process.env.PORT || 3001;
const app = express();
app.use(express.static(path.resolve(__dirname, "..", "static")));
//app.use(express.json({ limit: "100mb" }));

app.use(express.json());

// Serve and build the bundle in development.
if (process.env.NODE_ENV === "development") {
    const webpackMiddleware = require("webpack-dev-middleware");
    const webpack = require("webpack");
    const config = require("../webpack.config");

    app.use(
        webpackMiddleware(webpack(config), {
            publicPath: "/",
        })
    );
}

const webServer = http.createServer(app);

// Start socket.io so it attaches itself to Express server
const socketServer = socketIo.listen(webServer, { "log level": 1 });
const myIceServers = [{ urls: "stun:stun1.l.google.com:19302" }, { urls: "stun:stun2.l.google.com:19302" }];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("demosEnable", false);

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", (socket, easyrtcid, msg, socketCallback, callback) => {
    easyrtc.events.defaultListeners.easyrtcAuth(
        socket,
        easyrtcid,
        msg,
        socketCallback,
        (err, connectionObj) => {
            if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
                callback(err, connectionObj);
                return;
            }

            connectionObj.setField("credential", msg.msgData.credential, { isShared: false });

            console.log(
                "[" + easyrtcid + "] Credential saved!",
                connectionObj.getFieldValueSync("credential")
            );

            callback(err, connectionObj);
        }
    );
});

let transcriptionClients = {};

easyrtc.events.on('easyrtcMsg', (conn, msg, cb, next) => {
    let clientId = conn.getEasyrtcid();
    //console.log(`easyrtcMsg recvd from ${clientId}`);

    let {msgType: typ, msgData: rawData} = msg;

    let buffer = new Int16Array(Object.values(rawData));
    switch(typ) {
        case 'AUDIO_DATA':
            let transcript = transcriptionClients[clientId] ?
                transcriptionClients[clientId] :
                {
                    stream: grinkusClient
                        .streamingRecognize({
                            config: {
                                encoding: 'LINEAR16',
                                languageCode: 'en-US',
                                sampleRateHertz: 48000,
                            },
                            interimResults: true,
                        }).on('data', data => {
                            console.log(`we received data! ${data}`);
                            if (!(data.results[0] && data.results[0].alternatives[0]))
                                return;

                            console.log(data.results[0].alternatives[0].transcript);
                        }).on('error', e => {
                            console.error(e);
                            transcriptionClients[clientId] = null;

                        }),
                    ts: Date.now(),
                }
            console.log(transcriptionClients);
            if(transcript?.stream?.writable) {
                //console.log("we are writing da stream baybee");
                transcript.stream.write(buffer);
                fs.writeFileSync("data.pcm", buffer, {
                    flag: 'a',
                });

            }

            if(Date.now() - transcript.ts > 1000 * 60 * 4 + 30) {
                console.log(`killing session, delta ${Date.now() - transcript.ts}`);
                transcript?.stream?.end();
                transcript = null;
            }

            transcriptionClients[clientId] = transcript;

            break;
    }
    next(null);
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", (connectionObj, roomName, roomParameter, callback) => {
    console.log(
        "[" + connectionObj.getEasyrtcid() + "] Credential retrieved!",
        connectionObj.getFieldValueSync("credential")
    );

    connectionObj.events.on('AUDIO_DATA', (data) => {
        console.log(`We got an event:\n${connectionObj}\nData:\n${data}`);
    });
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
easyrtc.listen(app, socketServer, null, (err, rtcRef) => {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", (appObj, creatorConnectionObj, roomName, roomOptions, callback) => {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(
            appObj,
            creatorConnectionObj,
            roomName,
            roomOptions,
            callback
        );
    });
});

app.post("/stt", express.raw({ type: 'audio/l16' }), (req, res) => {
    const endpoint = "https://speech.googleapis.com/v1/speech:longrunningrecognize",
          KEY = process.env.GOOGLE_API_KEY;

    https.request('https://speech.googleapis.com/v1/speech:recognize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }).end();



    console.log("your mom", req.body);
    res.send({status: true});

});



// Listen on port
webServer.listen(port, () => {
    console.log("listening on http://0.0.0.0:" + port);
});
