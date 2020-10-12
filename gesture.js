// const URL = "https://teachablemachine.withgoogle.com/models/EP8cmni6z/";     // 1
// const URL = "https://teachablemachine.withgoogle.com/models/hsfV72Ipy/";     // 2
// const URL = "https://teachablemachine.withgoogle.com/models/6sC4lw_Ee/";     // 3
// const URL = "https://teachablemachine.withgoogle.com/models/w37viqbHw/";     // 4
// const URL = "https://teachablemachine.withgoogle.com/models/S3RJ5tF3i/";     // 5
const URL = "https://teachablemachine.withgoogle.com/models/6sgaiO8an/";        // 6
// const URL = "https://teachablemachine.withgoogle.com/models/2XsJMdnic/";     // audio

let model, webcam, maxPredictions;
let ssCount = 0;
let requestId;
let active = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start") {
        init()
            .then(() => {
                message.active = active = true;
                sendResponse({ message });
            });
        return true;
    }
    else if (message.action === "stop") {
        destroy()
            .then(() => {
                message.active = active = false;
                sendResponse({ message });
            });
        return true;
    }
    else if (message.action === "status") {
        message.active = active;
        sendResponse({ message });
    }
});

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();

    if (!requestId) {
        requestId = window.requestAnimationFrame(loop);
    }
}

async function destroy() {
    await webcam.stop();
    if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = undefined;
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    if (requestId)
        requestId = window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > 0.95) {
            switch (prediction[i].className) {
                case "up":
                    ssCount = 0;
                    window.scrollBy(0, -15);
                    break;
                case "down":
                    ssCount = 0;
                    window.scrollBy(0, 15);
                    break;
                case "idle":
                    ssCount = 0;
                    window.scrollBy(0, 0);
                    break;
                case "screenshot":
                    ssCount += 1;
                    if (ssCount == 100) {
                        html2canvas(document.querySelector('body'),
                            {
                                onrendered: function (canvas) {
                                    var a = document.createElement('a');
                                    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                                    a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                                    a.download = document.querySelector('title').textContent + '.jpg';
                                    a.click();
                                }
                            });
                        ssCount = 0;
                    }
                    break;
                default:
                    ssCount = 0;
                    break;
            }
        }
    }
}