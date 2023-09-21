const getQueryStringValue = key => {
    console.log(`->getQueryStringValue(${key})`)
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&")
    let match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"))
    return match && decodeURIComponent(match[1].replace(/\+/g, " "))
}
