# Address Autocomplete

`npm install address-autcomplete`

## Features

  - A standard google autocomplete
  - A manual form for when they cant find the autocomplet
  - Lots of configuration :-)

## Basic usage

```html


    <!DOCTYPE html>
    <html>

    <head>
        <title>Autocomplete Js Google</title>
        <script src="http://maps.googleapis.com/maps/api/js?key={your google key}&libraries=places"></script> <!-- Include your  -->
        <script src="/scripts/address-autcomplete.js"></script>
        <link rel="stylesheet" type="text/css" href="basic.css">
    </head>

    <body>
        <div class="autocomplete-container"></div>
    </body>
    </html>

```


```javascript
import AutoComplete from 'address-autcomplete';

const addressAutcomplete = new AutoComplete({
    parent: '.autocomplete-container', // The container to fill
    formShow: 'manual', // Inital form to show
    suburbs: [{ // Suburbs to show in manual form dropdown
        label: 'Sydney NSW 2000',
        value: '2342243'
    }, {
        label: 'Ryde NSW 2000',
        value: '123654'
    }],
    fields: { // disable certain fields in the manual form
        streetNumber: true,
        streetName: true,
        suburb: true,
        state: false,
        postcode: false
    },
    content: { // Content for the form
        formToggle: "Can't find your address?",
        streetNumber: {
            error: 'Please enter a street number.',
            label: 'Street Number',
            placeholder: 'Street Number'
        },
        streetName: {
            error: 'Please enter a street name.',
            label: 'Street Name',
            placeholder: 'Street Name'
        },
        suburb: {
            error: 'Please choose a suburb.',
            label: 'Suburb',
            placeholder: 'Suburb'
        },
        state: {
            error: 'Please enter a state.',
            label: 'State',
            placeholder: 'State'
        },
        postcode: {
            error: 'Please enter a postcode.',
            label: 'Postcode',
            placeholder: 'Postcode'
        },
        autocompleteGoogle: {
            error: 'Please select an option from the dropdown.',
            label: 'Address',
            placeholder: 'Address'
        }
    }
});
```


