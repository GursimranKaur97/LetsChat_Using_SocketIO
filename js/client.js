document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:8000');
    
    // Get DOM elements in respective JS variable
    const form = document.getElementById('send-container');
    const messageInput = document.getElementById('messageInp');
    const messageContainer = document.querySelector('.container');
    const emojiButton = document.getElementById('emojiButton');
    
    // Create an instance of EmojiButton
    const picker = new EmojiButton({
        position: 'top-end', // Adjust position as needed
        autoHide: false // Prevent auto-hiding
    });
    
    // Audio that will play on receiving messages
    var audio = new Audio('ting.mp3');
    
    // Function to append message to the container
    const appendMessage = (message, position) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = message;
        messageElement.classList.add('message');
        messageElement.classList.add(position);
        messageContainer.appendChild(messageElement);
        if (position === 'left') {
            audio.play();
        }
    };
    
    // Ask new user for their name and let the server know
    const name = prompt('Enter your name to join');
    socket.emit('new-user-joined', name);
    
    // If a new user joins, receive their name from the server
    socket.on('user-joined', name => {
        appendMessage(`${name} joined the chat`, 'right');
    });
    
    // If the server sends a message, receive it
    socket.on('receive', data => {
        appendMessage(`${data.name}: ${data.message}`, 'left');
    });
    
    // If a user leaves the chat, append the info to the container
    socket.on('left', name => {
        appendMessage(`${name} left the chat`, 'right');
    });
    
    // If the form gets submitted, send the message to the server
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            appendMessage(`You: ${message}`, 'right');
            socket.emit('send', message);
            messageInput.value = '';
        }
    });
    
    // Insert selected emoji into the message input field
    picker.on('emoji', selection => {
        // Insert the emoji at the current cursor position
        const cursorPos = messageInput.selectionStart;
        messageInput.setRangeText(selection.emoji, cursorPos, cursorPos, 'end');
        messageInput.dispatchEvent(new Event('input')); // Trigger input event to update value
    });
});
