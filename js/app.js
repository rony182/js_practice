// handle the click event
$(document).ready(function () {
  // get the apy key from the env file
  const apiKey = "de34183783599331759a72cd0a9ba44f";
  // get the weather data
  $("#getWeather").click(function () {
    // get the location value
    const location = $("#location").val();
    // check if the location is empty
    if (!location) {
      // show a warning message
      toastr.warning("Please enter a location.");
      return;
    }
    // make an ajax request to get the weather data
    fetchWeatherData(location, apiKey);
    // clear the input field
    $("#location").val("");
  });
});

// handle the submit event
$("form").submit(function (e) {
  e.preventDefault();
});
// fetch the weather data
function fetchWeatherData(location, apiKey, retries = 3) {
  // make an ajax request to get the weather data
  $.ajax({
    // set the url
    url: `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`,
    // set the request type
    type: "GET",
    // set the data type
    dataType: "json",
    // handle the success response
    success: function (data) {
      // display the weather data
      displayWeatherData(data);
      // get the forecast for the next week
      getForecastForNextWeek(data.coord.lat, data.coord.lon, apiKey);
      // show a success message
      toastr.success("Weather data fetched successfully.");
    },
    error: function () {
      // show an error message
      if (retries > 0) {
        // Retry the request
        console.log(`Retrying... ${retries} attempts left`);
        fetchWeatherData(location, apiKey, retries - 1);
      } else {
        // show an error message
        toastr.error(
          "Failed to fetch weather data after several attempts. Please try again."
        );
      }
    },
  });
}

function displayWeatherData(data) {
  // get the weather icon
  const iconsrc = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  // set the output
  const output = `
        <div class="weather-card">
            <div class="weather-header">
                <h3>Weather Details for ${data.name}, ${data.sys.country}</h3>
                <img src="${iconsrc}" alt="weather icon" class="weather-icon">
            </div>
            <div class="weather-details">
            <div class="row">
            <div class="col-md-6">
                <p>Weather: ${data.weather[0].description}</p>
                <p>Temperature: ${data.main.temp} °C</p>
                <p>Min and Max Temperature: ${data.main.temp_min} °C / ${
    data.main.temp_max
  } °C</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${data.wind.speed} m/s</p>
                </div>
                <div class="col-md-6">
                <p>Pressure: ${data.main.pressure} hPa</p>
                <p>Visibility: ${data.visibility} m</p>
                <p>Cloudiness: ${data.clouds.all}%</p>
                <p>Sunrise: ${new Date(
                  data.sys.sunrise * 1000
                ).toLocaleTimeString()}</p>
                <p>Sunset: ${new Date(
                  data.sys.sunset * 1000
                ).toLocaleTimeString()}</p>
                </div>
            </div>
            </div>
        </div>
    `;
  // set the output
  $("#weatherResult").html(output);
}

// get the forecast for the next week
function getForecastForNextWeek(lat, lon, apiKey) {
  // make an ajax request to get the forecast data
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${apiKey}&units=metric`,
    type: "GET",
    dataType: "json",
    // handle the success response
    success: function (data) {
      // empty the forecast tabs
      $("#forecastTabs").empty();
      // empty the forecast content
      $("#tabContent").empty();
      // Start from index 1 to skip the current day
      const tabs = data.daily
        .slice(1)
        .map((day, index) => {
          // convert the timestamp to date
          const date = new Date(day.dt * 1000).toDateString();
          // set the active class for the first item
          const activeClass = index === 0 ? "active" : "";
          return `
        <li class="nav-item">
            <a class="nav-link ${activeClass}" id="day${index}-tab" data-toggle="tab" href="#day${index}" role="tab" aria-controls="day${index}" aria-selected="true">
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                ${date}
            </a>
        </li>
    `;
        })
        .join("");
      // get the forecast content
      const content = data.daily
        .slice(1)
        .map((day, index) => {
          // convert the timestamp to date, don't show the year
          const date = new Date(day.dt * 1000).toDateString();
          const showClass = index === 0 ? "show active" : "";
          return `
        <div class="tab-pane fade ${showClass}" id="day${index}" role="tabpanel" aria-labelledby="day${index}-tab">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${date}</h5>
                    <p class="card-text">Temperature: ${day.temp.day} °C</p>
                    <p class="card-text">Min and Max Temperature: ${day.temp.min} °C / ${day.temp.max} °C</p>
                    <p class="card-text">Weather: ${day.weather[0].description}</p>
                    <p class="card-text">Humidity: ${day.humidity}%</p>
                    <p class="card-text">Wind Speed: ${day.wind_speed} m/s</p>
                    <p class="card-text">Pressure: ${day.pressure} hPa</p>
                    <p class="card-text">Cloudiness: ${day.clouds}%</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                </div>
            </div>
        </div>
    `;
        })
        .join("");
      // set the tabs and content
      $("#forecastTabs").html(tabs);
      $("#tabContent").html(content);
      // show the forecast container
      $("#forecastContainer").removeClass("d-none");
    },
    // handle the error response
    error: function () {
      // show an error message
      toastr.error("Failed to fetch forecast data.");
    },
  });
}
// set the toastr options
toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: "toast-top-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "1000",
  hideDuration: "1000",
  timeOut: "3000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
