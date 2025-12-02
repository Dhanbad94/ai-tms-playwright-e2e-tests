/* eslint-disable no-underscore-dangle */
const fs = require("fs");
const convert = require('xml-js');


/**
 * @param {string} filename - filename to update
 * @param {string} feature - used for testsuites' name
 * @returns {undefined}
 */
function processXMLFile () {
  const args = process.argv.slice(2);

  // read file and convert from xml
  const xmlData = convert.xml2js(fs.readFileSync(`${args[0]}`), {
    compact: false,
  });
  // set testsuites name
  xmlData.elements[0].attributes.name = `${args[1]}`;

  
  xmlData.elements[0].elements.forEach((testsuite) => {
    // fix messages in testcases
    testsuite.elements.forEach((testcase) => {
      if (
        testcase.name === 'testcase' &&
        typeof testcase.elements !== 'undefined'
      ) {
        testcase.elements.forEach((element) => {
          if (
            (element.name === 'failure' || element.name === 'error' ) &&
            (element.attributes.message.includes('<')
            )) {
            element.attributes.message = element.attributes.message.replace(
              /</,
              '&lt;',
            );
            element.attributes.message = element.attributes.message.replace(
              />/,
              '&gt;',
            );
          }
        });
      }
    });

    // for each testsuite, reset the name
    testsuite.attributes.name = testsuite.attributes.name.substring(
      testsuite.attributes.name.lastIndexOf('.') + 1,
      testsuite.attributes.name.length,
    );
    testsuite.attributes.name = testsuite.attributes.name.replace(/-/g, ' ');

  });

  // convert to xml and write
  fs.writeFileSync(
    `${args[0]}`,
    convert.js2xml(xmlData, { compact: false, spaces: 2 }),
  );

};

processXMLFile ();