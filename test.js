// Define the URL of the server endpoint
const url = 'http://127.0.0.1:5000/get_moves';

// Define the JSON data you want to send
const data = {
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com'
};

// Convert the data to a JSON string
const jsonData = JSON.stringify(data);

// Send the JSON data to the server
fetch(url, {
    method: 'POST', // HTTP method
    headers: {
        'Content-Type': 'application/json' // Send JSON as the body of the request
    },
    body: jsonData // The JSON data to send
})
.then(response => response.json()) // Convert the response to JSON
.then(data => {
    // Handle the response data here
    console.log('Success:', data);
})
.catch(error => {
    // Handle any errors here
    console.error('Error:', error);
});
