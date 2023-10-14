// wait till page loaded, then fill in search field
window.addEventListener('load', function () {
    const qs = getQueryStringValue('q')
    const input = document.querySelector('input[name="q"]')
    if (qs) {
        input.value = qs
        performQuery(qs)
    }
    else {
        this.document.getElementById('intro').classList.remove('w3-hide')
    }   
})

var ecresults = {}


function performQuery(qs) {
    const qData = {
        query: {
            bool: {
                must: {
                    multi_match: {
                        query: qs,
                        fields: ['id', 'perenimi', 'eesnimi', 'id', 'pereseosed.kirje', 'kirjed.kirje'],
                        operator: 'and',
                        type: 'cross_fields',
                    },
                },
                filter: { term: { wwii: 1 } }
            },
        },
        sort: { 'eesnimi.raw': 'asc', 'perenimi.raw': 'asc' },
        _source: [
            'redirect',
            'isperson', 'kivi', 'emem', 'evo', 'wwii', 'evokirje',
            'perenimi', 'eesnimi', 'isanimi', 'emanimi', 'perenimed', 'eesnimed',
            'sünd', 'surm', 'sünnikoht', 'surmakoht', 'id',
            'kirjed.kirje', 'kirjed.kirjekood', 'kirjed.viide', 'kirjed.allikas', 'kirjed.allika_nimetus',
            'pereseosed.persoon', 'pereseosed.kirje',
            'pereseosed.seos', 'pereseosed.suund', 'pereseosed.kirjed',
            'tahvlikirje.kirjekood', 'tahvlikirje.kirje', 'tahvlikirje.tahvel', 'tahvlikirje.tulp', 'tahvlikirje.rida',
            'redirect'
        ],
    };

    var idQuery = (qs == Number(qs) && qs.length === 10)

    const xhr2 = new XMLHttpRequest();
    xhr2.open('POST', 'https://wwii-refugees.ee/.netlify/functions/search');
    xhr2.setRequestHeader('Content-Type', 'application/json');
    xhr2.onload = function () {
        if (xhr2.status === 200) {
            const data = JSON.parse(xhr2.responseText);
            ecresults = data;
            console.log(data.error || 'All green');
            const searchCount = document.querySelector('#search-count');
            searchCount.innerHTML = data.hits.total.value;
            const hits = data.hits.hits;
            if (idQuery && hits[0]._source.redirect) {
                window.location.href = '/?q=' + hits[0]._source.redirect;
            }
            const resultTemplateE = get('search-result-template')
            const searchResultsE = get('search-results')
            for (let i = 0; i < hits.length; i++) {
                const text = []
                const p = hits[i]._source
                searchResultsE.appendChild(fillTemplate(resultTemplateE.cloneNode(true), p))

                if (p.pereseosed && p.pereseosed.length > 0) {
                    text.push('<div class="pere"><label>Pereliikmed</label>');
                    for (let ip = 0; ip < p.pereseosed.length; ip++) {
                        let pereseos = p.pereseosed[ip].seos;
                        if (p.pereseosed[ip].suund === '-1') {
                            pereseos = '(' + pereseos + ')';
                        }
                        let perekirjed = p.pereseosed[ip].kirjed;
                        text.push('<li class="my-0 pereliige"><a href="?q=' + p.pereseosed[ip].persoon + '">' + p.pereseosed[ip].persoon + ' ' + pereseos + '</a>');
                        text.push(' : ' + p.pereseosed[ip].kirje);
                        text.push('<ul class="perekirjed folded">');
                        for (let ik = 0; ik < perekirjed.length; ik++) {
                            text.push('<li class="mb-1">');
                            text.push(perekirjed[ik].kirjekood + ': ' + perekirjed[ik].kirje);
                            text.push('</li>');
                        }
                        text.push('</ul>');
                        text.push('</li>');
                    }
                    text.push('</div>');
                }
                text.push('</div>');
                if (p.tahvlikirje && p.kivi) {
                    text.push('<div class="search-result-plaque col-12 col-sm-3">');
                    if (p.tahvlikirje.tahvel) {
                        text.push('<p class="mb-0">Tahvel Maarjamäel:</p>');
                        text.push('<p class="mb-2 plaque-info">' + p.tahvlikirje.tahvel + '</p>');
                    }
                    if (p.tahvlikirje.tulp) { text.push('<p class="mb-2">Tulp: ' + p.tahvlikirje.tulp + ' / Rida: ' + p.tahvlikirje.rida + '</p>'); }
                    if (p.tahvlikirje.kirje) {
                        text.push('<p class="mb-0">Nimi tahvlil: ' + p.tahvlikirje.kirje + '</p>');
                    }
                }
                if (p.evo === 1) {
                    text.push('<hr/><p class="mb-0">Nimi ohvitseride mälestusseinal: ' + p.evokirje + '</p>');
                }
                text.push('</div>');
                text.push('</div>');
                text.push('</div>');
                const searchResults = document.querySelector('#search-results');
                searchResults.innerHTML += text.join('');
            }
            const acc = document.getElementsByClassName('pereliige');
            console.log('Search results loaded', acc.length, acc);
            for (let i = 0; i < acc.length; i++) {
                console.log('classlist of last child', acc[i].lastChild.classList);
                acc[i].addEventListener("click", function () {
                    this.classList.toggle("active");
                    this.lastChild.classList.toggle('folded');
                });
            }
            document.getElementById("searchform").scrollIntoView()
            window.scrollBy(0,-100)
        } else {
            console.log('Error:', xhr2.status);
        }
    };
    xhr2.onerror = function () {
        console.log('Error:', xhr2.status);
    };
    xhr2.send(JSON.stringify(qData));
}

function fillTemplate(recordE, p) {
    recordE.style.display = ''
    recordE.id = p.id
    const personName = (p.eesnimi ? p.eesnimi : '') + ' ' + p.perenimi

    recordE.querySelector('.search-result-name').innerHTML = personName

    stripReplace('#result-born', p.sünd + (p.sünnikoht ? ' ' + p.sünnikoht : ''))
    stripReplace('#result-died', p.surm + (p.surmakoht ? ' ' + p.surmakoht : ''))
    stripReplace('#result-fathers-name', p.isanimi)
    stripReplace('#result-mothers-name', p.emanimi)

    const resultLinkE = recordE.querySelector('#resultId a')
    resultLinkE.innerHTML = p.id
    resultLinkE.href = './?q=' + p.id
    recordE.querySelector('#resultId').id = 'ID_' + p.id

    stripReplace('#searchResultFeedbackFormLink', personName, 'feedback_' + p.id)

    p.kirjed = p.kirjed || []
    console.log(7, p.kirjed)

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
        resultRecordE.querySelector('.record-text').innerHTML = pKirje.kirje
        resultRecordsE.appendChild(resultRecordE)
    }

    p.pereseosed = p.pereseosed || []
    if (p.pereseosed.length === 0) {
        recordE.querySelector('#resultFamily').remove()
    }
    for (let ip = 0; ip < p.pereseosed.length; ip++) {
        const pPereseos = p.pereseosed[ip]
        const pereseos = p.pereseosed[ip].seos
        if (pPereseos.suund === '-1') {
            pPereseos.seos = '(' + pereseos + ')'
        }
        const perekirjed = pPereseos.kirjed
    }
    // remove record template from DOM
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
const feedbackApi = `${feedbackBase}/${feedbackApiId}/exec?_form=newPersonForm`

function setupModals() {
    const modalClick = (evnt) => {
        console.log('modalClick', evnt)
        evnt.preventDefault()
        evnt.stopPropagation()
        evnt.stopImmediatePropagation()
        return false
    }
    const openModal = (evnt) => {
        console.log('openModal', evnt.target)
        evnt.target.style.display='block'
    }
    const closeModal = (evnet_or_element) => {
        if (!evnet_or_element) return
        const target = evnet_or_element.target || evnet_or_element
        // If target is not modal root, then call close modal on parent
        console.log('closeModal', {target, classList: target.classList})
        if (!target.classList) {
            console.log('closeModal no classList', target)
            return closeModal(target.parentElement)
        }
        if (!target.classList.contains('modal-root')) {
            console.log('closeModal not modal-root', target.classList)
            return closeModal(target.parentElement)
        }
        if (target.style.display === 'none')
            return
        console.log('closeModal', target)
        target.style.display='none'
    }

    const modalEs = queryAll('.modal-content')
    for (let i=0; i<modalEs.length; i++) {
        modalEs[i].addEventListener('click', modalClick)
    }

    const openModalEs = queryAll('.open-modal')
    for (let i=0; i<openModalEs.length; i++) {
        openModalEs[i].addEventListener('click', openModal)
    }
    const closeModalEs = queryAll('.close-modal')
    for (let i=0; i<closeModalEs.length; i++) {
        closeModalEs[i].addEventListener('click', closeModal)
    }
    
    const modalRootEs = queryAll('.modal-root')
    for (let i=0; i<modalRootEs.length; i++) {
        modalRootEs[i].addEventListener('click', closeModal)
    }

    document.onkeydown = function(evnt) {
        if (evnt.key === "Escape") {
            for (let i=0; i<modalRootEs.length; i++) {
                closeModal(modalRootEs[i])
            }
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
        console.log('submitFeedback', formName, evnt, validator.valid)
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
        xhr2.open('POST', feedbackApi, true)
        
        xhr2.onload = function() { // request successful
        // we can use server response to our request now
            clearTimeout(window[timerName])
            formE.classList.remove('w3-disabled')
            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))
            console.log('response', xhr2.responseText)
            formE.reset()
        }
      
        xhr2.onerror = function() {
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
