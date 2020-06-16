$("#geoButton").click(function(){
    event.preventDefault();
    console.log("I heard the button")
    useCurrentCoordinates();
})

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

    useCoordinatesRestaurantAPI(settings);
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