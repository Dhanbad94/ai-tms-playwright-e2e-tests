/**
 * convert timestamp to yy/mm/dd, no hours, minutes, seconds
 * @param {string} timestamp - timestamp to normalize
 * @return {string} normalizedTimestamp - cleaned up timestamp
 */
function normalizeTimeStamp(rawTimestamp) {

  norm1Timestamp = new Date(rawTimestamp * 1000);
  norm2Timestamp = new Date(norm1Timestamp.setHours(0));
  norm3Timestamp = new Date(norm2Timestamp.setMinutes(0));
  norm4Timestamp = norm3Timestamp.setSeconds(0);
  normalizedTimestamp = Math.floor(norm4Timestamp/1000);
  return normalizedTimestamp;
}

/**
 * Removes the older results and results with browser not set
 * Removes unneeded fields
 * @param {array} results - results list from Testrail
 * @param {integer} timestamp
 * @return {array} results - array of the latest results
 */
function filterResults() {

  // extract args
  const args = process.argv.slice(2);
  const results = JSON.parse(args[0]);

  // prune results
  const testStartTimeStamp = args[1];
  const newResultsOnly = results.filter(result => result.created_on > testStartTimeStamp);
  const prunedResults = newResultsOnly.filter(result => result.custom_browser_id !== null);

  // remove unneeded fields and normalize timestamp

  prunedResults.forEach((result) => {
    delete result.assignedto_id;
    delete result.comment;
    delete result.version;
    delete result.defects;
    delete result.created_by;
    delete result.custom_step_results;
    delete result.attachment_ids;
    result.created_on = normalizeTimeStamp(result.created_on);
  });

  console.log(JSON.stringify(prunedResults));
}
filterResults();
