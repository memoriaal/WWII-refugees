// wait till page loaded, then fill in search field

window.addEventListener('load', function () {
    const qs = getQueryStringValue('q')
    const input = document.querySelector('input[name="q"]')

    const detailSearchInputsWrapper = document.querySelector(".detail-search-inputs-wrapper");
    const showMoreSearchFieldsButton = document.querySelector(".more-fields-button");
    const generalSearchInput = document.querySelector(".search-input--general-search");
    const detailSearchInputs = queryAll(".search-input--detail-search");
    
    let detailSearchQueryStrings = [];
    let detailSearchQueryString;


    for (let input of detailSearchInputs) {
        if(input.classList.contains("search-firstname")) {
            detailSearchQueryString = getQueryStringValue('firstname');
        } else if(input.classList.contains("search-lastname")) {
            detailSearchQueryString = getQueryStringValue('lastname');
        } else if(input.classList.contains("search-mothers-firstname")) {
            detailSearchQueryString = getQueryStringValue('mothersFirstname');
        } else if(input.classList.contains("search-mothers-lastname")) {
            detailSearchQueryString = getQueryStringValue('mothersLastname');
        } else if(input.classList.contains("search-fathers-firstname")) {
            detailSearchQueryString = getQueryStringValue('fathersFirstname');
        } else if(input.classList.contains("search-fathers-lastname")) {
            detailSearchQueryString = getQueryStringValue('fathersLastname');
        } else if(input.classList.contains("search-birthplace")) {
            detailSearchQueryString = getQueryStringValue('birthplace');
        } else if(input.classList.contains("search-place-of-residence")) {
            detailSearchQueryString = getQueryStringValue('placeOfResidence');
        } else if(input.classList.contains("search-place-of-death")) {
            detailSearchQueryString = getQueryStringValue('placeOfDeath');
        } else if(input.classList.contains("birthyear-from")) {
            detailSearchQueryString = getQueryStringValue('birthYearFrom');
        } else if(input.classList.contains("birthyear-to")) {
            detailSearchQueryString = getQueryStringValue('birthYearTo');
        } else if(input.classList.contains("deathyear-from")) {
            detailSearchQueryString = getQueryStringValue('deathYearFrom');
        } else if(input.classList.contains("deathyear-to")) {
            detailSearchQueryString = getQueryStringValue('deathYearTo');
        }
        
        input.value = detailSearchQueryString;
        if(input.value !== "") {
            detailSearchQueryStrings.push(input.value);
        }
    }

    if(detailSearchQueryStrings.length > 0) {
        detailSearchInputsWrapper.style.display = "block";
        input.style.display = "none";
        showMoreSearchFieldsButton.style.display = "none";
    }

    showMoreSearchFieldsButton.addEventListener(("click"), (event) => {
        showMoreSearchFieldsButton.style.display = "none";
        showMoreSearchInputsFields(event, generalSearchInput, detailSearchInputsWrapper);
    })

    if (qs || detailSearchQueryStrings.length > 0) {
        input.value = qs
        performQueryWithTimeout(qs, detailSearchQueryStrings, detailSearchInputs)
        .catch(err => {
          console.error(err);
        //   location.reload(); // Refresh the page
        });
        // performQuery(qs, detailSearchQueryStrings, detailSearchInputs)
    } else {
        this.document.getElementById('intro').classList.remove('w3-hide')
    }
})

// Because of accidentally closing modal when ending drag outside of modal,
// we need to keep track of whether user is selecting text inside modal.
const trackMouse = { 
    x: -1, 
    y: -1 
}
const resetMouseTracking = () => {
    trackMouse.x = -1
    trackMouse.y = -1
}
const hasMouseMoved = (event) => {
    if (trackMouse.x === -1 && trackMouse.y === -1) {
        return false
    }
    return trackMouse.x !== event.clientX || trackMouse.y !== event.clientY
}

var ecresults = {}
var fbFormData = {}


function performQuery(qs, detailSearchQueryStrings, detailSearchInputs) {
    // Elasticsearch query, that matches querystring with multiple fields and filters by WWII
    
    let qData = {
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: qs,
                                fields: ['perenimi', 'eesnimi', 'id', 'pereseosed.kirje', 'kirjed.kirje'],
                                operator: 'and',
                                type: 'cross_fields',
                            }
                        }
                    ],
                    filter: [
                        { term: { wwii: 1 } }
                    ]
                },
            },
            sort: { 'eesnimi.raw': 'asc', 'perenimi.raw': 'asc' },
            _source: [
                'isperson', 'kivi', 'emem', 'evo', 'wwii', 'evokirje',
                'perenimi', 'eesnimi', 'isanimi', 'emanimi', 'perenimed', 'eesnimed',
                'sünd', 'surm', 'sünnikoht', 'surmakoht', 'id',
                'kirjed.kirje', 'kirjed.kirjekood', 'kirjed.viide', 'kirjed.allikas', 'kirjed.allika_nimetus',
                'pereseosed.persoon', 'pereseosed.kirje',
                'pereseosed.seos', 'pereseosed.suund', 'pereseosed.kirjed',
                'tahvlikirje.kirjekood', 'tahvlikirje.kirje', 'tahvlikirje.tahvel', 'tahvlikirje.tulp', 'tahvlikirje.rida',
                'episoodid.nimetus', 'episoodid.väärtus', 'episoodid.asukoht',
                'redirect'
            ],
        }

    if(detailSearchQueryStrings.length > 0) {
        qData = detailSearch(qData, detailSearchInputs, qs);
    }

    // If querystring is 10 digits, then redirect to person page
    
    var idQuery = (qs == Number(qs) && qs.length === 10)
    
    try {
        const response = await fetch('/.netlify/functions/searchB', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(qData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        generalSearch(data, idQuery, qData);
    } catch (error) {
        console.error('Error:', error);
    }
}

const performQueryWithTimeout = await (qs, detailSearchQueryStrings, detailSearchInputs) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Query timed out'));
      }, 2000); // 2 seconds
  
      performQuery(qs, detailSearchQueryStrings, detailSearchInputs)
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
    });
};

function detailSearch(qData, detailSearchInputs, qs) {
    let qDataField;
    let birthyearFrom = "";
    let birthyearTo = "";
    let deathyearFrom = "";
    let deathyearTo = "";

    qData.query.bool.must = [];
    for (let input of detailSearchInputs) {
        if(input.value !== "") {
            qs = input.value;

            let queryObject = {
                multi_match: {
                    query: qs,
                    fields: [],
                    operator: 'and',
                    type: 'cross_fields',
                }
            }

            if(input.classList.contains("search-firstname")) {
                qDataField = "eesnimi";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            else if(input.classList.contains("search-lastname")) {
                qDataField = "perenimi";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            else if(input.classList.contains("search-mothers-firstname")) {
                qDataField = "emanimi";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            // else if(input.classList.contains("search-mothers-lastname")) {
            //     qDataField = "";
            //     queryObject.multi_match.fields.push(qDataField);
            // }
            else if(input.classList.contains("search-fathers-firstname")) {
                qDataField = "isanimi";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            // else if(input.classList.contains("search-fathers-lastname")) {
            //     qDataField = "";
            //     queryObject.multi_match.fields.push(qDataField);
            // }
            else if(input.classList.contains("search-birthplace")) {
                qDataField = "sünnikoht";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            else if(input.classList.contains("search-place-of-residence")) {
                qDataField = "kirjed.kirje";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            else if(input.classList.contains("search-place-of-death")) {
                qDataField = "surmakoht";
                queryObject.multi_match.fields.push(qDataField);
                qData.query.bool.must.push(queryObject);
            }
            else if(input.classList.contains("birthyear-from")) {
                qDataField = "sünd";
                birthyearFrom = qs;
                if(birthyearTo === "") {
                    birthyearTo = "now";
                }
                qData.query.bool.must.push({
                    range: {
                        [qDataField]: {
                            gte: birthyearFrom,
                            lte: birthyearTo,
                            relation: "within"
                        }
                    }
                })
            }
            else if(input.classList.contains("birthyear-to")) {
                qDataField = "sünd";
                birthyearTo = qs;
                if(birthyearFrom === "") {
                    birthyearFrom = "1850";
                }
                qData.query.bool.must.push({
                    range: {
                        [qDataField]: {
                            gte: birthyearFrom,
                            lte: birthyearTo,
                            relation: "within"
                        }
                    }
                })
            }
            else if(input.classList.contains("deathyear-from")) {
                qDataField = "surm";
                deathyearFrom = qs;
                if(deathyearTo === "") {
                    deathyearTo = "now";
                }
                qData.query.bool.must.push({
                    range: {
                        [qDataField]: {
                            gte: deathyearFrom,
                            lte: deathyearTo,
                            relation: "within"
                        }
                    }
                })
            }
            else if(input.classList.contains("deathyear-to")) {
                qDataField = "surm";
                deathyearTo = qs;
                if(deathyearFrom === "") {
                    deathyearFrom = "1850";
                }
                qData.query.bool.must.push({
                    range: {
                        [qDataField]: {
                            gte: deathyearFrom,
                            lte: deathyearTo,
                            relation: "within"
                        }
                    }
                })
            }
        }
    }
    
    return qData;
}

function showMoreSearchInputsFields(event, generalSearchInput, detailSearchInputsWrapper) {
    event.preventDefault();
    event.stopImmediatePropagation();
    generalSearchInput.value = "";
    generalSearchInput.style.display = "none";
    detailSearchInputsWrapper.style.display = "block";
}

function generalSearch(xhr2, idQuery, qData) {
    const data = JSON.parse(xhr2.responseText);
    ecresults = data
    console.log('ecresults', ecresults)
    console.log(data.error || 'All green', { query: qData.query, total: data.hits.total.value, hits: data.hits.hits.map(hit => hit._source) })
    const searchCountE = document.querySelector('#search-count')
    if(data.hits.total.value) {
        searchCountE.innerHTML = "Leitud tulemuste arv: " + data.hits.total.value;
    }
    const hits = data.hits.hits
    if (idQuery && hits[0] && hits[0]._source.redirect) {
        window.location.href = '/?q=' + hits[0]._source.redirect
    }
    const resultTemplateE = get('search-result-template')
    const searchResultsE = get('search-results')
    for (let i = 0; i < hits.length; i++) {
        const text = []
        const p = hits[i]._source
        fbFormData[p.id] = {
            id: p.id,
            name: p.eesnimi + ' ' + p.perenimi
        }
        searchResultsE.appendChild(fillTemplate(resultTemplateE.cloneNode(true), p))

        if (p.evo === 1) {
            text.push('<hr/><p class="mb-0">Nimi ohvitseride mälestusseinal: ' + p.evokirje + '</p>')
        }
        text.push('</div>')
        text.push('</div>')
        text.push('</div>')
        const searchResults = document.querySelector('#search-results')
        searchResults.innerHTML += text.join('')
    }
    const acc = document.getElementsByClassName('pereliige')
    console.log('Search results loaded', acc.length, acc)
    for (let i = 0; i < acc.length; i++) {
        console.log('classlist of last child', acc[i].lastChild.classList)
        acc[i].addEventListener("click", function () {
            this.classList.toggle("active")
            this.lastChild.classList.toggle('folded')
        });
    }
    document.getElementById("searchform").scrollIntoView()
    window.scrollBy(0, -100)

    initResultFeedbackButtons()
}

function initResultFeedbackButtons() {
    get('search-results').querySelectorAll('button').forEach(button => {
        // console.log('setupSearchResultForm', button)
        button.addEventListener('click', openSearchResultFeedbackForm)
    })
}

function fillTemplate(recordE, p) {
    recordE.style.display = ''
    // console.log('fillTemplate', p)
    recordE.id = p.id
    const personName = (p.eesnimi ? p.eesnimi : '') + ' ' + p.perenimi

    const surnameE = recordE.querySelector('#surname')
    recordE.querySelector('#forename').innerHTML = p.eesnimi   || ''
    if (p.perenimi) {
        surnameE.innerHTML = p.perenimi
    } else {
        surnameE.previousElementSibling.remove()
        surnameE.remove()
    }

    const birthplaceE = recordE.querySelector('#birthplace')
    const deathplaceE = recordE.querySelector('#deathplace')
    recordE.querySelector('#birthdate').innerHTML = p.sünd       || ''
    if (p.sünnikoht) {
        birthplaceE.innerHTML = p.sünnikoht
    } else {
        birthplaceE.previousElementSibling.remove()
        birthplaceE.remove()
    }
    recordE.querySelector('#deathdate').innerHTML = p.surm       || ''
    if (p.surmakoht) {
        deathplaceE.innerHTML = p.surmakoht
    } else {
        deathplaceE.previousElementSibling.remove()
        deathplaceE.remove()
    }
    recordE.querySelector('#fathername').innerHTML = p.isanimi   || ''
    recordE.querySelector('#mothername').innerHTML = p.emanimi   || ''

    const resultLinkE = recordE.querySelector('#resultId a')
    resultLinkE.innerHTML = p.id
    resultLinkE.href = './?q=' + p.id
    recordE.querySelector('#resultId').id = 'ID_' + p.id

    stripReplace('#searchResultFeedbackFormLink', personName, 'feedback_' + p.id)

    p.kirjed = p.kirjed || []

    const resultRecordsE = recordE.querySelector('#resultRecords')
    const resultRecordTemplateE = recordE.querySelector('#result-record-template')
    for (let ik = 0; ik < p.kirjed.length; ik++) {
        const resultRecordE = resultRecordTemplateE.cloneNode(true)
        const pKirje = p.kirjed[ik]
        resultRecordE.id = p.id + '_' + ik
        resultRecordE.setAttribute('code', pKirje.kirjekood)
        resultRecordE.querySelector('.record-label').innerHTML = pKirje.allikas
        const allikaLinkE = resultRecordE.querySelector('a')
        if (pKirje.viide && pKirje.viide.length > 0) {
            allikaLinkE.href = pKirje.viide
        } else {
            allikaLinkE.classList.remove('w3-btn', 'record-link')
        }
        resultRecordE.querySelector('.record-text').innerHTML = replaceLinebreaks(pKirje.kirje)
        resultRecordsE.appendChild(resultRecordE)
    }

    p.pereseosed = p.pereseosed || []
    if (p.pereseosed.length === 0) {
        recordE.querySelector('#resultFamily').remove()
    } else {
        const resultRecordFamily = recordE.querySelector('#resultFamily')
        resultRecordFamily.id = 'family_of_' + p.id
        const familyMemberTemplateE = recordE.querySelector('#resultFamilyMember')

        for (let ip = 0; ip < p.pereseosed.length; ip++) {
            const pPereseos = p.pereseosed[ip]
            const pereseos = p.pereseosed[ip].seos
            if (pPereseos.suund === '-1') {
                pPereseos.seos = '(' + pereseos + ')'
            }
            const perekirjed = pPereseos.kirjed || []
            const familyMemberE = familyMemberTemplateE.cloneNode(true)
            familyMemberE.id = p.id + '_F_' + ip
            familyMemberE.classList.add('family-member')
            familyMemberE.querySelector('.family-member-full-record .code').innerHTML = pPereseos.seos + ' ' + pPereseos.persoon
            familyMemberE.querySelector('.family-member-full-record .record').innerHTML = replaceLinebreaks(pPereseos.kirje)

            for (let ik = 0; ik < perekirjed.length; ik++) {
                const perekirje = perekirjed[ik]
                const resultRecordE = resultRecordTemplateE.cloneNode(true)
                resultRecordE.id = p.id + '_' + ik
                resultRecordE.setAttribute('code', perekirje.kirjekood)
                resultRecordE.querySelector('.record-label').innerHTML = perekirje.allikas
                const allikaLinkE = resultRecordE.querySelector('a')
                if (perekirje.viide && perekirje.viide.length > 0) {
                    allikaLinkE.href = perekirje.viide
                } else {
                    allikaLinkE.classList.remove('w3-btn', 'record-link')
                }
                resultRecordE.querySelector('.record-text').innerHTML = perekirje.kirje
                familyMemberE.appendChild(resultRecordE)
            }
            resultRecordFamily.appendChild(familyMemberE)
        }
        familyMemberTemplateE.remove()
    }

    if (p.tahvlikirje && p.kivi) {
        const plaqueTemplateE = get('search-result-plaque-template')
        const plaqueE = plaqueTemplateE.cloneNode(true)
        plaqueE.id = 'plaque_' + p.id
        plaqueE.querySelector('#plaquename').innerHTML = p.tahvlikirje.tahvel
        plaqueE.querySelector('#plaquecolumn').innerHTML = p.tahvlikirje.tulp
        plaqueE.querySelector('#plaquerow').innerHTML = p.tahvlikirje.rida
        plaqueE.querySelector('#nameonplaque').innerHTML = p.tahvlikirje.kirje
        plaqueE.classList.remove('w3-hide')
        recordE.querySelector('.search-result-main').appendChild(plaqueE)
    }
    // remove templates from DOM
    resultRecordTemplateE.remove()
    return recordE

    function stripReplace(selector, text, newId = false) {
        const element = recordE.querySelector(selector)
        element.innerHTML = element.innerHTML.replace('%s', text)
        if (newId) {
            element.id = newId
        } else {
            element.removeAttribute('id')
        }
    }
}

window.addEventListener('load', setupNewPersonForm)
window.addEventListener('load', setupSearchResultForm)
window.addEventListener('load', setupModals)

const feedbackBase = 'https://script.google.com/macros/s'
const feedbackApiId =
    'AKfycbyLwhNTYHw26-vVY68hd_xBxOEO9_VxxQ3WmiMhT5RnRxTrqqztnOO_fC1-k0DQtE18XQ'
const feedbackApi = `${feedbackBase}/${feedbackApiId}/exec?_form=`


function setupModals() {
    const modalClick = (evnt) => {
        // console.log('modalClick', evnt)
        evnt.preventDefault()
        evnt.stopPropagation()
        evnt.stopImmediatePropagation()
        return false
    }
    const openModal = (evnt) => {
        // console.log('openModal', evnt.target)
        evnt.target.style.display = 'block'
    }
    const closeModal = (event_or_element) => {
        if (!event_or_element) return
        const target = event_or_element.target || event_or_element
        // If target is not modal root, then call close modal on parent
        console.log('closeModal', { target, classList: target.classList })
        if (!target.classList) {
            // console.log('closeModal no classList', target)
            return closeModal(target.parentElement)
        }
        if (!target.classList.contains('modal-root')) {
            // console.log('closeModal not modal-root', target.classList)
            return closeModal(target.parentElement)
        }
        if (target.style.display === 'none')
            return
        // console.log('closeModal', target)
        target.style.display = 'none'
    }

    const modalEs = queryAll('.modal-content')
    for (let i = 0; i < modalEs.length; i++) {
        modalEs[i].addEventListener('click', modalClick)
    }

    const openModalEs = queryAll('.open-modal')
    for (let i = 0; i < openModalEs.length; i++) {
        openModalEs[i].addEventListener('click', openModal)
    }
    const closeModalEs = queryAll('.close-modal')
    addTrackMouseListeners(closeModalEs)

    const modalRootEs = queryAll('.modal-root')
    addTrackMouseListeners(modalRootEs)

    document.onkeydown = function (evnt) {
        if (evnt.key === "Escape") {
            for (let i = 0; i < modalRootEs.length; i++) {
                closeModal(modalRootEs[i])
            }
        }
    }

    function addTrackMouseListeners(closeEs) {
        for (let i = 0; i < closeEs.length; i++) {
            const closeE = closeEs[i]

            closeE.addEventListener('mousedown', function(event) {
                trackMouse.x = event.clientX
                trackMouse.y = event.clientY
                console.log('mousedown')
            })

            closeE.addEventListener('click', function (event) {
                console.log('click')
                if (!hasMouseMoved(event)) {
                    console.log('click not selecting')
                    resetMouseTracking()
                    return closeModal(event)
                }
                console.log('click selecting')
            })
        }
    }
}

function setupNewPersonForm() {
    setupForm('newPersonForm')
}
function setupSearchResultForm() {
    setupForm('searchResultForm')
}

function setupForm(formName) {
    const formE = get(formName)
    const validator = new Validator(formE)
    const submitE = get(`${formName}SubmitButton`)

    const submitNewPerson = (evnt) => {
        if (!validator.valid) {
            get('alert_mandatoryNameAndEmail').style.display = 'block'
            evnt.preventDefault()
            return false
        }
        // console.log('submitFeedback', formName, evnt, validator.valid)
        formE.classList.add('w3-disabled')
        // Set up named timer to re-enable form after 5 seconds
        // and alert user that form was not submitted
        const timerName = `${formName}Timer`
        const timer = setTimeout(() => {
            formE.classList.remove('w3-disabled')
            get('alert_formNotSubmitted').style.display = 'block'
        }, 5000)
        // If timer already exists, clear it
        if (window[timerName]) {
            clearTimeout(window[timerName])
        }
        // Set timer to window object
        window[timerName] = timer

        const xhr2 = new XMLHttpRequest()
        xhr2.open('POST', feedbackApi + formName, true)

        xhr2.onload = function () { // request successful
            // we can use server response to our request now
            clearTimeout(window[timerName])
            formE.classList.remove('w3-disabled')
            document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }))
            console.log('response', xhr2.responseText)
            formE.reset()
        }

        xhr2.onerror = function () {
            clearTimeout(window[timerName])
            formE.classList.remove('w3-disabled')
            console.log('Error:', xhr2.status)
        }
        const formData = new FormData(formE)
        // add current url to form data
        formData.append('url', window.location.href)
        // add user language to form data
        formData.append('nav_lang', navigator.language)
        // get html lang property
        formData.append('locale', document.documentElement.lang)

        xhr2.send(formData)
        evnt.preventDefault()
    }

    // modify formE reset function to reset all fields and textareas w/o persistent attribute
    formE.reset = () => {
        console.log('formE.reset', formName)
        const inputs = formE.querySelectorAll('input:not([persistent]), textarea:not([persistent])')
        inputs.forEach(input => {
            input.value = ''
        })
    }

    formE.addEventListener("submit", submitNewPerson)
    submitE.addEventListener('click', submitNewPerson)
}

function openSearchResultFeedbackForm(evnt) {
    function findSearhResultParent(element) {
        if (element.classList.contains('search-result')) {
            return element
        }
        if (element.parentElement) {
            return findSearhResultParent(element.parentElement)
        }
        return null
    }

    const button = evnt.target
    const searchResultE = findSearhResultParent(button)
    const personName = searchResultE.querySelector('.search-result-name').innerHTML
    const code = searchResultE.id
    const descriptionE = get('searchResultFormDescription')
    descriptionE.innerHTML = descriptionE.innerHTML.replace('%s', personName)
    const formE = get('searchResultForm')
    formE.reset()
    formE.querySelector('input[name="code"]').value = code

    // For every input, search for matching field in search result
    // and copy value from search result to input
    const inputs = formE.querySelectorAll('input, textarea')
    inputs.forEach(input => {
        const name = input.name
        const valueE = searchResultE.querySelector(`#${name}`)
        if (valueE) {
            console.log('input', name, valueE)
            input.value = valueE.innerHTML || input.value
        }
    })
    // make form visible and set focus to first input
    get('searchResultFormRoot').style.display = 'block'
    // formE.querySelector('input[name="name"]').focus()
}
