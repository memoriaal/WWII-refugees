const getQueryStringValue = key => {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&")
    const match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"))
    return match && decodeURIComponent(match[1].replace(/\+/g, " "))
};

const query = getQueryStringValue('q')

// wait till page loaded, then fill in search field
window.addEventListener('load', function () {
    const search = document.getElementById('search')
    if (search) {
        search.value = query
    }
})