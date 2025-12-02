import * as fs from 'fs';
const convert: any = require('xml-js');

export function processXMLFile(): void {
  const args = process.argv.slice(2);
  const xmlData: any = convert.xml2js(fs.readFileSync(`${args[0]}`), { compact: false });
  xmlData.elements[0].attributes.name = `${args[1]}`;

  xmlData.elements[0].elements.forEach((testsuite: any) => {
    testsuite.elements.forEach((testcase: any) => {
      if (testcase.name === 'testcase' && typeof testcase.elements !== 'undefined') {
        testcase.elements.forEach((element: any) => {
          if ((element.name === 'failure' || element.name === 'error') && (element.attributes.message.includes('<'))) {
            element.attributes.message = element.attributes.message.replace(/</, '&lt;');
            element.attributes.message = element.attributes.message.replace(/>/, '&gt;');
          }
        });
      }
    });

    testsuite.attributes.name = testsuite.attributes.name.substring(testsuite.attributes.name.lastIndexOf('.') + 1, testsuite.attributes.name.length);
    testsuite.attributes.name = testsuite.attributes.name.replace(/-/g, ' ');
  });

  fs.writeFileSync(`${args[0]}`, convert.js2xml(xmlData, { compact: false, spaces: 2 }));
}

if (require.main === module) processXMLFile();
