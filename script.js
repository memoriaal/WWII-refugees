$(function () {
    $('#popup-close, #popup-background').click(function () {
        $('#popup-background, #popup-content, #popup-question').addClass('d-none')
    })

    $('#new-refugee-feedback').on('click', function () {
        $('#db-question-success').addClass('d-none')
        $('#popup-background, #popup-question').removeClass('d-none')
    })

    $('#new-refugee-feedback').submit(function (event) {
        event.preventDefault()
        var $form = $(this)
        $.post($form.attr('action'), $form.serialize(), function (data) {
            console.log(data)
            $('#new-refugee-feedback-title, #new-refugee-feedback-text, #new-refugee-feedback').addClass('d-none')
            $('#new-refugee-feedback-success').removeClass('d-none')
            $('#new-refugee-feedback input, #new-refugee-feedback textarea').val('')
            $('#new-refugee-feedback-title').html('')
            setTimeout(function () {
                $('#popup-background, #popup-question').addClass('d-none')
            }, 4e3)
        })
    })

    $('#new-refugee-feedback-cancel').click(function (e) {
        e.preventDefault()
        $('#new-refugee-feedback input, #new-refugee-feedback textarea').val('')
        $('#new-refugee-feedback-title').html('')
        $('#popup-background, #popup-question').addClass('d-none')
    })

    $('#search-results').on('click', '.search-result-feedback', function () {
        var id = $(this).data('id')
        var name = $(this).data('name')
        $('#db-feedback-id').val(id)
        $('#db-feedback-url').val('http://wwii-refugees.ee/?q=' + id)
        $('#db-feedback-name').val(name)
        $('#db-feedback-title').html('Tagasiside %name% kohta'.replace('%name%', name))
        $('#db-feedback-title, #db-feedback-text, #db-feedback').removeClass('d-none')
        $('#db-feedback-success').addClass('d-none')
        $('#popup-background, #popup-content').removeClass('d-none')
    })

    $('#db-feedback').submit(function (event) {
        event.preventDefault()
        var $form = $(this)
        $.post($form.attr('action'), $form.serialize(), function (data) {
            console.log(data)
            $('#db-feedback-title, #db-feedback-text, #db-feedback').addClass('d-none')
            $('#db-feedback-success').removeClass('d-none')
            $('#db-feedback input, #db-feedback textarea').val('')
            $('#db-feedback-title').html('')
            setTimeout(function () {
                $('#popup-background, #popup-content').addClass('d-none')
            }, 4e3)
        })
    })

    $('#db-feedback-cancel').click(function (e) {
        e.preventDefault()
        $('#db-feedback input, #db-feedback textarea').val('')
        $('#db-feedback-title').html('')
        $('#popup-background, #popup-content, #popup-question').addClass('d-none')
    })

})

function init_accordeon(class_name) {
    var acc = document.getElementsByClassName(class_name)
    console.log('DOM loaded', acc)
    var i
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            console.log(this.lastChild.classList)
            this.classList.toggle("active")
            this.lastChild.classList.toggle('folded')
        })
    }
}
init_accordeon('pereliige')
