//----------User Input handlers for entering inputs manually-----------------------
//City & date are passed in as args, and uses Zomato API to retrieve a list of possible cities
function userInputHandler(city, date) {
  //use zomato api to get list of possible city matches
  let settings = {
    "url": "https://developers.zomato.com/api/v2.1/cities?q=" + city,
    "method": "GET",
    "timeout": 0,
    "headers": {
    "user-key": "ee81083d2e8f964d3fc648ac92d54cae"
    }
  }

  $.ajax(settings).then(function (response) {
    //if the response is successful and has a length of at least 1 element to call a function to verify the city
    if (response.status === "success" && response.location_suggestions.length >= 1) {
      verifyUserCity(response.location_suggestions, date, city);
    }else {
    // else gives an error response to try again
      $("#cities").empty();
      $(".modal").attr("style", "display: block;");
      $("p.modal-text").text("Cannot find your city. Please check spelling and add the state abbreviation.")
    }
  });

}

//check if the city retrieved from Zomato API call is the one user intended 
function verifyUserCity(response, date, userInput) {
  $("#cities").empty();

  //if the length of the response is longer than 1, build & render buttons on modal for user selection
  if (response.length > 1) {
    for (cityObj in response) {
      let cityButton = $("<button></button>").attr("class", "btn pure-button pure-button-primary cityOptions");
      cityButton.text(response[cityObj].name);
      cityButton.attr("id", response[cityObj].id);
      cityButton.attr("data-state", response[cityObj].state_code)

      $("#cities").append(cityButton);
      $("#myModal").attr("style", "display: block;");
    }
  } else {
  //else use the element and call function that contain the AJAX calls for resturants and events
    let cityInfoObj = {
      name: userInput,
      zomatoId: response[0].id,
      stateCode: response[0].state_code
    }
    useCitiesAPI(cityInfoObj, date)
  }

  //listen for user selection of correct city
  $(".cityOptions").click(event => {
    event.preventDefault();
    let cityId = event.target.id;
    let cityState = event.target.getAttribute("data-state")
    let cityInfoObj = {
      name: userInput,
      zomatoId: cityId,
      state: cityState
    };

    //use user selection and call function that contain the AJAX calls for resturants and event, close modal
    useCitiesAPI(cityInfoObj, date);
    $("#myModal").attr("style", "display: none;");

  })
}

//function that calls both API's using the city input and date
function useCitiesAPI(cityObj, date) {
  //call zomato's api using city ID
  var zomatoSettings = {
    "url": "https://developers.zomato.com/api/v2.1/location_details?entity_id=" + cityObj.zomatoId + "&entity_type=city",
    "method": "GET",
    "timeout": 0,
    "headers": {
      "user-key": "ee81083d2e8f964d3fc648ac92d54cae",
    },
  };

  $.ajax(zomatoSettings).done(function (response) {
    //remove all restuarant cards present in the container
    $(".container").children(".restaurant").remove()

    //retrieve from embedded object the object of restuarants
    let restaurants = response.best_rated_restaurant;

    //for each restaurant listed get the data we want and render it on a card displayed on the HTML
    restaurants.forEach(restaurant => {
      let restaurantArr = getRestaurantData(restaurant);
      renderRestCard(restaurantArr);
    })
  });

  //call ticketmasterAPI using city name & date 
  var ticketMasterSetting = {
    "url": "https://app.ticketmaster.com/discovery/v2/events.json?city=" + cityObj.name + "&stateCode=" + cityObj.state + "&localStartDateTime" + date + "T00:01:00&apikey=DI18K276tAqWzecpJRpTmFuyJik79JOM",
    "method": "GET",
    "timeout": 0,

  }

  $.ajax(ticketMasterSetting).then(function (response) {
    //remove all the event cards present in the container 
    $(".container").children(".events").remove()

    //if we get a response with the obj of _embedded (this is were the events are) get the info we want and render it to card on HTML
    if (response._embedded) {
      let eventsArr = response._embedded.events;

      eventsArr.forEach(event => {
        let eventInfoArr = getEventInfo(event);
        renderEventCard(eventInfoArr);
      })

    } 
  });

}

//-----------------User chooses to use current location---------------------------
//Retrieve current location & call functions that have AJAX calls
function useCurrentCoordinates() {

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    let queryURL = "https://developers.zomato.com/api/v2.1/geocode?lat=" + latitude + "&lon=" + longitude;

    let settings = {
      "url": queryURL,
      "method": "GET",
      "timeout": 0,
      "headers": {
      "user-key": "ee81083d2e8f964d3fc648ac92d54cae",
      }
    }

    let ticketMasterSettings={
      "url": "https://app.ticketmaster.com/discovery/v2/events.json?apikey=DI18K276tAqWzecpJRpTmFuyJik79JOM&latlong="+latitude+","+longitude+"&radius=20&unit=miles",
      "method": "GET",
      "timeout": 0
    }

    useCoordinatesRestaurantAPI(settings);

    ticketMasterCoordinateAPI(ticketMasterSettings);
  }
  //Function for geolocation error-unable to find device
  function error(){
    $(".modal").attr("style", "display: block;");
    $("p.modal-text").text("Unable to find your location. Please use type in your city.")
  }
  
  //
  if(!navigator.geolocation){
    $(".modal").attr("style", "display: block;");
    }else{
    navigator.geolocation.getCurrentPosition(success,error)
  }
}

//calls the Zomato API using the coordinates from user
function useCoordinatesRestaurantAPI(settings) {
  $.ajax(settings).then(function (response) {
    //remova all restaurant cards from the container
    $(".container").children(".restaurant").remove()
    let restuarants = response.nearby_restaurants

    //for each restaurant get the data we need and render on a card that is appended to the HTML
    restuarants.forEach(restaurant => {
      let restaurantArr = getRestaurantData(restaurant);
      renderRestCard(restaurantArr);
    });
  });
}

//calls the TicketMaster API using the coordinates from user
function ticketMasterCoordinateAPI(settings){
  $.ajax(settings).then(function(response){
      //remove any event cards in the container
      $(".container").children(".events").remove()
      let eventsArr = response._embedded.events;
      
      //for each on event get the info we want and render it on a card that is appended to the HTML 
      eventsArr.forEach(event => {
          let eventInfoArr = getEventInfo(event);
          renderEventCard(eventInfoArr);
      });
  })
}
//------------------------ Restaurant Cards (Get info and render)-------------------------------
//get information from response object into formatted object
function getRestaurantData(restaurant){
  let rest = restaurant.restaurant;
  let restName = rest.name;
  let cuisine = rest.cuisines;
  let pRate = rest.price_range;
  let URL = rest.url;
  let photoURL = rest.thumb;
  let uRate = rest.user_rating.aggregate_rating + " " + rest.user_rating.rating_text
  let menuURL = rest.menu_url

  if (photoURL === "") {
    photoURL = "https://via.placeholder.com/150/000000/FFFFFF?text=No+Image+Available"
  }

  let restArr = {name: restName, cuisineType: cuisine, priceRating: pRate, website: URL, imgURL: photoURL, userRate: uRate, menu: menuURL}

  return restArr;
}

//renders and appends Restaurant card to results.html
function renderRestCard(restaurant){
  let restaurantName = _.snakeCase(restaurant.name);

  let restCard = $("<div></div>").attr("class", "card restaurant")
  restCard.attr("id", restaurantName);

  let restImgEl = $("<img>").attr("src", restaurant.imgURL);
  restImgEl.attr("class", "restImg")

  let restH2El = $("<h2></h2>").attr("id", "restName-" + restaurantName);
  restH2El.text(restaurant.name);

  let restH4El1 = $("<h4></h4>").attr("id", "cuisineType-" + restaurantName);
  restH4El1.text("Cuisine(s): " + restaurant.cuisineType);

  let restH4El2 = $("<h4></h4>").attr("id", "starRating-" + restaurantName);
  restH4El2.text("Rating: " + restaurant.userRate);

  let restH4El3 = $("<h4></h4>").attr("id", "priceRating-" + restaurantName);
  restH4El3.text("Price: ");

  for (let i = 0; i < restaurant.priceRating; i++) {
    let icon = $("<i></i>").attr("class", "fas fa-dollar-sign");
    restH4El3.append(icon)
  }

  let restPEl = $("<p></p>").attr("class", "textInfo");
  restPEl.attr("id", "description-" + restaurantName);

  let restButtonEl = $("<button></button>").attr("class", "btn pure-button pure-button-primary cardContent");
  restButtonEl.attr("id", "restBtn-" + restaurantName);

  let aEl = $("<a></a>").attr("href", restaurant.menu);
  aEl.text("More Info");
  aEl.attr("style", "color: white; text-decoration: none;")

  restButtonEl.append(aEl);

  restCard.append(restImgEl);
  restCard.append(restH2El);
  restCard.append(restH4El1);
  restCard.append(restH4El2);
  restCard.append(restH4El3);
  restCard.append(restPEl);
  restCard.append(restButtonEl);

  $(".container").append(restCard);
}

//------------------------ Event Cards (Get info and render)-------------------------------

//get information from response object into formatted object
function getEventInfo(event){
  let eventName = event.name;
  let eventGenre =event.classifications[0].genre.name+" - "+ event.classifications[0].subGenre.name;
  let eventVenue = event._embedded.venues[0].name;
  
  let eventDate = event.dates.start.dateTime;
  let d = new Date(eventDate);
  let eventDay = d.getDate();
  let eventMonth = d.getMonth()+1;
  let eventYear = d.getFullYear();
  let eventDateStr = eventYear+"/"+eventMonth+"/"+eventDay;

  let eventPrice;
  if(event.dates.status.code==="offsale"){
      eventPrice = "Tickets are not available"
  }else{
      eventPrice = event.dates.status.code
  }

  let eventImg= event.images[3].url

  let eventLink = event.url

  let eventInfoObj = {name: eventName, genre:eventGenre, venue: eventVenue, date:eventDateStr, price:eventPrice, imgSrc: eventImg, infoUrl: eventLink};

  return eventInfoObj;
}

//with info passed in as an arg, render a card on the HTML
function renderEventCard(eventInfoObj){

  let eventCardEl = $("<div></div>").attr("class", "card events");

  let eventImgEl = $("<img>").attr("class","restImg")
  eventImgEl.attr("src", eventInfoObj.imgSrc);

  let h2El = $("<h2></h2>").text(eventInfoObj.name);

  let h4El1 = $("<h4></h4>").text(eventInfoObj.genre);

  let h4El2 = $("<h4></h4>").text(eventInfoObj.venue);

  let h4El3 = $("<h4></h4>").text(eventInfoObj.date);

  let h4El4 = $("<h4></h4>").text(eventInfoObj.price)

  let buttonEl = $("<button></button>").attr("class", "btn pure-button pure-button-primary cardContent");
  let aEl = $("<a></a>").attr("href", eventInfoObj.infoUrl);
  aEl.text("More Info");
  aEl.css("text-decoration", "none");
  aEl.css("color", "white");

  buttonEl.append(aEl);

  eventCardEl.append(eventImgEl);
  eventCardEl.append(h2El);
  eventCardEl.append(h4El1);
  eventCardEl.append(h4El2);
  eventCardEl.append(h4El3);
  eventCardEl.append(h4El4);
  eventCardEl.append(buttonEl);

  $(".container").append(eventCardEl)
}

//-----------------Set min date on HTML Calendars------

//Disables past dates in user input calendar
function setMinDate(){
  let today = new Date().toISOString().split('T')[0];
  $("#dateOfTrip").attr("min", today)
}

//----------------Event listeners----------------------

//Listens for Use my Location and starts to get user coordinates
$(".geoButton").click(function (event) {
  event.preventDefault();

  //if not on the results.html, go to it and append #useCoordinates to html
  if(!(location.href).includes("results")){
    location.href ="./Assets/results.html#useCoordinates";
  }
  
  useCurrentCoordinates();
  $("#cityInput").attr("disabled", " ");
  $("#dateOfTrip").attr("disabled", " ");
  $("#submit").attr("disabled", " ");
});

//Clear Search function resets the filters and results
$("#clearSearch").click(function (event) {
  event.preventDefault();
  $("#cityInput").removeAttr("disabled");
  $("#dateOfTrip").removeAttr("disabled");
  $("#submit").removeAttr("disabled");
  $('#cityInput').val('');
  $('#dateOfTrip').val('');
  $(".container").empty();
});


//User manual input and submit
$(".submit").click(function (event) {
  event.preventDefault();

  //if not in the results.html, save user inputs into local storage to retieve later after page changes
  if(!(location.href).includes("results")){
    let cityTemp = $("#cityInput").val();
    let dateTemp = $("#dateOfTrip").val();

    if(dateTemp === undefined|| dateTemp === null){
      dateTemp = new Date().toISOString().split('T')[0];
    }

    let userInput = {userCity: cityTemp, userDate:dateTemp};

    localStorage.setItem("dateTripper", JSON.stringify(userInput));
    location.href ="./Assets/results.html#userInput";
  }

  let city = $("#cityInput").val();
  let date = $("#dateOfTrip").val();

  userInputHandler(city, date);
});

//Closes modal element
$(".close").click(function (event) {
  event.preventDefault();
  $("#myModal").attr("style", "display: none;");
});

//---------------When page loads ----------------
//set the min date on the calendar to be current date
setMinDate();

//when the pages loads check if the url address includes #useCoordinates and if it does launch useCurrentCoordinate function
if((location.href).includes("#useCoordinates")){
  useCurrentCoordinates();
  $("#cityInput").attr("disabled", " ");
  $("#dateOfTrip").attr("disabled", " ");
  $("#submit").attr("disabled", " ");
}

//when the page loads check if the url address includes #userInput and if it does retrieve from local storace and launce function to handle, and remove from local storage
if((location.href).includes("#userInput")){
  let jsonStr = localStorage.getItem("dateTripper");
  let userInputs = JSON.parse(jsonStr);

  userInputHandler(userInputs.userCity, userInputs.userDate);

  $("#cityInput").attr("disabled", " ");
  $("#dateOfTrip").attr("disabled", " ");
  $("#submit").attr("disabled", " ");

  localStorage.removeItem("dateTripper");
}