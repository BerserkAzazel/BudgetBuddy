const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");

async function askQuestion() {
    const question = userInput.value;
    userInput.value = "";
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: question }),
    });
    const { answer } = await res.json();
    console.log(answer);
    const answerElement = document.createElement("div");
    answerElement.innerText = `${ answer }`;
    chatWindow.appendChild(answerElement);
}