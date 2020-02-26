// this file includes code for the letter count

// array of all airlines we care about
let horizontal = "United Airlines - Pre 07/01/2013, United Airlines, Cathay Pacific, EVA Airways, Singapore Airlines, Philippine Airlines, China Airlines, Air China, Korean Air Lines, All Nippon Airways, Japan Airlines, Asiana Airlines, China Eastern, China Southern, Northwest Airlines, Air India Limited, Delta Airlines, Hong Kong Airlines Limited, Jet Airways, Swissport USA, Evergreen International Airways".split(", ");



/* loop through data set. If horizontalSet contains data[1], add to that space in map */
/* if we go through our data line by line, this will be index 1 */

/* passenger count will be index 11 */

/*
 * want to count the number of passengers per airline.
 Keep a map that maps airline to passenger, add number of passengers. Need to loop through the array we created above.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 */

 /* Return a map */
let countPassengersPerAirline = function(input) {
  let horizontalSet = new Set()



  for (let i = 0; i < horizontal.length; i++) {
    horizontalSet.add(horizontal[i]);
  }

  let airlineToPassengersMap = new Map();

  /* add to map */
  for (let i = 0; i < horizontal.length; i++) {
    airlineToPassengersMap.set(horizontal[i], 0);
  }

  /*
   * you can loop through strings as if they are arrays
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for
   */
  for (let i = 0; i < input.length; i++) {
    let airline = input[i][1];
    let passengersString = input[i][11];
    let country = input[i][6];

    // convert before inserting
    let passengers = parseInt(passengersString, 10);

    // check if in set
    if (horizontalSet.has(airline) && country == 'Asia') {
      //console.log(passengers)
      let currentPassengers = airlineToPassengersMap.get(airline);
      currentPassengers += passengers;
      airlineToPassengersMap.set(airline, currentPassengers);
    }
  }
  console.log(airlineToPassengersMap)
  return airlineToPassengersMap;
};
