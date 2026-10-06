/* ==========================================
   SETTINGS - edit these
   ========================================== */
const PEOPLE = ["You", "Aman", "Riya", "Sam"];   // first one is you
const REPLY_DELAY_MS = 900;                      // delay of the fake chat reply


/* ==========================================
   PAGE ELEMENTS
   ========================================== */
const videosEl     = document.getElementById("videos");
const clockEl      = document.getElementById("clock");
const chatEl       = document.getElementById("chat");
const msgsEl       = document.getElementById("msgs");
const msgInput     = document.getElementById("msgInput");
const sendBtn      = document.getElementById("send");
const micBtn       = document.getElementById("mic");
const camBtn       = document.getElementById("cam");
const chatToggleBtn = document.getElementById("chatToggle");
const leaveBtn     = document.getElementById("leave");


/* ==========================================
   STATE
   ========================================== */
let stream = null;     // webcam + mic stream (null when camera is off)
let micOn = true;
let camOn = false;
let seconds = 0;       // meeting timer


/* ==========================================
   VIDEO TILES
   ========================================== */
function createTile(name, index) {
  const tile = document.createElement("div");
  tile.className = "tile off";            // "off" shows the letter box
  tile.id = "tile" + index;
  tile.innerHTML = `
    <video autoplay muted playsinline></video>
    <div class="avatar">${name[0]}</div>
    <div class="name">${name}</div>
  `;
  return tile;
}

PEOPLE.forEach((name, index) => {
  videosEl.appendChild(createTile(name, index));
});

const myTile  = document.getElementById("tile0");
const myVideo = myTile.querySelector("video");


/* ==========================================
   CAMERA
   ========================================== */
async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  myVideo.srcObject = stream;
  camOn = true;

  // Respect the current mute state
  stream.getAudioTracks().forEach(track => (track.enabled = micOn));

  myTile.classList.remove("off");
  camBtn.textContent = "Camera off";
  camBtn.classList.remove("off");
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  myVideo.srcObject = null;
  camOn = false;

  myTile.classList.add("off");
  camBtn.textContent = "Camera on";
  camBtn.classList.add("off");
}

camBtn.addEventListener("click", async () => {
  if (camOn) {
    stopCamera();
    return;
  }
  try {
    await startCamera();
  } catch (error) {
    addMessage("System", "Camera not available here.", false);
  }
});


/* ==========================================
   MICROPHONE
   ========================================== */
micBtn.addEventListener("click", () => {
  micOn = !micOn;

  if (stream) {
    stream.getAudioTracks().forEach(track => (track.enabled = micOn));
  }

  micBtn.textContent = micOn ? "Mute" : "Unmute";
  micBtn.classList.toggle("off", !micOn);
});


/* ==========================================
   CHAT
   ========================================== */
function addMessage(sender, text, isMe) {
  const msg = document.createElement("div");
  msg.className = isMe ? "msg me" : "msg";

  const name = document.createElement("b");
  name.textContent = sender;

  const body = document.createElement("span");
  body.textContent = text;

  msg.append(name, body);
  msgsEl.appendChild(msg);
  msgsEl.scrollTop = msgsEl.scrollHeight;   // keep newest message in view
}

function randomOtherPerson() {
  const others = PEOPLE.slice(1);
  return others[Math.floor(Math.random() * others.length)];
}

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  addMessage("You", text, true);
  msgInput.value = "";

  // Fake reply so the chat feels alive. Remove for real chat.
  setTimeout(() => {
    addMessage(randomOtherPerson(), "Got it.", false);
  }, REPLY_DELAY_MS);
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keydown", event => {
  if (event.key === "Enter") sendMessage();
});

chatToggleBtn.addEventListener("click", () => {
  const isHidden = chatEl.style.display === "none";
  chatEl.style.display = isHidden ? "flex" : "none";
  chatToggleBtn.textContent = isHidden ? "Hide chat" : "Show chat";
});

// First message
addMessage("Aman", "Hi all, can everyone hear me?", false);


/* ==========================================
   LEAVE MEETING
   ========================================== */
leaveBtn.addEventListener("click", () => {
  stopCamera();
  document.body.innerHTML = `
    <div style="padding: 24px">
      <h2>You left the meeting</h2>
      <button onclick="location.reload()">Rejoin</button>
    </div>
  `;
});


/* ==========================================
   TIMER
   ========================================== */
function pad(number) {
  return String(number).padStart(2, "0");
}

setInterval(() => {
  seconds++;
  clockEl.textContent = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}, 1000);
