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

    let button = `<span2 onclick="speak('${story.rawData[i].trim()}')"  aria-label="Read line aloud">🔊</span2>`;
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
function stopReading(){
  story.stopReading = true;
}
async function readAndHighlightEachWordInStory() {
  if (story.innerHTML == "") {
    speak("Please select a story to read!");
    return;
  }
  story.stopReading = false;
  let spans = document.querySelectorAll(`#story span`);
  for (let span of spans) {
    if (isEmoji(span.innerText)) continue;
    if (story.stopReading)
      break;
    span.scrollIntoView({ behavior: 'smooth', block: 'center' });
    span.classList.toggle("highlight");
    await speak(span.innerText);
    span.classList.toggle("highlight");
  }
}

// read each line ----------------------------------------------
async function readAndHighlightEachLineInStory() {
  story.stopReading = false;
  let divs = document.querySelectorAll(`#story div`);
  for (let div of divs) {
    if (story.stopReading)
      break;
    div.classList.toggle("highlight");
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await speak(div.rawData);
    div.classList.toggle("highlight");
  }
}

function speak(text) {
  return new Promise(resolve => {
    if (text === "") {
      resolve(); // resolve immediately if empty
      return;
    }
    msg.text = text;
    speechSynthesis.speak(msg);
    msg.onend = resolve;
  });
}


// let stopStartReadingAll = true;
// function stopStartReadingAll_Buttonclick(button) {
//   // if (story.innerHTML == "") {
//   //   speak("Please select a story to read!");
//   //   return;
//   // }
//     readAndHighlightEachLineInStory();

//   // story.stopReading = !story.stopReading;
//   // if (!story.stopReading) {
//   //   button.innerText += " Stop";
//   //   readAndHighlightEachLineInStory();
//   // }
//   // else {
//   //   //stopReadAll();
//   //   button.innerText = button.innerText.replace("Stop", "");
//   // }
// }

// //let stopReadingEachWord = true;
// function readAndHighlightEachWordInStory_Buttonclick(button) {
//   // if (story.innerHTML == "") {
//   //   speak("Please select a story to read!");
//   //   return;
//   // }
//     readAndHighlightEachWordInStory();

//   // story.stopReading = !story.stopReading;
//   // if (!story.stopReading) {
//   //   readAndHighlightEachWordInStory();
//   //   button.innerText += " Stop";
//   // }
//   // else
//   //   button.innerText = button.innerText.replace("Stop", "");
// }


// async function readWordAndWait(word) {
//   speak(word);
//   while (speechSynthesis.speaking || speechSynthesis.pending) {
//     await new Promise(r => setTimeout(r, 100));
//   }
// }

// function showCurrentLine(text) {
//   let div = document.getElementById("currentLineDiv");
//   div.style.display = (text === "hideit") ? "none" : "block";
//   div.innerText = text;
// }


// function speakLines(text) {
//   let cancelled = false;

//   function speakNext(i) {
//     const delay = 200;
//     if (cancelled || i >= story.rawData.length) {
//       showCurrentLine("hideit");
//       return;
//     }
//     showCurrentLine(story.rawData[i]);
//     msg.text = story.rawData[i];
//     speechSynthesis.speak(msg);

//     msg.onend = () => {
//       if (!cancelled)
//         setTimeout(() => speakNext(i + 1), delay);
//     };
//   }

//   speakNext(0);
//   // Return a stop function
//   return () => {
//     cancelled = true;
//     speechSynthesis.cancel(); // optional: stop current speech too
//   };
// }

// function readAll() {
//   story.stopFunc = speakLines(story.rawData);
// }

// function stopReadAll() {
//   showCurrentLine("hideit");
//   window.speechSynthesis.cancel();
//   story.stopFunc?.();
// }





