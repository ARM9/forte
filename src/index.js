'use strict';

const notes_sharp = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
      notes_flat = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'],
      notes = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'],
      circle_of_fifths = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
    // ['Cb','Gb','Db','Ab','Eb','Bb','F','C','G','D','A','E','B','F#','C#'];

const app = $('#root');

function isValidNote(note) {
    return note.match(/[A-Ga-g](#*|b*)/);
}

function intervalToNote (root, interval, flats = false) {
    root = capitalize(root);
    let notes = (flats ? notes_flat : notes_sharp),
        start = notes.indexOf(root);
    if (start < 0) {
        start = notes.indexOf(getEnharmonicEquivalent(root));
        if (start < 0) {
            throw new Error (`Invalid root note ${root}, flats: ${flats}`);
        }
    }

    const i = (start + interval) % notes.length;
    return notes[i];
}

function intervalsToNotes (root, intervals, flats = false) {
    if (root && intervals)
    return intervals.map(i => intervalToNote(root, i, flats));
}

function getEnharmonicEquivalent(note) {
    let sharp_index = notes_sharp.indexOf(note);
    if (sharp_index > -1)
        return notes_flat[sharp_index];

    let flat_index = notes_flat.indexOf(note);
    if (flat_index > -1)
        return notes_sharp[flat_index];
    throw new Error(`Invalid note ${note}`);
}

function getFretCount() {
    return $id('frets').value||24;
}

function getFretWidth(f) {
    //`${1100/(i+15)}px`;
    //let n = getFretCount(),
        //r = (n-f)/f;
    //return f > 0 ? `${}` : '3%';
    return f > 0 ? `${100/(f+15)}%` : `3%`;
}

class String {
    constructor (open_note) {
        this.open_note = open_note;
    }

    getNote(fret, flats = false) {
        return intervalToNote(this.open_note, fret, flats);
    }

    render ({highlights}) {
        this.el = $create('div');
        this.el.classList.add('string');

        for (let i = 0, n = getFretCount(); i <= n; i++) {
            let f = $create('span'),
                note = this.getNote(i, $id('flats').checked);
            f.classList.add('note');

            f.style.width = getFretWidth(i);

            if (i > 0 && Number.isInteger(i / 12)) {
                f.classList.add('inlay');
            }


            if (highlights && highlights.length > 0) {
                let hi = highlights.indexOf(note);
                if(hi > -1) {
                    f.innerHTML = `${note}`;
                    if (hi === 0)
                        f.classList.add('root');
                    else
                        f.classList.add('highlight');
                } else {
                    if ($id('show-all-notes').checked)
                        f.innerHTML = `${note}`;
                    else
                        f.innerHTML = `-`;
                }
            } else {
                f.innerHTML = `${note}`;
            }
            this.el.appendChild(f);
        }
        return this.el;
    }
}

class Fretboard {
    constructor (strings) {
        this.strings = strings.map(n => new String(n));
    }

    setScale (root, intervals) {
        this.scale = {root, intervals};
        return this;
    }

    getScale () {
        return intervalsToNotes(this.scale.root, this.scale.intervals, $id('flats').checked);
    }

    render () {
        this.el = $create('div');

        this.strings.map(string => {
            this.el.prepend(string.render({highlights: this.getScale()}));
        })

        let fretnumbers_div = $create('div');
        fretnumbers_div.classList.add('fretnumbers');

        for (let i = 0, n = getFretCount(); i <= n; i++) {
            let f = $create('span');
            f.classList.add('fretnr');
            if ([1,3,5,7,9,12,15,17,19,21,24,27,29,31].indexOf(i) >= 0)
                f.innerHTML = `${i}`;

            f.style.width = getFretWidth(i);

            if (i > 0 && Number.isInteger(i / 12)) {
                f.classList.add('inlay');
            }
            fretnumbers_div.appendChild(f);
        }
        this.el.appendChild(fretnumbers_div);
        return this.el;
    }
}

function getTuning () {
    let notes = $id('tuning').value.trim().split(/\s+/);
    for (let i = 0; i < notes.length; i++) {
        if (!isValidNote(notes[i]))
            throw new Error(`Invalid note in tuning: ${notes[i]}`);
    }
    return notes;
}

function render_fretboard({note, scale, tuning} = {}) {
    let frets = new Fretboard(tuning || getTuning());
    note = note || $id('note').value;
    scale = scale || scales_chords[$id('scale').value.trim()];

    try {
    if (!isValidNote(note))
        throw new Error(`Invalid note ${note}`);

    let notes = intervalsToNotes(note, scale, $id('flats').checked);
    $id('notes-display').textContent = notes ? notes.join(' ') : '';

    frets.setScale(note, scale);
    app.innerHTML = "";
    app.appendChild(frets.render());
    } catch(err) {
        alert(err);
    }
}

function app_render() {
    // scale/chord select box
    let sel = $id('scale'),
        scale_names = Object.keys(scales_default),
        chord_names = Object.keys(chords_default)

    sel.innerHTML = ''
    let grp = $create('optgroup');
    grp.label = '--- Scales ---';
    sel.appendChild(grp);
    scale_names.map(s => {
        let opt = $create('option');
        opt.textContent = s;
        opt.value = s;
        sel.appendChild(opt);
    });

    grp = $create('optgroup');
    grp.label = '--- Chords ---';
    sel.appendChild(grp);

    chord_names.map(s => {
        let opt = $create('option');
        opt.textContent = s;
        opt.value = s;
        sel.appendChild(opt);
    });

    sel.selectedIndex = 1;

    let random_scale_btn = $id('random-scale');

    random_scale_btn.onclick = function(e) {
        $id('note').value = notes[(Math.random()*notes.length)|0];
        $id('scale').selectedIndex = (Math.random()*$id('scale').length)|0;
        this.form.submit();
    };
    updateForm();
}

function updateForm() {
    let query = new URLSearchParams(location.search.slice(1)),
        fields = ['note','scale','tuning','frets','name-in','intervals-in','show-custom','tuning']

    fields.map(n => {
        if (query.get(n))
            $id(n).value = query.get(n);
    });
    let flats = query.get('flats');
    $id('flats').checked = flats;
    let showall = query.get('show-all-notes');
    $id('show-all-notes').checked = showall;

    let scale;
    if (query.get('intervals-in') && query.get('show-custom') == 'true') {
        $id('intervals-in').value = query.get('intervals-in');

        scale = $id('intervals-in').value.trim().split(' ')
                            .map(n => parseInt(n));
    } 
    render_fretboard({scale});
}

function clearCustomScale () {
    $id("name-in").value = "";
    $id("intervals-in").value = "";
}
function showCustom () {
    return $id("show-custom").value;
}
function setShowCustom (b) {
    $id("show-custom").value = b;
}

app_render();

