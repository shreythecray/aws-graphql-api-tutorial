const { CourierClient } = require("@trycourier/courier");
const fetch = require("node-fetch");

const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");
// const uuid = require("uuid/v4"); //needed for list of images

module.exports = async function (context, req) {
    const courier = CourierClient({
        authorizationToken: process.env["API_Key"],
    });

    const FaceAPI_Key = process.env["FaceAPI_Key"];
    const FaceAPI_Endpoint = process.env["FaceAPI_Endpoint"];

    const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': FaceAPI_Key } });
    const client = new Face.FaceClient(credentials, FaceAPI_Endpoint);

    const jonah1 = "https://res.cloudinary.com/practicaldev/image/fetch/s---v2F3sWO--/c_imagga_scale,f_auto,fl_progressive,h_900,q_auto,w_1600/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6r4w0aeyre61ktsu50f7.jpg";

    const jonah2 = "https://pbs.twimg.com/profile_images/1474127491270950915/LMehaQuL_400x400.jpg";

    let detectedFace = await client.face.detectWithUrl(jonah2,
    {
        returnFaceAttributes: ["Emotion"],
        // We specify detection model 1 because we are retrieving attributes.
        detectionModel: "detection_01",
        recognitionModel: "recognition_03"
    });

    const anger = detectedFace[0].faceAttributes.emotion.anger;
    const contempt = detectedFace[0].faceAttributes.emotion.contempt;
    const disgust = detectedFace[0].faceAttributes.emotion.disgust;
    const fear = detectedFace[0].faceAttributes.emotion.fear;
    const happiness = detectedFace[0].faceAttributes.emotion.happiness;
    const neutral = detectedFace[0].faceAttributes.emotion.neutral;
    const sadness = detectedFace[0].faceAttributes.emotion.sadness;
    const surprise = detectedFace[0].faceAttributes.emotion.surprise;

    //TODO: const main_emotion = ;

    context.log("Emotion: " + main_emotion);

    // const response = await fetch(FaceAPI_Endpoint + "/face/v1.0/detect?returnFaceAttributes=emotion", {
    //     method: 'post',
    //     body: {
    //         "url": jonah2
    //       },
    //     headers: {'Ocp-Apim-Subscription-Key': FaceAPI_Key}
    // });
    // const data = await response.json();

    // context.log("Emotion: " + data.anger);

    const email = req.body && req.body.email;
    const name = req.body && req.body.name;

    const { requestId } = await courier.send({

        message: {
    
        to: {
            email: email,
        },
    
        content: {
            title: "Welcome!",
            body: "Thanks for signing up, {{name}}",
        },
    
        data: {
            name: name,
        },
    
        routing: {
            method: "single",
            channels: ["email"], // array of channels
        },
    
        channels: {
            email: {
                providers: ["gmail"], // array of providers
            },
        },
    
        },
    });
    context.log(requestId);

    const responseMessage = email + " was sent successfully with response id: " + requestId;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}