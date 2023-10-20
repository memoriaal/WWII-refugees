function test () {
  const acc_sheet = responseSheets['newPersonForm']
  acc_sheet.insertColumnBefore(1)
}

const ss = SpreadsheetApp.openById("1BuELFMc-RNRO_vWFqShQ3ak6Q1KvT-d7hBsZgg94is0")
const NewPersonsSheet = 'Uued isikud'
const FeedbackSheet = 'Tagasiside'
const responseSheets = {
  "target": ss.getSheetByName(NewPersonsSheet),
  "newPersonForm": ss.getSheetByName(NewPersonsSheet),
  "searchResultForm": ss.getSheetByName(FeedbackSheet)
}

function doPost(evnt) {
  Logger.log(JSON.stringify(evnt, null, 2))

  const form = evnt.parameter._form
  Logger.log("POST was called with action", form)
  const responseSheet = responseSheets[form]

  // iterate evnt.parameter and assign keys and values to separate arrays
  // skip _form parameter
  const receivedData = Object.keys(evnt.parameter)
    .filter(k => k !== "_form")
    .map(k => ({ key: k, value: evnt.parameter[k] }))

  // add timestamp in Estonian locale
  const currentTime = new Date().toLocaleString("et-EE")
  receivedData.push({key: 'submitTime', value: currentTime})

  const forename = receivedData.find(d => d.key === 'forename').value || ''
  const surname = receivedData.find(d => d.key === 'surname').value || ''
  const fullName = `${forename} ${surname}`.trim()

  const keys = receivedData.map(d => d.key)
  const values = receivedData.map(d => d.value)
  Logger.log({keys, values})

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

  // insert rowData at the top 
  responseSheet.insertRowBefore(2)
  responseSheet.getRange(2, 1, 1, rowData.length).setValues([rowData])

  if (evnt.parameter.contactEmail) {
    sendEmail(evnt.parameter.contactEmail, evnt.parameter.locale, fullName)
  }
  return response().json(evnt.parameter)
}

function _getDataRows(sheetObject) {
  var sh = sheetObject;

  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}
function _getHeaderRow(sheetObject) {
  var sh = sheetObject;

  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

function sendEmail(recipient, locale, p) {
  var subject = `Thank you for submitting data about ${p}`
  var body = "Estonian Institute of Historical Memory"
  if (locale === 'et') {
    subject = `Täname saadetud andmete eest ${p} kohta`
    body = "Eesti Mälu Instituut"
  }
  MailApp.sendEmail(recipient, subject, body)
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