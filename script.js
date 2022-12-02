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
        $('#db-feedback-v2-id').val(id)
        $('#db-feedback-v2-persoon').val(id)
        $('#db-feedback-v2-url').val('http://wwii-refugees.ee/#' + id)
        $('#db-feedback-v2-name').val(name)
        $('#db-feedback-v2-title').html('Tagasiside %name% kohta'.replace('%name%', name))
        $('#db-feedback-v2-title, #db-feedback-v2-text, #db-feedback-v2').removeClass('d-none')
        $('#db-feedback-v2-success').addClass('d-none')
        $('#popup-background, #popup-content').removeClass('d-none')
    })

    $('#db-feedback-v2').submit(function (event) {
        event.preventDefault()
        var $form = $(this)
        $.post($form.attr('action'), $form.serialize(), function (data) {
            // console.log(data)
            $('#db-feedback-v2-title, #db-feedback-v2-text, #db-feedback-v2').addClass('d-none')
            $('#db-feedback-v2-success').removeClass('d-none')
            $('#db-feedback-v2 input, #db-feedback-v2 textarea').val('')
            $('#db-feedback-v2-title').html('')
            setTimeout(function () {
                $('#popup-background, #popup-content').addClass('d-none')
            }, 4e3)
        })
    })

    $('#db-feedback-v2-cancel').click(function (e) {
        e.preventDefault()
        $('#db-feedback-v2 input, #db-feedback-v2 textarea').val('')
        $('#db-feedback-v2-title').html('')
        $('#popup-background, #popup-content, #popup-question').addClass('d-none')
    })

})

