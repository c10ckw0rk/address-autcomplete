/* global google */

import Awesomplete from 'awesomplete';

class AutocompleteGoogle {

    constructor(options = {}) {

        this.options = options;
        this.service = new google.maps.places.AutocompleteService();
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        this.elements = {};
        this.fields = {
            streetNumber: true,
            streetName: true,
            suburb: true,
            state: true,
            postcode: true,
        };

        //configure plugin

        this.options.suburbsPlaceHolder = options.suburbsPlaceHolder || 'Please select';

        if (this.options.suburbs) {
            this.options.suburbs.unshift({
                label: this.options.suburbsPlaceHolder,
                value: null
            });
        }

        Object.assign(this.fields, this.options.fields);
        this.options.formShow = options.formShow || 'autocomplete';


        //create the forme elements

        this._generateElements();

        // create the form

        this.addressForm = this._generateElements();
        document.querySelector(this.options.parent).appendChild(this.addressForm);

        //get the indivual elements

        this.elements = {
            manualForm: this.addressForm.querySelector('[data-manual-form]'),
            autocompleteForm: this.addressForm.querySelector('[data-autocomplete-form]'),
            formToggle: this.addressForm.querySelector('[data-form-toggle]'),
            autoCompleteInput: this.addressForm.querySelector('[data-autocomplete-input]')
        };

        this.elements.inputs = this.addressForm.querySelectorAll('input, select');
        this.elements.manualInputs = this.addressForm.querySelectorAll('input, select');

        this.currentForm = this.options.formShow;
        this._addEvents();
        this._cleanForm();

    }

    _utils() {

        return {

            /**
            * Remove all special characters and spaces from a string
            * @param {string} string - The string to clean
            */

            cleanString(string) {
                string = string.toLowerCase();
                return string.replace(/[^A-Z0-9]/ig, '');
            },

            /**
            * Removes an element and returns it
            * @param {element} element - The element to remove
            */

            removeElement(element) {
                element.parentNode.removeChild(element);
                return element;
            },

            /**
            * Converts array like item to an array
            * @param {object} obj - The object to convert
            */

            toArray(obj) {

                const array = [];

                for (let i = 0; i < obj.length; i++) {
                    array[i] = obj[i];
                }

                return array;
            },

            /**
            * Delegates an event to a child element
            * @param {string} parent - A css selector of the parent element
            * @param {string} target - A css selector of the target element
            * @param {string} type - The type of event
            * @param {function} code - The function to execute if a target is clicked
            */

            delegate(parent, target, type, code) {

                document.querySelector(parent).addEventListener(type, e => {

                    const targets = this.toArray(document.querySelectorAll(target));

                    if (targets.indexOf(e.target) > -1) {
                        if (code) code(e);
                    }

                }, type === 'blur' || type === 'focus');

            },

            /**
            * Delegates an event to a child element
            * @param {element} element - The element whose ancestor you want.
            * @param {string} ancestor - A css selector of the ancestor element you want to target
            */

            getAncestor(element, ancestor) {

                let current = element;
                let chosen = null;

                while (current.parentNode.constructor !== document.constructor || chosen === null) {
                    current = current.parentNode;

                    if (current.matches(ancestor)) {
                        chosen = current;
                    }

                }

                return chosen;
            }

        };

    }

    get currentForm() {
        return this.options.formShow;
    }

    set currentForm(val) {

        if (val === 'autocomplete' || val === 'manual') {

            this.options.formShow = val;

            if (val === 'autocomplete') {
                this.elements.manualForm.style.display = 'none';
                this.elements.autocompleteForm.style.display = 'block';
            } else {
                this.elements.manualForm.style.display = 'block';
                this.elements.autocompleteForm.style.display = 'none';
            }

        } else {
            console.warn('currentForm can only be set to "autocomplete" or "manual"');
        }

    }

    cleanUp() {

        if (this.addressForm) {
            this.addressForm.parentNode.removeChild(this.addressForm);
        } else {
            console.warn('Nothing in page to clean up');
        }

    }

    validate(element) {

        this.isValid = true;

        const clsToggle = (ele, condition) => {

            ele = this._utils().getAncestor(ele, '.input-wrapper');

            //add class to input field
            if (condition) {
                ele.classList.remove('go');
                ele.classList.add('stop');
            } else {
                ele.classList.remove('stop');
                ele.classList.add('go');
            }

        };

        const validator = (item) => {

            const valid = !(this.result[item] === null || this.result[item] === '' || this.result[item] === 'null');
            const input = document.querySelector(`[data-google-places-key="${item}"]`);
            clsToggle(input, !valid);

            return valid;

        };

        if (this.currentForm === 'autocomplete') {

            this.isValid = this.placeChosen === null;
            clsToggle(this.elements.autoCompleteInput, this.isValid);

        } else if (element) {

            const key = element.getAttribute('data-google-places-key');
            validator(key);

        } else if (this.currentForm === 'manual') {

            const isValid = Object.keys(this.result).map(item => {
                return validator(item);
            });

            if (isValid.indexOf(false) !== -1) {
                this.isValid = false;
            }

        }

        return this.isValid;

    }

    _cleanForm() {
        this.result = {};
        this.isValid = null;
        this.placeChosen = null;

        if (this.currentForm === 'manual') {

            this.elements.manualInputs.forEach(item => {
                item.value = '';
                item.setAttribute('value', '');
                this.result[item.getAttribute('data-google-places-key')] = null;
            });

            if (this.options.suburbs) {
                this.result.locality = this.options.suburbs[0].value;
            }
        }

    }

    _getResult(input, onResult) {

        this.service.getPlacePredictions({
            input: input,
            componentRestrictions: {country: 'au'},
            types: ['address']
        }, (predictions, status) => {

            if (status === google.maps.places.PlacesServiceStatus.OK || status !== 'ZERO_RESULTS') {
                onResult(predictions);
            }

        });

    }

    _generateElements() {

        const getSuburbInput = () => {

            let suburbInput;

            if (this.options.suburbs) {

                suburbInput = '<select data-google-places-key="locality" id="autocomplete-suburb" name="autocomplete-suburb">';

                this.options.suburbs.forEach(item => {
                    suburbInput += `<option value="${item.value}">${item.label}</option>`;
                });

                suburbInput += '</select>';

            } else {

                suburbInput = '<input type="text" placeholder="Field name" data-google-places-key="locality" id="autocomplete-suburb" name="autocomplete-suburb"/></span>';

            }

            return suburbInput;

        };

        const streetNumber = {
            true: `<div>
                    <label class="autocomplete-label" for="autocomplete-google"></label>
                    <div class="input-wrapper">
                        <span>
                        <input type="text" placeholder="Street Number" data-google-places-key="street_number" id="autocomplete-street-number" name="autocomplete-street-number"/></span>
                         <p class="label-text">Please enter a street number.</p>
                     </div>
                </div>`,
            false: ''
        };

        const streetName = {
            true: `<div>
                <label class="autocomplete-label" for="autocomplete_street-name"></label>
                <div class="input-wrapper">
                    <span><input type="text" placeholder="Street Name" data-google-places-key="route" id="autocomplete-street-name" name="autocomplete-street-name"/></span>
                     <p class="label-text">Please enter a street name.</p>
                 </div>
            </div>`,
            false: ''
        };

        const suburb = {
            true: `<div>
                <label class="autocomplete-label" for="autocomplete_suburb"></label>
                <div class="input-wrapper">
                    <span>${getSuburbInput()}</span>
                    <p class="label-text">Please choose a suburb</p>
                </div>
            </div>`,
            false: ''
        };

        const state = {
            true: `<div>
                <label class="autocomplete-label" for="autocomplete_state"></label>
                <div class="input-wrapper">
                    <span><select placeholder="State" data-google-places-key="administrative_area_level_1" id="autocomplete-state" name="autocomplete-state"/></span>
                    <p class="label-text">Please choose a state</p>
                </div>
            </div>`,
            false: ''
        };

        const postcode = {
            true: `<div>
                    <label class="autocomplete-label" for="autocomplete_postcode"></label>
                    <div class="input-wrapper">
                        <span><input type="number" placeholder="Post code" data-google-places-key="postal_code" id="autocomplete-postcode" name="autocomplete-postcode"/></span>
                        <p class="label-text">Postcode</p>
                    </div>
                </div>
            </div>`,
            false: ''
        };

        const parser = new DOMParser();

        const string = `
            <div class="autocomplete-wrapper" data-autocomplete-wrapper>
                <div class="autocomplete-form" data-autocomplete-form>
                    <label class="autocomplete-label" for="autocomplete_google"></label>
                    <div class="input-wrapper">
                        <span><input type="text" placeholder="Field name" data-autocomplete-input id="autocomplete-google" name="autocomplete-google"/></span>
                         <p class="label-text"></p>
                     </div>
                     <p><a href="#" data-form-toggle>Can't find address</a></p>
                </div>
                <div class="manual-form" data-manual-form>
                    ${streetNumber[this.fields.streetNumber]}
                    ${streetName[this.fields.streetName]}
                    ${suburb[this.fields.suburb]}
                    ${state[this.fields.state]}
                    ${postcode[this.fields.postcode]}
                </div>
            </div>`;

        return parser.parseFromString(string, 'text/html').querySelector('.autocomplete-wrapper');

    }

    _addEvents() {

        this.awesomplete = new Awesomplete(this.elements.autoCompleteInput, {
            replace(item) {
                this.input.value = item.label.replace('<br>', ' ');
            }
        });

        const switchForms = e => {
            e.preventDefault();
            this._cleanForm();
            if (this.currentForm === 'autocomplete') this.currentForm = 'manual';
            else if (this.currentForm === 'manual') this.currentForm = 'autocomplete';
        };


        const resetResult = () => {
            this.result = {};
            this.placeChosen = true;
            this.elements.autoCompleteInput.removeEventListener('keyup', resetResult);
        };

        const getDropDownResults = e => {

            const checkKeyCode = (keycode) => {
                return [keycode === 13, keycode === 27, keycode === 38, keycode === 40].indexOf(true) === -1;
            };

            if (checkKeyCode(e.keyCode)) {

                const inputValue = this.elements.autoCompleteInput.value;

                const splitAt = (index, it) => {
                    return [it.slice(0, index), it.slice(index).replace(', ', '').replace(', Australia', '')];
                };

                if (inputValue) {
                    this._getResult(inputValue, result => {

                        this._cleanForm();
                        this.awesomplete.list = result.map(item => {

                            const formattedResult = splitAt(item.description.indexOf(','), item.description);
                            return {value: item.place_id, label: formattedResult[0] + '<br>' + formattedResult[1]};

                        });

                        if (typeof this.options.resultsUpdated === 'function') {
                            this.options.resultsUpdated(this.awesomplete.list);
                        }

                    });
                }

            }

        };

        const chooseResult = e => {

            this.placesService.getDetails({placeId: e.text.value}, (place, status) => {

                if (status === 'OK') {

                    this.result = {};
                    this.placeChosen = true;
                    place.address_components.forEach(item => {
                        this.result[item.types[0]] = item.short_name;
                    });

                } else {
                    throw new Error('Place service request returned error: ' + status);
                }

                //callback
                if (typeof this.options.placeSelected === 'function') {
                    this.options.placeSelected(this.result);
                }

            });

        };

        const updateManualInput = e => {
            const key = e.target.getAttribute('data-google-places-key');
            this.result[key] = e.target.value;
        };

        const validate = e => {
            this.validate(e.target);
        };

        this.elements.formToggle.addEventListener('click', switchForms);
        this.elements.autoCompleteInput.addEventListener('keyup', resetResult);
        this.elements.autoCompleteInput.addEventListener('keyup', getDropDownResults);

        this._utils().delegate('[data-autocomplete-wrapper]', 'input, select', 'blur', validate);
        this._utils().delegate('[data-manual-form]', 'input, select', 'keyup', updateManualInput);

        document.addEventListener('awesomplete-selectcomplete', chooseResult);

    }

}

export default AutocompleteGoogle;
