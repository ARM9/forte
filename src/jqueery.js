'use strict';

function $(e,c) {
    return (c||document).querySelector(e);
}

function $id(e,c) {
    return (c||document).getElementById(e);
}

function $create(t) {
    return document.createElement(t);
}

function capitalize(s) {
    let t = s[0].toUpperCase() + s.slice(1);
    return t;
}

