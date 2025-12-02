const fs = require('fs');
const path = require('path');
const dateFormat = require('date-fns/format');

/**
 * Combines the data from a matching set of parallel and sequential files
 * @param {integer} parallelIndex - index of the parallel file
 * @param {integer} sequentialIndex - index of the sequential file
 * @param {array} jsonFiles - list of file names
 * @returns {undefined}
 */
function combineParallelSequentialFiles(
  parallelIndex,
  sequentialIndex,
  jsonFiles,
) {
  const currentDir = process.cwd();
  // read files
  const parallelResults = JSON.parse(
    fs.readFileSync(`${currentDir}/dist/reports/${jsonFiles[parallelIndex]}`),
  ); // combine total test, passed and failed
  const sequentialResults = JSON.parse(
    fs.readFileSync(`${currentDir}/dist/reports/${jsonFiles[sequentialIndex]}`),
  );

  // change the test type to parallel+sequential
  parallelResults[0]['Browser-Test-Type'] = 'parallel+sequential';
  // combine the test counts
  parallelResults[0]['Number-of-tests-ran'] +=
    sequentialResults[0]['Number-of-tests-ran'];
  parallelResults[0]['Number-of-tests-passed'] +=
    sequentialResults[0]['Number-of-tests-passed'];
  parallelResults[0]['Number-of-tests-failed'] +=
    sequentialResults[0]['Number-of-tests-failed'];

  // combine the failure details
  sequentialResults[0].failedTestsDetails.forEach((failure) => {
    parallelResults[0].failedTestsDetails.push(failure);
  });

  // write combined file to parallel file and rename
  fs.writeFileSync(
    path.join(`${currentDir}/dist`, 'reports', `${jsonFiles[parallelIndex]}`),
    JSON.stringify(parallelResults, null, 4),
  );
  const newFileName = jsonFiles[parallelIndex].replace('parallel', 'combined');
  fs.renameSync(
    `${currentDir}/dist/reports/${jsonFiles[parallelIndex]}`,
    `${currentDir}/dist/reports/${newFileName}`,
  );

  // delete original sequential file
  fs.unlinkSync(`${currentDir}/dist/reports/${jsonFiles[sequentialIndex]}`);
}
/**
 * Check to see if there are matching parallel/sequential runs and combine them
 * @param {string} browser - browser
 * @param {array} jsonFiles - list of json files
 * @return {boolean} found
 */
function checkMatchingTestRuns(browser, jsonFiles) {
  // look for browser parallel file
  const foundParallelIndex = jsonFiles.findIndex((element) =>
    element.includes(`${browser}-parallel`),
  );
  let found = false;

  if (foundParallelIndex >= 0) {
    // get run number
    const testRun = path
      .parse(`${jsonFiles[foundParallelIndex]}`)
      .name.split('-')
      .pop();
    // check for matching sequential file
    const foundSequentialIndex = jsonFiles.findIndex((element) =>
      element.includes(`${browser}-sequential-${testRun}`),
    );
    if (foundSequentialIndex >= 0) {
      combineParallelSequentialFiles(
        foundParallelIndex,
        foundSequentialIndex,
        jsonFiles,
      );
      found = true;
    }
  }
  return found;
}

/**
 *  Converts a JSON object to a formatted string for displaying results
 * @param {string} file - name of file to convert
 * @returns {undefined}
 */
function convertJSON2Txt(file) {
  let overallTextSummary = '';
  // read file
  const results = JSON.parse(fs.readFileSync(`${file}`));

  results.forEach((result) => {
    // Convert to text file format
    const textSummary =
      `Environment: ${result.Environment}\n` +
      `Browser Name: ${result.Browser}\n` +
      `Browser Test Type: ${result['Browser-Test-Type']}\n` +
      `Number of tests ran: ${result['Number-of-tests-ran']}\n` +
      `Number of tests passed: ${result['Number-of-tests-passed']}\n` +
      `Number of tests failed: ${result['Number-of-tests-failed']}\n` +
      `failedTestsDetails: ${JSON.stringify(
        result.failedTestsDetails,
        null,
        4,
      )}\n\n`;
    overallTextSummary += textSummary;
  });

  // Save file
  fs.writeFileSync(
    path.join(
      __dirname,
      '../dist',
      'reports',
      `Test-Run-Overall-Summary-e2e-results-${dateFormat(
        new Date(),
        'MMM-d-yyyy_h-mm-ss-a',
      )}.txt`,
    ),
    overallTextSummary,
  );
}

/**
 * This function is intended to combine and/or contenate multiple JSON test results into 1 JSON file and 1 Text file
 *
 * Results can come in the following combinations:
 *  - single file which contain "<browser>-parallel" or "<browser>-sequential", where browser is any supported browser [../run-tests -e dev -p zebrafish -f transaction]
 *  - two files
 *    - 1 contains "<browser>-parallel/sequential-<test-run-number>"; the other contains "<browser>-parallel/sequential-<test-run-number>" where browser and test-run-number match
 *        [../run-tests -e dev -p zebrafish -f asset -t system]
 *    - where the 2 files have different browsers but the same test run number
 *      [../run-tests -e dev -p zebrafish -f transaction --ba]
 *  - 4 files (assuming 2 browsers are supported)
 *     - Means 2 browsers were run and there are parallel and sequential tests
 *        [../run-tests -e dev -p zebrafish -f asset -t system --ba ]
 *  - 4 files (assuming 4 environments run when "-e all" is used)
 *     - Each file has different test-run-number and environment and the same browser and test-type
 *       [../run-tests -e all -p zebrafish -f transaction ]
 *  - 8 files (assuming 4 environments - same as 4 files above but there are parallel and sequential tests)
 *     - Each file has different environment, same browser, different test-type with matching pairs of sequential/parallel files with the same test-run-number
 *       [../run-tests -e all -p zebrafish -f asset ]
 *  - 16 files (assuming 4 environments - same as 4/8 files above and 2 browsers are supported, but there are multiple browsers and para;;el and sequential tests)
 *     [ ../run-test -e all -p zebrafish -f asset --ba]
 *
 *
 *  @returns {undefined}
 */
function concatenateTestResults() {
  // get the report directory path
  const reportDir = `${process.cwd()}/dist/reports`;

  // get list of json test results files
  let jsonFiles = fs
    .readdirSync(`${reportDir}`)
    .filter((file) => path.extname(file) === '.json');
  const overallTestResults = [];

  if (jsonFiles.length === 1) {
    // create txt version
    convertJSON2Txt(`${reportDir}/${jsonFiles[0]}`);

    // rename orginal file
    fs.renameSync(
      `${reportDir}/${jsonFiles[0]}`,
      `${reportDir}/Test-Run-Overall-Summary-e2e-results-${dateFormat(
        new Date(),
        'MMM-d-yyyy_h-mm-ss-a',
      )}.json`,
    );
  } else {
    // read browsers file
    const { browsers } = JSON.parse(fs.readFileSync(`${process.cwd()}/config/browsers.json`));

    // loop thru browsers list
    browsers.forEach((browser) => {
      checkMatchingTestRuns(browser, jsonFiles);
    });
  }

  // re-read jsonFiles after matching run processing
  jsonFiles = fs
    .readdirSync(`${reportDir}`)
    .filter((file) => path.extname(file) === '.json');

  jsonFiles.forEach((file) => {
    // read the file
    const testResults = JSON.parse(
      fs.readFileSync(path.join(`${reportDir}`, file)),
    );

    // push results in overall results
    overallTestResults.push(testResults[0]);

    // delete file
    fs.unlinkSync(`${reportDir}/${file}`);
  });
  const newFilename = `${reportDir}/Test-Run-Overall-Summary-e2e-results-${dateFormat(
    new Date(),
    'MMM-d-yyyy_h-mm-ss-a',
  )}.json`;

  fs.writeFileSync(
    `${newFilename}`,
    JSON.stringify(overallTestResults, null, 4),
  );
  convertJSON2Txt(newFilename);
}
concatenateTestResults();
