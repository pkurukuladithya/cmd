// This function is called by Google after user chooses an account
function handleCredentialResponse(response) {
  const idToken = response.credential;

  // Send the token to backend for verification
  fetch('/api/google-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: idToken })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('Login failed: ' + data.error);
        return;
      }

      // Show user info in the UI
      const userInfoDiv = document.getElementById('userInfo');
      const userName = document.getElementById('userName');
      const userEmail = document.getElementById('userEmail');
      const userPicture = document.getElementById('userPicture');

      userName.textContent = data.name;
      userEmail.textContent = data.email;
      userPicture.src = data.picture;

      userInfoDiv.classList.remove('hidden');
    })
    .catch(err => {
      console.error('Error verifying token:', err);
      alert('Something went wrong. Check console.');
    });
}
