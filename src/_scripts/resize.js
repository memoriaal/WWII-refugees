function windowResized() {
    var navigationImg = document.querySelectorAll('#navigation img');
    var navigationP = document.querySelectorAll('#navigation p');
    var navTitle = document.querySelectorAll('.nav-title');
    var textText = document.getElementById('text-text');
    var textSearch = document.getElementById('text-search');
    var text = document.getElementById('text');
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;

    navigationImg.forEach(function (img) {
        img.classList.add('d-none');
    });
    navigationP.forEach(function (p) {
        p.classList.add('d-none');
    });

    if (windowWidth > 1200) {
        if (windowHeight > 800) {
            navigationP.forEach(function (p) {
                p.classList.remove('d-none');
            });
            navigationImg.forEach(function (img) {
                img.classList.remove('d-none');
            });
        } else if (windowHeight > 600) {
            navigationImg.forEach(function (img) {
                img.classList.remove('d-none');
            });
        }
    } else {
        if (windowHeight > 1200) {
            navigationP.forEach(function (p) {
                p.classList.remove('d-none');
            });
            navigationImg.forEach(function (img) {
                img.classList.remove('d-none');
            });
        } else if (windowHeight > 800) {
            navigationImg.forEach(function (img) {
                img.classList.remove('d-none');
            });
        }
    }

    if (windowWidth < 768) {
        document.getElementById('navigation').classList.remove('fixed-bottom');
        if (text) {
            text.classList.remove('desktop');
            text.style.height = '';
        }
    } else {
        document.getElementById('navigation').classList.add('fixed-bottom');
        if (text) {
            text.classList.add('desktop');
            text.style.height = (windowHeight - document.getElementById('navigation').offsetHeight) + 'px';
        }
    }

    if (windowWidth < 576) {
        navTitle.forEach(function (title) {
            title.style.height = '';
        });
    } else {
        var tallest = 0;
        navTitle.forEach(function (title) {
            title.style.height = '';
            var eleHeight = title.offsetHeight;
            tallest = eleHeight > tallest ? eleHeight : tallest;
        });
        navTitle.forEach(function (title) {
            title.style.height = tallest + 'px';
        });
    }

    if (textText) {
        textText.style.height = '';
        if (textText.offsetHeight < textSearch.offsetHeight) {
            textText.style.height = textSearch.offsetHeight + 'px';
        }
    }
}

window.addEventListener('load', function () {
    windowResized();
});

var doit;
window.addEventListener('resize', function () {
    clearTimeout(doit);
    doit = setTimeout(windowResized, 100);
});

window.addEventListener('scroll', function () {
    const toResize = {
        logo: document.getElementById('logo'),
        navigation: document.getElementById('navigation'),
    }
    // Resize all elements that need to be resized
    Object.keys(toResize).forEach(key => {
        const element = toResize[key]
        if (element) {
            if (window.scrollY > 0) {
                element.classList.add('scrolled')
            } else {
                element.classList.remove('scrolled')
            }
        }
    })
})

console.log('resize loaded successfully')