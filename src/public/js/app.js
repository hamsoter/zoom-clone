const socket = io();

const myFace = document.getElementById("myFace");

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = true;
let cameraOff = true;
let roomName;
let myPeerConnection;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((devices) => devices.kind === "videoinput");

    // stream에 인식된 카메라를 집어냄
    const currentCamera = myStream.getVideoTracks()[0];

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

camerasSelect.addEventListener("input", async (e) => {
  await getMedia(e.target.value);

  if (myPeerConnection) {
    const newVideoTrack = myStream.getVideoTracks()[0];

    console.log(newVideoTrack);
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");

    console.log(videoSender);
    videoSender.replaceTrack(newVideoTrack);
  }
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

const HandlerCameraBtn = () => {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
    console.log(track.enabled);
  });
  if (!cameraOff) {
    cameraBtn.innerHTML = "카메라 켜짐상태";
    cameraBtn.style.background = "";
    cameraBtn.style.border = "";
    cameraOff = true;
  } else {
    cameraBtn.innerHTML = "카메라 꺼짐상태";
    cameraBtn.style.background = "crimson";
    cameraBtn.style.border = "2px solid crimson";
    cameraOff = false;
  }
};

const HandlerMuteClick = () => {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  if (!muted) {
    muteBtn.innerHTML = "마이크 켜짐상태";
    muteBtn.style.background = "";
    muteBtn.style.border = "";
    muted = true;
  } else {
    muteBtn.innerHTML = "마이크 꺼짐상태";
    muteBtn.style.background = "crimson";
    muteBtn.style.border = "2px solid crimson";
    muted = false;
  }
};

muteBtn.style.background = "";
muteBtn.style.border = "";
cameraBtn.style.background = "";
cameraBtn.style.border = "";

muteBtn.addEventListener("click", HandlerMuteClick);
cameraBtn.addEventListener("click", HandlerCameraBtn);

// 방 생성 및 입장 (socket으로 서버와 통신)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
  welcomeForm.hidden = true;
  call.hidden = false;
  await getMedia();
  HandlerCameraBtn();
  HandlerMuteClick();

  makeConnection();
};

const handleWelcomeSubmit = async (e) => {
  e.preventDefault();
  const input = e.target.querySelector("input");

  console.log(input.value);
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
};

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// 타인의 방 입장 이벤트 (Peer A에서 실행)
socket.on("welcome", async () => {
  // 연결을 위한 나의 고유 offer setting
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);

  socket.emit("offer", offer, roomName);
  console.log("A: offer를 보냈음");
});

// Peer B에서 실행
socket.on("offer", async (offer) => {
  console.log("B: offer를 받음");
  myPeerConnection.setRemoteDescription(offer);

  const answer = await myPeerConnection.createAnswer();
  console.log(answer);
  myPeerConnection.setLocalDescription(answer);

  socket.emit("answer", answer, roomName);
  console.log("B: answer를 보냈음");
});

socket.on("answer", (answer) => {
  console.log("A: answer를 받았음");

  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("candidate받음");
  console.log(ice);
  myPeerConnection.addIceCandidate(ice);
});

// RTC 연결
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);

  // myPeerConnection.addEventListener("addstream", handleAddStream);

  myPeerConnection.addEventListener("track", handleTrack);

  function handleTrack(data) {
    console.log("handle track");
    const peerFace = document.querySelector("#peerFace");
    peerFace.srcObject = data.streams[0];
  }

  // myPeerConnection에 전송할 mediaTrack들 담기
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
};

const handleIce = (data) => {
  console.log("candidate 보냄");
  socket.emit("ice", data.candidate, roomName);
  console.log("canditate!!!!");
};

// 스트림이 정상적으로 교환된 후
const handleAddStream = (data) => {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
};
