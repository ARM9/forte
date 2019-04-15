'use strict';

const scales_default = {
    'EMPTY': [],
    'major': [0,2,4,5,7,9,11],
    'minor': [0,2,3,5,7,8,10],

    'ionian':       [0,2,4,5,7,9,11],
    'dorian':       [0,2,3,5,7,9,10],
    'phrygian':     [0,1,3,5,7,8,10],
    'lydian':       [0,2,4,6,7,9,11],
    'mixolydian':   [0,2,4,5,7,9,10],
    'aeolian':      [0,2,3,5,7,8,10],
    'locrian':      [0,1,3,5,6,8,10],

    'major pentatonic': [0,2,4,7,9],
    'minor pentatonic': [0,3,5,7,10],
    'minor blues': [0,3,5,6,7,10],

    'melodic minor':  [0,2,3,5,7,9,11],

    'altered':          [0,1,3,4,6,8,10],
        //'ionian #1':        [1,2,4,5,7,9,11],
    'dorian #7':        [0,2,3,5,7,9,11],
    'phrygian #6':      [0,1,3,5,7,9,10],
    'lydian #5':        [0,2,4,6,8,9,11],
    'mixolydian #4':    [0,2,4,6,7,9,10],
    'aeolian #3':       [0,2,4,5,7,8,10],
    'locrian #2':       [0,2,3,5,6,8,10],

    'harmonic minor':   [0,2,3,5,7,8,11],
        'aeolian #7':       [0,2,3,5,7,8,11],
    'locrian #6':       [0,1,3,5,6,9,10],
    'ionian #5':        [0,2,4,5,8,9,11],
    'dorian #4':        [0,2,3,6,7,9,10],
    'phrygian #3':      [0,1,4,5,7,8,10],
    'lydian #2':        [0,3,4,6,7,9,11],
    'ultralocrian':     [0,1,3,4,6,8,9],
        //'mixolydian #1':    [1,2,4,5,7,9,10],

    'harmonic major': [0,2,4,5,7,8,11],

    'double harmonic major': [0,1,4,5,7,8,11],
    'hungarian minor': [0,2,3,6,7,8,11],

    'neapolitan major': [0,1,3,5,7,9,11],
    'neapolitan minor': [0,1,3,5,7,8,11],

    'weirdo beirdo minor': [0,2,3,6,7,8,10],

    'simhen': [0,2,3,6,7,8,11],

    'whole tone': [0,2,4,6,8,10],
    'w/h diminished': [0,2,3,5,6,8,9,11],
    'messiaen mode 1 (whole tone)': [0,2,4,6,8,10],
    'messiaen mode 2 (h/w diminished)': [0,1,3,4,6,7,9,10],
    'messiaen mode 3': [0,2,3,4,6,7,8,10,11],
    'messiaen mode 4': [0,1,2,5,6,7,8,11],
    'messiaen mode 5': [0,1,5,6,7,11],
    'messiaen mode 6': [0,2,4,5,6,8,10,11],
    'messiaen mode 7': [0,1,2,3,5,6,7,8,9,11]
},
    chords_default = {
    'Maj': [0,4,7],
    'Maj7': [0,4,7,11],
    'Maj9': [0,4,7,11,14],
    'Maj7#11': [0,4,7,11,18],
    'Maj9#11': [0,4,7,11,14,18],
    'Maj13': [0,4,7,11,14,18,21],
    'Maj6': [0,4,7,9],
    'Maj69': [0,4,7,9,14],

    'm': [0,3,7],
    'm7': [0,3,7,10],
    'm9': [0,3,7,10,14],
    'm11': [0,3,7,10,14,17],
    'm13': [0,3,7,10,14,17,21],
    'm6': [0,3,7,9],
    'm69': [0,3,7,9,14],

    'm7b5': [0,3,6,10],

    'dom7': [0,4,7,10],
    'dom9': [0,4,7,10,14],

    'aug': [0,4,8],
    'aug7': [0,4,8,10],

    'dim': [0,3,6],
    'dim7': [0,3,6,9]
},
    scales_chords = {};

Object.assign(scales_chords, scales_default, chords_default);

const reverse_scales_chords = Object.entries(scales_chords).reduce((obj,[k,v],i) => {
    obj[v] = k; return obj;
},{});

function addScale(name, intervals) {
    scales_default[name] = intervals;
    scales_chords[name] = intervals;
    reverse_scales_chords[intervals] = name;
}

function removeScale(name) {
    const intervals = scales_chords[name];
    delete scales_chords[name];
    delete reverse_scales_chords[intervals];
}

