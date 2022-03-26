const socket = io();

const myFace = document.getElementById("myFace");

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;

let muted = false;
let cameraOff = false;

const getMedia = async () => {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: "true",
      video: "true",
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
};
getMedia();

const cameraBtnHandler = () => {
  if (cameraOff) {
    cameraBtn.innerHTML = "카메라 켜기";
    cameraBtn.style.background = "";
    cameraBtn.style.border = "";
    cameraOff = false;
  } else {
    cameraBtn.innerHTML = "카메라 끄기";
    cameraBtn.style.background = "crimson";
    cameraBtn.style.border = "2px solid crimson";
    cameraOff = true;
  }
};

const muteBtnHandler = () => {
  if (muted) {
    muteBtn.innerHTML = "마이크 켜기";
    muteBtn.style.background = "";
    muteBtn.style.border = "";
    muted = false;
  } else {
    muteBtn.innerHTML = "마이크 끄기";
    muteBtn.style.background = "crimson";
    muteBtn.style.border = "2px solid crimson";
    muted = true;
  }
};

muteBtn.addEventListener("click", muteBtnHandler);
cameraBtn.addEventListener("click", cameraBtnHandler);

cameraBtnHandler();
muteBtnHandler();
