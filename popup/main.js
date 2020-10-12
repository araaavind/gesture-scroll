const startButton = document.getElementById('startControl');
const stopButton = document.getElementById('stopControl');

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let msg = {
        action: "status"
    };
    chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
        if (response.message.active) {
            startButton.style.display = "none";
            stopButton.style.display = "block";
        } else {
            startButton.textContent = "Start";
            startButton.style.display = "block";
            stopButton.style.display = "none";
        }
    });
});

startButton.onclick = () => {
    startButton.textContent = "Starting...";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let msg = {
            action: "start"
        };
        chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
            if (response.message.active) {
                startButton.style.display = "none";
                stopButton.style.display = "block";
            }
        });
    });
};

stopButton.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let msg = {
            action: "stop"
        };
        chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
            if (!response.message.active) {
                startButton.textContent = "Start";
                startButton.style.display = "block";
                stopButton.style.display = "none";
            }
        });
    });
}