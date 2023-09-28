toggleAccordeon = (e) => {
    const accordeon = e.nextSibling
    console.log(accordeon)
    accordeon.classList.toggle("w3-hide")
    e.classList.toggle("w3-hide")
}