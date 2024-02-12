// wait till page loaded, then fill in search field

window.addEventListener('load', function () {
    const qs = getQueryStringValue('q')
    const input = document.querySelector('input[name="q"]')
    if (qs && input) {
        input.value = qs
    }

    ENTUQuery(qs, showResults)
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


async function ENTUQuery(qs, callback) {
    // regex match if query consists of exactly 10 numbers
    const idQuery = /^\d{10}$/.test(qs)
    console.log({qs, idQuery})
    
    try {
        const response = await fetch('/.netlify/functions/searchE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: qs
        })
        const json = await response.json()
        console.log({json})
        callback(json)
    } catch (error) {
        console.error('Error:', error);
    }
}

function showResults(data) {
    // const data = JSON.parse(xhr2.responseText);
    const {hits, entities} = data
    console.log(data.error || 'All green', { count: hits, entities: entities.map(e => e.person) })
    const searchCountE = document.querySelector('#search-count')
    if(hits.count) {
        searchCountE.innerHTML = "Leitud tulemuste arv: " + hits.count;
    }
    const idQuery = /^\d{10}$/.test(data.qs)
    if (idQuery && hits.count==1 && entities[0].redirect) {
        window.location.href = '/?q=' + entities[0].redirect
    }
    const resultTemplateE = get('search-result-template')
    const searchResultsE = get('search-results')
    for (let i = 0; i < hits.count; i++) {
        const text = []
        const p = entities[i]
        fbFormData[p.persoon] = {
            id: p.persoon,
            name: p.eesnimi + ' ' + p.perenimi
        }
        searchResultsE.appendChild(fillTemplate(resultTemplateE.cloneNode(true), p))

        if (p.evo) {
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
    console.log('fillTemplate', p)
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
