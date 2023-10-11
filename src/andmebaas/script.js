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
            for (let i = 0; i < hits.length; i++) {
                const text = [];
                const p = hits[i]._source;
                text.push('<div id="' + p.id + '" class="search-result w3-panel w3-round w3-padding">');
                text.push('<div class="search-result-name">' + (p.eesnimi ? p.eesnimi : '') + ' ' + p.perenimi + '</div>');
                text.push('<div class="w3-row">');
                text.push('<div class="w3-col l4">');
                if (p.sünd) {
                    text.push('<p class="mb-0">Sünd: ' + p.sünd);
                    if (p.sünnikoht) { text.push('<span> ' + p.sünnikoht + '</span>'); }
                    text.push('</p>');
                }
                if (p.surm) {
                    text.push('<p class="mb-0">Surm: ' + p.surm);
                    if (p.surmakoht) { text.push('<span> ' + p.surmakoht + '</span>'); }
                    text.push('</p>');
                }
                if (p.isanimi) { text.push('<p class="mb-0">Isanimi: ' + p.isanimi + '</p>'); }
                if (p.emanimi) { text.push('<p class="mb-0">Emanimi: ' + p.emanimi + '</p>'); }
                text.push('<p class="mb-0"><a href="./?q=' + p.id + '"># ' + p.id + '</a></p>');
                text.push('<p class="search-result-feedback mt-3" data-id="' + p.id + '" data-name="' + p.eesnimi + ' ' + p.perenimi + '">Tagasiside/Feedback</p>');
                text.push('</div>');
                text.push('<div class="w3-col l8 search-result-info">');
                p.kirjed = p.kirjed || [];
                for (let ik = 0; ik < p.kirjed.length; ik++) {
                    let a1 = a2 = '';
                    if (p.kirjed[ik].viide) {
                        a1 = '<a href="' + p.kirjed[ik].viide + '" target="_blank">';
                        a2 = '</a>';
                    }
                    text.push('<p class="mt-2 mb-0"><strong>' + a1 + p.kirjed[ik].allikas + a2 + ':</strong></p>');
                    if (p.kirjed[ik].kirje) { text.push('<p class="mb-1">'); }
                    if (p.kirjed[ik].kirje) { text.push(p.kirjed[ik].kirje); }
                    if (p.kirjed[ik].kirje) { text.push('</p>'); }
                }
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
                console.log(acc[i].lastChild.classList);
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


window.addEventListener('load', setupNewPersonForm)
// window.addEventListener('load', setupFeedbackForm)
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

    const formE = get('newPersonForm')
    const validator = new Validator(formE)
    const submitE = get('submitNewPersonButton')

    const submitNewPerson = (evnt) => {
        console.log('submitFeedback')
        formE.classList.add('w3-disabled')
        const xhr2 = new XMLHttpRequest()
        xhr2.open('POST', feedbackApi, true)
        // xhr2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        // multipart
        // xhr2.setRequestHeader('Content-Type', '
        

        
        xhr2.onload = function() { // request successful
        // we can use server response to our request now
            formE.classList.remove('w3-disabled')
            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))
            console.log('response', xhr2.responseText)
        }
      
        xhr2.onerror = function() {
            console.log('Error:', xhr2.status)
        };
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

    formE.addEventListener("submit", submitNewPerson)
    submitE.addEventListener('click', submitNewPerson)
}
