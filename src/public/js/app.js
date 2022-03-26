const socket = io();

const myFace = document.getElementById("myFace");

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;

let muted = false;
let cameraOff = false;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((devices) => devices.kind === "videoinput");

    // stream에 인식된 카메라를 집어냄
    const currentCamera = myStream.getVideoTracks()[0];

    console.log(currentCamera);

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // stream에서 인식중인 카메라와, 불러온 카메라중 labe이 동일하다면 '선택'
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }

      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

camerasSelect.addEventListener("input", (e) => {
  getMedia(e.target.value);
});

const getMedia = async (deviceId) => {
  // 받은 디바이스 id가 없을 경우에 자동으로 카메라를 설정
  const initialConstrains = {
    audio: "true",
    video: { fancingMode: "user" },
  };
  // 유저로부터 받은 카메라 deviceId로 카메라를 설정
  const cameraConstrains = {
    audio: "true",
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );
    myFace.srcObject = myStream;

    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
};

getMedia();

const HandlerCameraBtn = () => {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
    console.log(track.enabled);
  });
  if (!cameraOff) {
    cameraBtn.innerHTML = "카메라 켜기";
    cameraBtn.style.background = "";
    cameraBtn.style.border = "";
    cameraOff = true;
  } else {
    cameraBtn.innerHTML = "카메라 끄기";
    cameraBtn.style.background = "crimson";
    cameraBtn.style.border = "2px solid crimson";
    cameraOff = false;
  }
};

const HandlerMuteClick = () => {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
    console.log(track.enabled);
  });

  if (!muted) {
    muteBtn.innerHTML = "마이크 켜기";
    muteBtn.style.background = "";
    muteBtn.style.border = "";
    muted = true;
  } else {
    muteBtn.innerHTML = "마이크 끄기";
    muteBtn.style.background = "crimson";
    muteBtn.style.border = "2px solid crimson";
    muted = false;
  }
};

muteBtn.style.background = "crimson";
muteBtn.style.border = "2px solid crimson";
cameraBtn.style.background = "crimson";
cameraBtn.style.border = "2px solid crimson";

muteBtn.addEventListener("click", HandlerMuteClick);
cameraBtn.addEventListener("click", HandlerCameraBtn);
