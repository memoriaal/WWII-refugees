const ss = SpreadsheetApp.openById("1BuELFMc-RNRO_vWFqShQ3ak6Q1KvT-d7hBsZgg94is0")
const NewPersonsSheet = 'Uued isikud'
const FeedbackSheet = 'Tagasiside'
const responseSheets = {
  "target": ss.getSheetByName(NewPersonsSheet),
  "newPersonForm": ss.getSheetByName(NewPersonsSheet),
  "feedback": ss.getSheetByName(FeedbackSheet)
}

function doPost(evnt) {
  console.log(JSON.stringify(evnt, null, 2))

  const form = evnt.parameter._form
  console.log("POST was called with action", form)
  const responseSheet = responseSheets[form]

  // iterate evnt.parameter and assign keys and values to separate arrays
  // skip _form parameter
  const receivedData = Object.keys(evnt.parameter)
    .filter(k => k !== "_form")
    .map(k => ({ key: k, value: evnt.parameter[k] }))

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
  if (form === 'newPersonForm' && evnt.parameter.contactEmail) {
    sendEmail(evnt.parameter.contactEmail, evnt.parameter.locale)
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

function sendEmail(recipient, locale) {
  var subject = "Thank you for your feedback"
  var body = "Your feedback has been received and we will contact you soon!"
  if (locale === 'et') {
    subject = "Täname tagasiside eest"
    body = "Teie tagasiside saadi kätte ja me võtame teiega ühendust!"
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