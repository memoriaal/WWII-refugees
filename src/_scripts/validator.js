// Validator class
//
// Usage:
//
// const formE = document.getElementById('newPersonForm')
// const validator = new Validator(formE)
//
// <form class="w3-modal-content modal-content" id="newPersonForm" method="POST">
//     <label>Eesnimi</label><input id="forename" type="text" name="forename" />
//     <label>Perekonnanimi</label><input id="surname" type="text" name="surname" />
//     <label>Sünniaeg</label><input id="birthdate" type="date" name="birthdate" />
//     <label>Sinu nimi</label><input id="contactName" type="text" name="contactName" />
//     <label>Sinu e-posti aadress</label><input id="contactEmail" type="email" name="contactEmail" required="" validator="email" />
//     <button id="submitNewPersonButton" type="submit">Saada</button>
// </form>
//
// Validates form fields on the fly and prevents form submission if any field is invalid

class Validator {
    constructor(formE) {
        this.formE = formE
        this.inputs = this.formE.querySelectorAll('input[validator]')
        this.valid = false
        this.setup()
    }
    setup() {
        this.inputs.forEach(input => {
            input.addEventListener('input', this.validate.bind(this))
        })
        this.formE.addEventListener('submit', this.validate.bind(this))
    }
    validate(evnt) {
        console.log('validate', evnt)
        this.valid = true
        this.inputs.forEach(input => {
            this.validateInput(input)
        })
        if (!this.valid) {
            evnt.preventDefault()
        }
    }
    validateInput(input) {
        const validator = input.getAttribute('validator')
        if (validator === 'email') {
            this.validateEmail(input)
        }
        else if (validator === 'required') {
            this.validateRequired(input)
        }
    }
    validateEmail(input) {
        const emailRe = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
        const value = input.value
        const valid = emailRe.test(value)
        this.setValidity(input, valid)
    }
    validateRequired(input) {
        const value = input.value
        const valid = value.length > 0
        this.setValidity(input, valid)
    }
    setValidity(input, valid) {
        if (valid) {
            input.classList.remove('wwii-invalid')
        }
        else {
            input.classList.add('wwii-invalid')
            this.valid = false
        }
    }
}
