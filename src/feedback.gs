const ss = SpreadsheetApp.openById("1BuELFMc-RNRO_vWFqShQ3ak6Q1KvT-d7hBsZgg94is0")
const MemoriaalSheetName = 'memoriaal.ee tagasiside'
const WWIIrefSheetName = 'WWII-ref tagasiside'
const responseSheets = {
  "memoriaal": ss.getSheetByName(MemoriaalSheetName),
  "wwiiref": ss.getSheetByName(WWIIrefSheetName)
}

function doPost(req) {
  const target = req.parameter.target
  console.log("POST was called with action", target)
  const responseSheet = responseSheets[target]

  // iterate req.parameter and assign keys and values to separate arrays
  // skip target parameter
  const receivedData = Object.keys(req.parameter)
    .filter(k => k !== "target")
    .map(k => ({ key: k, value: req.parameter[k] }))

  // add timestamp in Estonian locale
  const currentTime = new Date().toLocaleString("et-EE")
  receivedData.push({key: 'submitTime', value: currentTime})

  const keys = receivedData.map(d => d.key)
  const values = receivedData.map(d => d.value)

  // compare keys with header row and append missing columns
  const headerRow = _getHeaderRow(responseSheet)
  const missingColumns = keys.filter(k => !headerRow.includes(k))
  if (missingColumns.length > 0) {
    responseSheet.insertColumnsAfter(headerRow.length, missingColumns.length)
    missingColumns.forEach((c, i) => {
      responseSheet.getRange(1, headerRow.length + i + 1).setValue(c)
    })
  }

  // reorder values to match header row
  const rowData = headerRow.map(h => values[keys.indexOf(h)])

  // append row with new data to sheet
  responseSheet.appendRow(rowData)
  
  var result = {"result": "Insertion successful", receivedData, rowData}

  // return response().json(result)
  // Instead of returning JSON, return a HTML page with "Thank you" message
  return response().html("<html><body><h1>Thank you for feedback!</h1></body></html>")
  
}

function _getDataRows(sheetObject) {
  var sh = sheetObject;

  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}
function _getHeaderRow(sheetObject) {
  var sh = sheetObject;

  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

function response() {
  return {
    json: function (data) {
      return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON)
    },
    text: function (data) {
      return ContentService
        .createTextOutput(data)
        .setMimeType(ContentService.MimeType.TEXT)
    },
    html: function (htmlContents) {
      return HtmlService
        .createHtmlOutput(htmlContents)
    }
  }
}