import type { Mini } from "@spirobel/mininext";

export function chatForm(mini: Mini) {
  return mini.html`<div id="chatArea"></div>
<form id="messageForm" onsubmit="sendMessage(event);" style="display: flex; gap: 20px; margin-top: 20px;">
    <input type="text" id="messageInput" placeholder="Type your message here..." autocomplete="off">
    <button type="submit" class="wallet-adapter-button wallet-adapter-button-trigger">Send</button>
</form>
     <script>
          let socket = null;
          function chat() {
            function connectWebSocket() {
              if (socket) {
                return;
              }
              socket = new WebSocket("ws://localhost:3000/chat");

              socket.addEventListener("message", (event) => {
                updateChatDisplay(event.data);

              });

              socket.addEventListener("close", (event) => {
                // Reestablish the connection after 1 second
                socket = null;
              });

              socket.addEventListener("error", (event) => {
                socket = null;
              });
            }
            connectWebSocket(); // connect to reloader, if it does not work:
            setInterval(connectWebSocket, 1000); // retry every 1 second
          }
   
      function sendMessage(event) {
          event.preventDefault();
          const messageInput = document.getElementById('messageInput');
          const message = messageInput.value.trim();
          if (!message) return; // Ignore empty messages

          socket.send(message);
          messageInput.value = ''; // Clear input field after sending
      }

      function updateChatDisplay(message) {
          const chatArea = document.getElementById('chatArea');
          const newMessageElement = document.createElement('p');
          newMessageElement.innerHTML = message;
          chatArea.appendChild(newMessageElement);
          chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom of chat area
      }

      chat();

      // Initialize chat display
      updateChatDisplay("Welcome to the chat!");
  </script>`;
}

export function readOnlyChat(mini: Mini) {
  return mini.html`<div id="chatArea"></div>
     <script>
          let socket = null;
          function chat() {
            function connectWebSocket() {
              if (socket) {
                return;
              }
              socket = new WebSocket("ws://localhost:3000/chatReadOnly");

              socket.addEventListener("message", (event) => {
                updateChatDisplay(event.data);

              });

              socket.addEventListener("close", (event) => {
                // Reestablish the connection after 1 second
                socket = null;
              });

              socket.addEventListener("error", (event) => {
                socket = null;
              });
            }
            connectWebSocket(); // connect to reloader, if it does not work:
            setInterval(connectWebSocket, 1000); // retry every 1 second
          }
      function updateChatDisplay(message) {
          const chatArea = document.getElementById('chatArea');
          const newMessageElement = document.createElement('p');
          newMessageElement.innerHTML = message;
          chatArea.appendChild(newMessageElement);
          chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom of chat area
      }

      chat();

      // Initialize chat display
      updateChatDisplay("Welcome to the chat!");
  </script>`;
}
