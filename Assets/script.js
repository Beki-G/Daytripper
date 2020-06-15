//ticketmaster ajax
var settings = {
    "url": "https://app.ticketmaster.com/discovery/v2/events.json?city=[medford]&stateCode=OR&apikey=DI18K276tAqWzecpJRpTmFuyJik79JOM",
    "method": "GET",
    "timeout": 0    
};

let href = ""
$.ajax(settings).done(function (response) {
    //console.log(response);
   //console.log(response._embedded.events[0].outlets[0].url)
    $("#testLink").attr("href", response._embedded.events[0].outlets[0].url);
    renderTicketMasterResponse(response);
});


$("#eventBtn").click(event=>{
    //console.log("I'm listening!")
    location.href = $("#testLink").attr("href");
    //console.log( $("#testLink").attr("href"))
})

function renderTicketMasterResponse(response){
    let event = response._embedded.events[0]

    let genre = event.classifications[0].genre.name;

    let venue = event._embedded.venues[0].name;

    let venueAddress = event._embedded.venues[0].address.line1+" "+event._embedded.venues[0].city.name+" "+event._embedded.venues[0].state.name

    let eventDate = event.dates.start.dateTime;

    let eventName = event.name;

    let d = new Date(eventDate);

    let eventDay = d.getDate();
    let eventMonth = d.getMonth()+1;
    let eventYear = d.getFullYear();

    let eventDateStr = eventMonth+"/"+eventDay+"/"+eventYear;

    let eventImg = event.images[0].url;




    //console.log(eventDate)

    // console.log(genre);
    // console.log(venue);
    //console.log(eventDateStr);

    $("#genre").text("Genre: "+genre);
    $("#venue").text("Venue: "+venue);

    let pEl = $("<p></p>").text(venueAddress);

    $("#venue").append(pEl);
    $("#date").text("Date: "+eventDateStr);
    $("#eventName").text(eventName);
    $(".events").children("img").attr("src", eventImg)
}