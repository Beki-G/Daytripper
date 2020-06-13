var settings = {
    "url": "https://developers.zomato.com/api/v2.1/geocode?lat=40.742051&lon=-74.004821",
    "method": "GET",
    "timeout": 0,
    "headers": {
      "user-key": "ee81083d2e8f964d3fc648ac92d54cae",
    },
};
  
$.ajax(settings).then(function (response) {
    console.log(response);
});                             