'use strict';

/*function find_matching_scales(notes) {
    notes.sort 
}

fret on click {
    add note to notes list
    results = find matching scales
    update scales list with results
}*/

function render_scale_finder () {
    let frets = new Fretboard(getTuning()),
        notes = query.get('notes').trim().split(' ');

    console.log(notes)
    try {
        if (notes.every(isValidNote)) {
            
        }
        $id('notes-display').textContent = notes ? notes.join(' ') : '';

        //frets.setScale(note, scale);
        app.innerHTML = "";
        app.appendChild(frets.render());
    } catch(err) {
        console.error(err)
        alert(err);
    }
}

function scale_finder_view () {
    $id('scale-finder-view').hidden = false;

    updateForm();

    //query.get('');
    render_scale_finder();
}

