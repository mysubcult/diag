{{< rawhtml >}}<form id="messageForm">
    <input type="text" name="Name" required>
    <input type="email" name="email" required>
    <select name="Goal" required>
        <option value="qoute">Get a Quote</option>
        <option value="purchase">Make a purchase</option>
        <option value="question">Other questions?</option>
    </select>
    <textarea name="message" required></textarea>
    <input type="submit">
    <p id="status"></p> <!-- This is for displaying if the message sent correctly -->
</form>

<script>
    const chat_id = '-1001274004245', botID = 'bot1690645634:AAFV31gPaGrOsY90VRdeZuxfeZqfWkfa3D0';
    const telegramURL = `https://api.telegram.org/${botID}/sendMessage`;
    document.querySelector('#messageForm').addEventListener("submit", async e => { // When the user submits the form
        e.preventDefault(); // Don't submit
        let text = JSON.stringify( // Convert the form data to a string to send as our Telegram message
            Object.fromEntries(new FormData(e.target).entries()), // Convert the form data to an object.
        null, 2); // Prettify the JSON so we can read the data easily
        const sendMessage = await fetch(telegramURL, { // Send the request to the telegram API
            method: 'POST',
            headers: {"Content-Type": "application/json"}, // This is required when sending a JSON body.
            body: JSON.stringify({chat_id, text}), // The body must be a string, not an object
        });
        const messageStatus = document.querySelector('#status');
        if (sendMessage.ok) // Update the user on if the message went through
            messageStatus.textContent = "Message Sent!";
        else
            messageStatus.textContent = "Message Failed to send :( " + (await sendMessage.text());
        e.target.reset(); // Clear the form fields.
    });
</script>{{< /rawhtml >}}
