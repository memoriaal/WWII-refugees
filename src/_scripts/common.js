const get = document.getElementById.bind(document)
const query = document.querySelector.bind(document)
const queryAll = document.querySelectorAll.bind(document)

// Example usage: select elements with IDs starting with 'element'
// const regexPattern = /^element/
// const matchedElements = selectElementsByRegex(regexPattern)
const selectElementsByRegex = (pattern, root = document) => {
    const allElements = root.querySelectorAll('*')
    const matchingElements = []

    // Iterate through all elements and filter based on the regex pattern
    allElements.forEach(element => {
        if (element.id && element.id.match(pattern)) {
            matchingElements.push(element)
        }
    })

    return matchingElements
}

const replaceLinebreaks = (text) => {
    const replaced = text.replace(/(\\n\\r|\\n|\\r)+/g, '<br/>')
    return replaced
}
