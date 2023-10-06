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

  const receivedData = req.postData.contents
    .split('&')
    .map(e => {
      const [key, value] = e.split('=').map(decodeURIComponent)
      return {key: key, value: value}
    })
  const currentTime = new Date().toISOString()
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

  return response().json(result)
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
        .setMimeType(ContentService.MimeType.JSON);
    },
    text: function (data) {
      return ContentService
        .createTextOutput(data)
        .setMimeType(ContentService.MimeType.TEXT);
    }
  }
}