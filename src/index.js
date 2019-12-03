'use strict';

const inlays = [0,3,5,7,9,12,15,17,19,21,24,27,29,31];

const app = $id('app');

let query = new URLSearchParams(location.search.slice(1));

function isValidNote(note) {
    return note ? note.match(/[A-Ga-g](#*|b*)/) : false;
}

function intervalToNote (root, interval, flats = false) {
    root = capitalize(root);
    let notes = (flats ? Notes_flat : Notes_sharp),
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
    let sharp_index = Notes_sharp.indexOf(note);
    if (sharp_index > -1)
        return Notes_flat[sharp_index];

    let flat_index = Notes_flat.indexOf(note);
    if (flat_index > -1)
        return Notes_sharp[flat_index];
    throw new Error(`Invalid note ${note}`);
}

function getFretCount() {
    return parseInt($id('frets').value)||24;
}

const lerp = (a,b,t) => a*(1-t) + b*t;

function getFretWidth(f) {
    const n = parseInt(getFretCount());

    if (document.documentElement.clientWidth >= 1024)
        return f > 0 ? `${(98/n)+lerp(1.6,-1.6,f/n)}%` : `3%`;
    else
        return `${100/(n+1)}%`;
    //return f > 0 ? `${100/(f+15)}%` : `3%`;
}

class NoteHighlight {
    constructor (note) {
        this.note = note;
    }

    render ({classList = '', empty = false} = {}) {
        this.el = $create('div');
        if (!empty) {
            this.el.classList.add('note');
            this.el.innerHTML = `${this.note}`;
        } else {
            this.el.innerHTML = '&nbsp;';
        } 

        if (classList) {
            this.el.classList.add(classList);
        }
        return this.el;
    }
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
            f.classList.add('fret');

            f.style.width = getFretWidth(i);

            if (inlays.indexOf(i) >= 0) f.classList.add('inlay');
            //if (Number.isInteger(i / 12)) f.classList.add('inlay');

            if (highlights && highlights.length > 0) {
                let hi = highlights.indexOf(note);
                let noteEl = new NoteHighlight(note);
                if(hi > -1) {
                    if (hi === 0)
                        f.appendChild(noteEl.render({classList: 'root'}));
                    else
                        f.appendChild(noteEl.render({classList: 'highlight'}));
                } else {
                    if ($id('show-all-notes').checked)
                        f.appendChild(noteEl.render());
                    else
                        f.appendChild(noteEl.render({empty: true}));
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
            if (inlays.indexOf(i) >= 0)
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

function render_fretboard ({note, scale, tuning} = {}) {
    note = note || $id('note').value;
    scale = scale || scales_chords[$id('scale').value.trim()];

    try {
        let fretboard = new Fretboard(tuning || getTuning());

        if (!isValidNote(note))
            throw new Error(`Invalid note ${note}`);

        let notes = intervalsToNotes(note, scale, $id('flats').checked);
        $id('notes-display').textContent = notes ? notes.join(' ') : '';

        fretboard.setScale(note, scale);
        app.innerHTML = "";
        app.appendChild(fretboard.render());
    } catch(err) {
        console.error(err)
        alert(err);
    }
}

function app_render () {
    scale_view();
    //let view = query.get('view');

    //$id('view').value = view;

    //switch (true) {
        //case view === 'scale_finder':
            //scale_finder_view();
            //break;
        //case view === 'scales':
        //default:
            //scale_view();
            //break;
    //}
}

function scale_view () {
    // scale/chord select box
    let sel = $id('scale'),
        scale_names = Object.keys(scales_default),
        chord_names = Object.keys(chords_default)

    $id('scales-view').hidden = false;
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
        $id('note').value = Notes[(Math.random()*Notes.length)|0];
        $id('scale').selectedIndex = (Math.random()*$id('scale').length)|0;
        this.form.submit();
    };
    updateForm();

    let scale;
    if (query.get('intervals-in') && query.get('show-custom') == 'true') {
        scale = $id('intervals-in').value.trim().split(' ')
                            .map(n => parseInt(n));
    } 
    render_fretboard({scale});
}

function updateForm () {
    //let query = new URLSearchParams(location.search.slice(1)),
    let fields = ['note','scale','tuning','frets','name-in','intervals-in','show-custom','tuning']

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
}

function updateRootNote (note) {
    if (note.length > 1) {
        const last = note.substr(-1);
        if (last === 'b') {
            $id('flats').checked = true;
        } else if (last === '#') {
            $id('flats').checked = false;
        }
    }
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

