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


function renderStory(data) {
  story.innerHTML = "";
  story.rawData = removeEmojisAndQuotes(data).split("\n");

  let lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let div = document.createElement("div");
    story.appendChild(div);

    div.rawData = story.rawData[i];

    if (line.trim() === "") {
      div.innerHTML = "<hr />";
      continue; // Skip empty lines
    }

    line = makeEachWordIntoSpan(line);
    line = addIconTagAroundEmojis(line);

    let button = `<span2 onclick="readAndHighlight(this.closest('div'),true)"  aria-label="Read line aloud">🔊</span2>`;
    div.innerHTML = `${button} ${line}`;
  }
}

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

function isEmoji(char) {
  const emojiRegex = /\p{Emoji}/u;
  return emojiRegex.test(char);
}
// ------------------Speech --------------------------------------
function stopReading() {
  story.stopReading = true;
  document.querySelectorAll('div.highlight, div span.highlight').forEach(el => {
    el.classList.remove('highlight');
  });
}

function storyPresent() {
  if (story.innerHTML == "") {
    speak("Please select a story to read!");
    return false;
  }
  return true;
}

async function readAndHighlightEachWordInStory() {
  if (!storyPresent()) return;
  story.stopReading = false;
  let spans = document.querySelectorAll(`#story span`);
  for (let span of spans) {
    if (isEmoji(span.innerText)) continue;
    if (story.stopReading) break;
    await readAndHighlight(span);
  }
}

async function readAndHighlight(tag, isLine) {
  story.stopReading = false;
  tag.scrollIntoView({ behavior: 'smooth', block: 'center' });
  tag.classList.add("highlight");
  let text = (isLine) ? tag.rawData : tag.innerText;
  await speak(text);
  tag.classList.remove("highlight");
}

// read each line ----------------------------------------------
async function readAndHighlightEachLineInStory() {
  if (!storyPresent()) return;
  story.stopReading = false;
  let divs = document.querySelectorAll(`#story div`);
  for (let div of divs) {
    if (story.stopReading) break;
    await readAndHighlight(div, true);
  }
}

function speak(text) {
  return new Promise(resolve => {
    if (text === "" || story.stopReading) {
      resolve();    // resolve immediately if empty
      return;
    }
    msg.text = text;
    speechSynthesis.speak(msg);
    msg.onend = resolve;
  });
}
