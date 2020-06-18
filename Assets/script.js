
function ticketMasterCoordinateAPI(settings){
    $.ajax(settings).then(function(response){
        $(".container").children(".events").remove()
        let eventsArr = response._embedded.events;
                        
        eventsArr.forEach(event => {
            let eventInfoArr = getEventInfo(event);
            renderEventCard(eventInfoArr);
        });
    })
}

// function renderTicketMasterResponse(response){
//     let event = response._embedded.events[0]

//     let genre = event.classifications[0].genre.name;

//     let venue = event._embedded.venues[0].name;

//     let venueAddress = event._embedded.venues[0].address.line1+" "+event._embedded.venues[0].city.name+" "+event._embedded.venues[0].state.name

//     let eventDate = event.dates.start.dateTime;

//     let eventName = event.name;

//     let d = new Date(eventDate);

//     let eventDay = d.getDate();
//     let eventMonth = d.getMonth()+1;
//     let eventYear = d.getFullYear();
//     console.log(d);
//     let eventDateStr = eventMonth+"/"+eventDay+"/"+eventYear;

//     let eventImg = event.images[0].url;


//     $("#genre").text("Genre: "+genre);
//     $("#venue").text("Venue: "+venue);

//     let pEl = $("<p></p>").text(venueAddress);

//     $("#venue").append(pEl);
//     $("#date").text("Date: "+eventDateStr);
//     $("#eventName").text(eventName);
//     $(".events").children("img").attr("src", eventImg)
// }

function getEventInfo(event){
    console.log(event)
    let eventName = event.name;
    let eventGenre =event.classifications[0].genre.name+" - "+ event.classifications[0].subGenre.name;
    let eventVenue = event._embedded.venues[0].name;
    
    let eventDate = event.dates.start.dateTime;
    let d = new Date(eventDate);
    let eventDay = d.getDate();
    let eventMonth = d.getMonth()+1;
    let eventYear = d.getFullYear();
    console.log(d);
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

    console.log(eventInfoObj)
    return eventInfoObj;
    
}

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