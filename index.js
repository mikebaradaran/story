// File: index.js
const storyBase = "story_files/"
const story = document.getElementById("story");

readFile("titles.json", displayTitlesAsList);

function displayTitlesAsList(lines) {
  setupSpeech();
  lines = JSON.parse(lines);

  let selectTag = document.getElementById("titles");

  for (let line of lines) {
    let optionTag = document.createElement("option");
    optionTag.innerText = line.title;
    selectTag.appendChild(optionTag);
  }
  selectTag.onchange = () => { displayStory(lines[selectTag.selectedIndex].file); };
}

function displayStory(storyFile) {
  readFile(storyFile, renderStory);

  // setup an event when any <span> is clicked on
  if (!story._listenerAttached) {   // avoid attaching every time a new story is loaded
    story.addEventListener("click", function (event) {
      if (event.target.tagName === "SPAN") {
        speak(event.target.innerText);
      }
    });
    story._listenerAttached = true;
  }
}

function readAll() {
  story.stopFunc = speakLines(story.rawData);
}

function stopReadAll() {
  showCurrentLine("hideit");
  window.speechSynthesis.cancel();
  story.stopFunc?.();
}

function renderStory(data) {
  story.innerHTML = "";
  story.rawData = removeEmojisAndQuotes(data)

  let lines = data.split("\n");
  let linesForSpeech = story.rawData.split("\n");

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let div = document.createElement("div");
    story.appendChild(div);

    if (line.trim() === "") {
      div.innerHTML = "<hr />";
      continue; // Skip empty lines
    }

    line = makeEachWordIntoSpan(line);
    line = addIconTagAroundEmojis(line);

    let button = `<span2 onclick="speak('${linesForSpeech[i].trim()}')"  aria-label="Read line aloud">🔊</span2>`;
    div.innerHTML = `${button} ${line}`;
  }
}

//----------------------------------------------------------------------
function makeEachWordIntoSpan(line) {
  line = line.split(' ').map(word => `<span>${word} </span>`).join("");
  return line;
}

function removeEmojisAndQuotes(str) {
  str = str.replace(/"/g, '');
  return str.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
}

function addIconTagAroundEmojis(text) {
  return text.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu, '<icon>$&</icon>');
}

function readFile(filename, callbackFunc) {
  fetch(storyBase + filename)
    .then((response) => response.text())
    .then((data) => {
      callbackFunc(data);
    });
}

function showCurrentLine(text) {
  let div = document.getElementById("currentLineDiv");
  div.style.display = (text === "hideit") ? "none" : "block";
  div.innerText = text;
}

function isEmoji(char) {
  const emojiRegex = /\p{Emoji}/u;
  return emojiRegex.test(char);
}
// ------------------Speech --------------------------------------
let msg;

function speak(text) {
  if (text === "") return; // Skip empty text
  stopReadAll();
  msg.text = text;
  speechSynthesis.speak(msg);
}

function setupSpeech() {
  msg = new SpeechSynthesisUtterance();

  window.speechSynthesis.onvoiceschanged = () => {
    const voices = speechSynthesis.getVoices();

    msg.voice = voices.find(voice =>
      voice.name.toLowerCase().includes("female") ||
      voice.name.toLowerCase().includes("woman") ||
      voice.name.toLowerCase().includes("samantha") ||
      voice.name.toLowerCase().includes("Karen") ||
      voice.name.toLowerCase().includes("zira")
    );

    msg.pitch = 1.1;
    msg.rate = 0.9;
  };
}

function speakLines(text) {
  const lines = text.split("\n");
  let cancelled = false;

  function speakNext(i) {
    const delay = 200;
    if (cancelled || i >= lines.length) {
      showCurrentLine("hideit");
      return;
    }
    showCurrentLine(lines[i]);
    msg.text = lines[i];
    speechSynthesis.speak(msg);

    msg.onend = () => {
      if (!cancelled)
        setTimeout(() => speakNext(i + 1), delay);
    };
  }

  speakNext(0);
  // Return a stop function
  return () => {
    cancelled = true;
    speechSynthesis.cancel(); // optional: stop current speech too
  };
}

//-------------------------------------------
async function readWordAndWait(word) {
  speak(word);
  while (speechSynthesis.speaking || speechSynthesis.pending) {
    await new Promise(r => setTimeout(r, 100));
  }
}

async function readAndHighlightEveryWord(divID) {
  let div = document.getElementById(divID);
  let startText = div.innerHTML;
  div.innerHTML = makeEachWordIntoSpan(div.innerHTML);
  let spans = document.querySelectorAll(`#${divID} span`);
  for (let span of spans) {
    span.classList.toggle("highlight");;
    await readWordAndWait(span.innerText);
    span.classList.toggle("highlight");;
  }
  div.innerHTML = startText;
}

let stopMe = false;
async function readAndHighlightStory() {
  stopMe=false;
  let spans = document.querySelectorAll(`#story span`);
  for (let span of spans) {
    if(isEmoji(span.innerText))
      continue;
    span.classList.toggle("highlight");
    await readWordAndWait(span.innerText);
    console.log(span.innerText);
    span.classList.toggle("highlight");
    if(stopMe) break;
  }
}


