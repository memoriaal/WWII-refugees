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
        $('#feedback-v2-id').val(id)
        $('#feedback-v2-persoon').val(id)
        $('#feedback-v2-url').val('http://wwii-refugees.ee/#' + id)
        $('#feedback-v2-name').val(name)
        $('#feedback-v2-title').html('Tagasiside %name% kohta'.replace('%name%', name))
        $('#feedback-v2-title, #feedback-v2-text, #feedback-v2').removeClass('d-none')
        $('#feedback-v2-success').addClass('d-none')
        $('#popup-background, #popup-content').removeClass('d-none')
    })

    $('#feedback-v2').submit(function (event) {
        event.preventDefault()
        var $form = $(this)
        $.post($form.attr('action'), $form.serialize(), function (data) {
            // console.log(data)
            $('#feedback-v2-title, #feedback-v2-text, #feedback-v2').addClass('d-none')
            $('#feedback-v2-success').removeClass('d-none')
            $('#feedback-v2 input, #feedback-v2 textarea').val('')
            $('#feedback-v2-title').html('')
            setTimeout(function () {
                $('#popup-background, #popup-content').addClass('d-none')
            }, 4e3)
        })
    })

    $('#feedback-v2-cancel').click(function (e) {
        e.preventDefault()
        $('#feedback-v2 input, #feedback-v2 textarea').val('')
        $('#feedback-v2-title').html('')
        $('#popup-background, #popup-content, #popup-question').addClass('d-none')
    })

})

