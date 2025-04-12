document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".input");
    const sensorDataEls = document.querySelectorAll(".sensor-data"); 
    const cardDataList = document.querySelector(".card-data-list");
  
    function fetchDataAndUpdateUI() {
      console.log('Fetching data...');
      
      fetch('http://192.168.88.64/data') // Your ESP8266 IP (It is example)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          console.log('Data fetched successfully');
          return res.json();
        })
        .then(data => {
          console.log('Data received:', data); 
  
          if (toggle.checked) {
            
            // Update data in the UI
            document.getElementById("temperature").textContent = `${data.temperature.toFixed(1)}°C`;
            document.getElementById("humidity").textContent = `${data.humidity.toFixed(1)}%`;
            document.getElementById("pressure").textContent = `${data.pressure.toFixed(1)} hPa`;
            document.getElementById("altitude").textContent = `${data.altitude.toFixed(1)} meters`;
            document.getElementById("time").textContent = data.time;
            document.getElementById("sensor").textContent = data.sensor;
            document.getElementById("connection").textContent = data.connection;
            document.getElementById("mode").textContent = data.mode;
  
            // Make the data list visible
            cardDataList.classList.remove('sleep');
            cardDataList.classList.add('nosleep');
  
            // Activate sensor data
            sensorDataEls.forEach(el => {
              el.classList.add('active');
              el.classList.remove('inactive');
            });
          } else {
            
            // Set the "No Data" state
            document.getElementById("temperature").textContent = "No Data";
            document.getElementById("humidity").textContent = "No Data";
            document.getElementById("pressure").textContent = "No Data";
            document.getElementById("altitude").textContent = "No Data";
            document.getElementById("time").textContent = "No Data";
            document.getElementById("sensor").textContent = "No Data";
            document.getElementById("connection").textContent = "No Data";
            document.getElementById("mode").textContent = "No Data";
  
            // Hide the data list
            cardDataList.classList.remove('nosleep');
            cardDataList.classList.add('sleep');
  
            // Deactivate sensor data
            sensorDataEls.forEach(el => {
              el.classList.add('inactive');
              el.classList.remove('active');
            });
          }
        })
        .catch(error => {
          console.error('Fetch error: ', error);
  
          // Handle failed fetch
          document.getElementById("temperature").textContent = "No Data";
          document.getElementById("humidity").textContent = "Failed to load data";
          document.getElementById("pressure").textContent = "Failed to load data";
          document.getElementById("altitude").textContent = "Failed to load data";
          document.getElementById("time").textContent = "Failed to load data";
          document.getElementById("sensor").textContent = "Failed to load data";
          document.getElementById("connection").textContent = "Failed to load data";
          document.getElementById("mode").textContent = "Failed to load data";
  
          // Hide the data list
          cardDataList.classList.remove('nosleep');
          cardDataList.classList.add('sleep');
  
          // Deactivate sensor data
          sensorDataEls.forEach(el => {
            el.classList.add('inactive');
            el.classList.remove('active');
          });
        });
    }
  
    // Event listener for toggle change
    toggle.addEventListener('change', (event) => {
      console.log('Toggle checked:', event.target.checked);
      fetchDataAndUpdateUI();
    });
  
    // Initial fetch on page load
    fetchDataAndUpdateUI();
  
    // Periodic fetch every 10 seconds
    setInterval(fetchDataAndUpdateUI, 10000);
  });
  