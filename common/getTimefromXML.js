/* eslint-disable no-underscore-dangle */
const fs = require("fs");
const convert = require("xml-js");

/** 
 * @param {string} time - time to convert
 * @return {string} duration
*/
function convertTime2Elapsed(time) {
  // const sec = parseInt(time, 10); // convert value to number if it's string
  const hours = Math.floor(time / 3600); // get hours
  const minutes = Math.floor((time - hours * 3600) / 60); // get minutes
  const seconds = Math.floor(time - hours * 3600 - minutes * 60); //  get seconds

  let elapsedTime = "";
  if (hours > 0) {
    elapsedTime = `${elapsedTime + hours  }h`;
  }
  if (minutes > 0) {
    elapsedTime = `${elapsedTime + minutes  }m`;
  }
  if (seconds > 0) {
    elapsedTime = `${elapsedTime + seconds  }s`;
  }
  
  return elapsedTime;

}

/**
 * @param {string} string - string to get time from
 * @returns {string} time - elapsed time of test
 */
function getTimefromXML () {
  const args = process.argv.slice(2);

  // read file and convert from xml
  const xmlData = convert.xml2js(args[0]);

  //  extract time from string
  const elapsedTime = xmlData.elements[0].attributes.time;
  const elapsedDuration = convertTime2Elapsed(elapsedTime);
  console.log(elapsedDuration);
}
getTimefromXML();