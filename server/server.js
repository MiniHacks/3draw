/* eslint-disable @typescript-eslint/no-var-requires */
const http = require("http");
const path = require("path");
const express = require("express");
const socketIo = require("socket.io");
const easyrtc = require("open-easyrtc");
const grinkus = require("@google-cloud/speech");

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

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", (connectionObj, roomName, roomParameter, callback) => {
    console.log(
        "[" + connectionObj.getEasyrtcid() + "] Credential retrieved!",
        connectionObj.getFieldValueSync("credential")
    );
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
