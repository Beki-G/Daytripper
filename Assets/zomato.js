$("#geoButton").click(function(){
    event.preventDefault();
    console.log("I heard the button")
    useCurrentCoordinates();
})

$("#submit").click(function(){
  event.preventDefault();

  let city = $("#cityInput").val();
  let date = $("#dateOfTrip").val();
  
  userInputHandler(city, date);
})

$(".close").click(function(){
  event.preventDefault();
  $("#myModal").attr("style", "display: none;");
})


function userInputHandler(city, date){
  //use zomato api to get list of possible city matches
  console.log("in Handler "+ city+" "+date);

  var settings = {
    "url": "https://developers.zomato.com/api/v2.1/cities?q="+city,
    "method": "GET",
    "timeout": 0,
    "headers": {
      "user-key": "ee81083d2e8f964d3fc648ac92d54cae"
    }
  }

  $.ajax(settings).then(function (response) {
    if (response.status === "success" && response.location_suggestions.length >=1){
      verifyUserCity(response.location_suggestions, date, city);
    }else {
      alert("Cannot find your city. Please try to add the state abbrevatation.")
    }
  });

}

function verifyUserCity(response, date, userInput){
  $("#cities").empty();
  
  console.log(response)

  if(response.length>1){
    for(cityObj in response){
      let cityButton = $("<button></button>").attr("class", "btn pure-button pure-button-primary cityOptions");
      cityButton.text(response[cityObj].name);
      cityButton.attr("id", response[cityObj].id);
      //console.log(cityObj)
      cityButton.attr("data-state", response[cityObj].state_code)
      
      $("#cities").append(cityButton); 
      $("#myModal").attr("style", "display: block;");
    }
  }else{
    let cityInfoObj = {name:userInput, zomatoId: response[0].id, stateCode: response[0].state_code}
    console.log(cityInfoObj)
    useCitiesAPI(cityInfoObj, date)
  }

  $(".cityOptions").click(event=>{
    event.preventDefault();
    console.log("Listening");
    let cityId = event.target.id;
    let cityState = event.target.getAttribute("data-state")
    let cityInfoObj = {name:userInput, zomatoId: cityId, state: cityState};

    console.log(cityInfoObj);
    useCitiesAPI(cityInfoObj, date);
    $("#myModal").attr("style", "display: none;");

  })

 
}

function useCitiesAPI(cityObj, date){
//call zomato's api
  var zomatoSettings = {
    "url": "https://developers.zomato.com/api/v2.1/location_details?entity_id="+cityObj.zomatoId+"&entity_type=city",
    "method": "GET",
    "timeout": 0,
    "headers": {
      "user-key": "ee81083d2e8f964d3fc648ac92d54cae",
    },
  };

  $.ajax(zomatoSettings).done(function (response) {
    $(".container").children(".restaurant").remove()
    console.log("Zomato response:")
    console.log(response);
    let restaurants = response.best_rated_restaurant;

    restaurants.forEach(restaurant =>{
      let restaurantArr = getRestaurantData(restaurant);
      renderRestCard(restaurantArr);
    })
  });

//call ticketmasterAPI

  var ticketMasterSetting= {
    "url": "https://app.ticketmaster.com/discovery/v2/events.json?city="+cityObj.name+"&stateCode="+cityObj.state+"&apikey=DI18K276tAqWzecpJRpTmFuyJik79JOM",
    "method": "GET",
    "timeout": 0,

  }

  $.ajax(ticketMasterSetting).done(function (response) {
    $(".container").children(".events").remove()
    console.log("TickMasterResponse:");
    console.log(response)

    if(response._embedded){
      let eventsArr = response._embedded.events;
                       
      eventsArr.forEach(event => {
        let eventInfoArr = getEventInfo(event);
        renderEventCard(eventInfoArr);
      })

    }else{
      console.log("no events")
    }
  });

}

function useCurrentCoordinates(){
  console.log("I'm in useCurrentCoordinates")
  function success(position){
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    let queryURL = "https://developers.zomato.com/api/v2.1/geocode?lat="+latitude+"&lon="+longitude;

    let settings = {
      "url": queryURL,
      "method": "GET",
      "timeout": 0,
      "headers": {
        "user-key": "ee81083d2e8f964d3fc648ac92d54cae",
      }
    }

    let ticketMasterSettings={
      "url": "https://app.ticketmaster.com/discovery/v2/events.json?apikey=DI18K276tAqWzecpJRpTmFuyJik79JOM&latlong="+latitude+","+longitude,
      "method": "GET",
      "timeout": 0      
    }

    useCoordinatesRestaurantAPI(settings);

    ticketMasterCoordinateAPI(ticketMasterSettings);
  }

  function error(){
    alert("Unable to retrieve your location")
  }

  if(!navigator.geolocation){
    alert("Cannot use location. Please use City or Zip")
  }else{
    navigator.geolocation.getCurrentPosition(success,error)
  }
}

function useCoordinatesRestaurantAPI(settings){
  $.ajax(settings).then(function (response) {
    $(".container").children(".restaurant").remove()
    let restuarants = response.nearby_restaurants
    
    restuarants.forEach(restaurant => {
      let restaurantArr = getRestaurantData(restaurant);
      renderRestCard(restaurantArr);
    });
  
  });    
}       

function formatStr(str){
  let placeHolder = str;
  placeHolder = placeHolder.split(' ').join('_')
  placeHolder = placeHolder.toLowerCase();

  return placeHolder
};

function getRestaurantData(restaurant){
  let rest = restaurant.restaurant;
  let restName = rest.name;
  let cuisine = rest.cuisines;
  let pRate = rest.price_range;
  let URL = rest.url;
  let photoURL = rest.thumb;
  let uRate = rest.user_rating.aggregate_rating +" "+ rest.user_rating.rating_text
  let menuURL = rest.menu_url

  if(photoURL===""){
    photoURL="https://via.placeholder.com/150/000000/FFFFFF?text=No+Image+Available"
  }

  let restArr = [{name: restName},{cuisineType: cuisine}, {priceRating:pRate}, {website: URL}, {imgURL: photoURL}, {userRate:uRate},{menu: menuURL}]

  //console.log(restArr)

  return restArr;
}

function renderRestCard(restaurant){
  let restaurantName = formatStr(restaurant[0].name);

  let restCard = $("<div></div>").attr("class", "card restaurant")
  restCard.attr("id", restaurantName);
  
  let restImgEl = $("<img>").attr("src", restaurant[4].imgURL);
  restImgEl.attr("class", "restImg")

  let restH2El = $("<h2></h2>").attr("id", "restName-"+restaurantName);
  restH2El.text(restaurant[0].name);

  let restH4El1 = $("<h4></h4>").attr("id", "cuisineType-" +restaurantName);
  restH4El1.text("Cuisine(s): "+restaurant[1].cuisineType);

  let restH4El2 = $("<h4></h4>").attr("id", "starRating-"+restaurantName);
  restH4El2.text("Rating: " +restaurant[5].userRate);

  let restH4El3 = $("<h4></h4>").attr("id", "priceRating-"+restaurantName);
  restH4El3.text("Price: ");

  for(let i =0; i<restaurant[2].priceRating;i++){
    let icon = $("<i></i>").attr("class", "fas fa-dollar-sign");
    restH4El3.append(icon)
  }

  let restPEl = $("<p></p>").attr("class", "textInfo");
  restPEl.attr("id", "description-"+restaurantName);

  let restButtonEl = $("<button></button>").attr("class", "cardContent");
  restButtonEl.attr("id", "restBtn-"+restaurantName);
  
  let aEl = $("<a></a>").attr("href", restaurant[6].menu);
  aEl.text("More Info");
  aEl.attr("style", "color: black; text-decoration: none;")

  restButtonEl.append(aEl);

  restCard.append(restImgEl);
  restCard.append(restH2El);
  restCard.append(restH4El1);
  restCard.append(restH4El2);
  restCard.append(restH4El3);
  restCard.append(restPEl);
  restCard.append(restButtonEl);

  $(".container").append(restCard);
  //renderRestuarantInfo(restaurant);
}