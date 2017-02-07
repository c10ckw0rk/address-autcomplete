/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */
/* global it, describe, expect, beforeEach, $, Cookies, FeatureFlagons, beforeAll, afterEach */

import simulant from 'simulant';
import AutoComplete from '../src/address-autcomplete.js';

const openDropDown = () => {

    const formInput = window.AC.elements.autoCompleteInput;
    formInput.focus();
    formInput.setAttribute('value', '12');
    simulant.fire(formInput, 'keyup');

};

describe('Google custom autocomplete dropdown', () => {

    beforeEach(() => {

        window.AC = new AutoComplete({
            parent: 'body',
            suburbs: [{
                label: 'Sydney NSW 2000',
                value: '2342243'
            }, {
                label: 'Ryde NSW 2000',
                value: '123654'
            }],
            fields: {
                state: false,
                postcode: false
            }
        });

    });

    afterEach(() => {
        window.AC.cleanUp();
    });

    it('It returns results from google.', done => {

        window.AC._getResult('41', (result) => {
            expect(result.length).toBeGreaterThan(0);
            done();
        });

    }, 10000);

    it('It creates dom elements from a string', () => {
        expect(window.AC._generateElements().getAttribute('class')).toEqual('autocomplete-wrapper');
    });

    it('It creates an input field in the page', () => {
        const eleCon = document.querySelector('.autocomplete-wrapper').constructor;
        const compEleCon = document.createElement('div').constructor;
        expect(eleCon).toEqual(compEleCon);
    });

    it('It is showing the autocomplete form', () => {
        expect(window.AC.elements.manualForm.style.display === 'none' && window.AC.elements.autocompleteForm.style.display === 'block').toEqual(true);
    });

    it('It is showing the manual completion form', () => {
        window.AC.currentForm = 'manual';
        expect(window.AC.elements.manualForm.style.display === 'block' && window.AC.elements.autocompleteForm.style.display === 'none').toEqual(true);
    });

    it('Clicking cant find address changes form view', done => {

        const eles = window.AC.elements;
        const clickable = document.querySelector('[data-form-toggle]');
        const e = new Event('click');

        const test = [
            eles.manualForm.style.display === 'none' && eles.autocompleteForm.style.display === 'block'
        ];

        clickable.addEventListener('click', () => {
            test.push(eles.manualForm.style.display === 'block' && eles.autocompleteForm.style.display === 'none');
            expect(test.toString()).toEqual([true, true].toString());
            done();
        });

        clickable.dispatchEvent(e);

    }, 5000);


    // it('it shows results on key input', done => {

    //     openDropDown();

    //     console.log('here');

    //     window.AC.options.resultsUpdated = () => {

    //         console.log('here 2');

    //         expect(document.querySelector('.awesomplete ul').children.length).toBe(1);
    //         done();

    //     };

    // }, 1000);

    // it('A result is exposed once chosen from dropdown', done => {

    //     window.AC.options.placeSelected = () => {

    //         const result = Object.keys(window.AC.result).map((item) => {
    //             return window.AC.result[item] !== undefined;
    //         });

    //         expect(result.indexOf(false) === -1 && result.length > 0).toBe(true);
    //         done();

    //     };


    //     window.AC.options.resultsUpdated = () => {

    //         const ele = document.querySelector('.awesomplete ul');
    //         const eleChild = ele.children[0];
    //         simulant.fire(eleChild, 'mousedown', {relatedTarget: ele});

    //     };

    //     openDropDown();

    // }, 5000);


    it('adds the stop class when invalid', () => {

        window.AC.validate();

        const manualForm = document.querySelector('[data-manual-form]');

        const inputs = Array.from(manualForm.querySelector('input, select')).map(item => {
            return item.classList.contains('stop');
        });

        expect(inputs.indexOf(false)).toBe(-1);

    });

    it('Shows error on null value', () => {

        // const result = Object.keys(window.AC.result).map((item) => {
        //     return window.AC.result[item] !== undefined;
        // });

        // expect(result.indexOf(false)).toBe(-1);

    });

});
