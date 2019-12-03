'use strict';

const Storage = {
    init: function () {
        const s = this.getScales();
        Object.entries(s).map( ([name,scale]) => {
            addScale(name, scale)
        });
    },

    getScales: function () {
        let s;
        try {
            s = JSON.parse(localStorage.getItem('scales'));
        } catch (err) {
            console.error(err)
        } finally {
            return s || {};
        }
    },

    saveScale: function() {
        const scaleName = $id('name-in').value,
              intervals = $id('intervals-in').value.trim().split(' ')
                            .map(n => parseInt(n)),
              scales = this.getScales();

        if (scaleName === '') {
            alert ('Enter a name');
            return;
        }
        if (intervals.length === 0) {
            alert ('Enter intervals');
            return;
        }
        scales[scaleName] = intervals;
        localStorage.setItem('scales', JSON.stringify(scales));

        addScale(scaleName, intervals);

        app_render();

        $id('scale').value = scaleName;
    },

    deleteScale: function () {
        const scaleName = $id('scale').value,
              scales = this.getScales();

        delete scales[scaleName];
        localStorage.setItem('scales', JSON.stringify(scales));

        $id('scale').value = 'major';
    }
};

Storage.init();

