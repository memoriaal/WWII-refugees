// if location url contains query string "?q=...",
// then redirect to database page with query string

const mqs = location.search.match(new RegExp("[?&]q=([^&]+)(&|$)"))
if (mqs) {
    console.log(mqs)
    window.location.href = '/otsing/' + mqs[0]
}