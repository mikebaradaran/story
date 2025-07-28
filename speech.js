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