// Extracted avatar configuration.
window.GBL_AVATAR_PARTS = (function(){
var AV_SKIN = ['#f0c9a8', '#e0ac86', '#c68a63', '#a2683f', '#77492b', '#4e2f1c'];
            var AV_HAIRC = ['#1b1714', '#3f2a1d', '#77461f', '#b9863a', '#d9d2cb', '#6d4bd8', '#8f2f2f', '#2f5f8f'];

            /* [city label, primary, secondary] -- secondary is the collar and shoulder
   trim, which is what makes a two-colour kit read as that team's. */
            var AV_JERSEY = [['Plain black', '#2b3440', '#e2e6ea'], ['Plain white', '#e2e6ea', '#2b3440'], /* NBA */
            ['Atlanta', '#e03a3e', '#c1d32f'], ['Boston', '#007a33', '#ba9653'], ['Brooklyn', '#111111', '#ffffff'], ['Charlotte', '#1d1160', '#00788c'], ['Chicago', '#ce1141', '#111111'], ['Cleveland', '#860038', '#fdbb30'], ['Dallas', '#00538c', '#b8c4ca'], ['Denver', '#0e2240', '#fec524'], ['Detroit', '#c8102e', '#1d42ba'], ['Golden State', '#1d428a', '#ffc72c'], ['Houston', '#ce1141', '#c4ced4'], ['Indiana', '#002d62', '#fdbb30'], ['Los Angeles · red & blue', '#c8102e', '#1d428a'], ['Los Angeles · purple & gold', '#552583', '#fdb927'], ['Memphis', '#5d76a9', '#12173f'], ['Miami', '#98002e', '#f9a01b'], ['Milwaukee', '#00471b', '#eee1c6'], ['Minnesota', '#0c2340', '#236192'], ['New Orleans', '#0c2340', '#c8102e'], ['New York · blue & orange', '#006bb6', '#f58426'], ['Oklahoma City', '#007ac1', '#ef3b24'], ['Orlando', '#0077c0', '#c4ced4'], ['Philadelphia', '#006bb6', '#ed174c'], ['Phoenix · purple & orange', '#1d1160', '#e56020'], ['Portland', '#e03a3e', '#111111'], ['Sacramento', '#5a2d81', '#63727a'], ['San Antonio', '#c4ced4', '#111111'], ['Toronto', '#ce1141', '#111111'], ['Utah', '#002b5c', '#f9a01b'], ['Washington · navy & red', '#002b5c', '#e31837'], /* WNBA */
            ['Atlanta · W', '#c8102e', '#418fde'], ['Chicago · W', '#418fde', '#ffcd00'], ['Connecticut · W', '#f5593f', '#0a2240'], ['Dallas · W', '#c4d600', '#002855'], ['Golden State · W', '#6c3fa0', '#111111'], ['Indiana · W', '#e03a3e', '#002d62'], ['Las Vegas · W', '#a7a8aa', '#111111'], ['Los Angeles · W', '#552583', '#fdb927'], ['Minnesota · W', '#0c2340', '#78be21'], ['New York · W', '#86cbc6', '#111111'], ['Phoenix · W', '#201747', '#e56020'], ['Seattle · W', '#2c5234', '#fee11a'], ['Washington · W', '#0c2340', '#e03a3e']];

            var AV_BG = ['#12303f', '#2a2140', '#143024', '#3a2418', '#31182a', '#1b2a45', '#2e2e33', '#0f3b3a'];

            var AV_NHAIR = 12
              , AV_NFACE = 4
              , AV_NACC = 4
              , AV_NBODY = 2;

            var AV_LAYERS = [{
                key: 'body',
                n: AV_NBODY,
                label: 'Build'
            }, {
                key: 'skin',
                n: AV_SKIN.length,
                label: 'Skin'
            }, {
                key: 'hair',
                n: AV_NHAIR,
                label: 'Hair'
            }, {
                key: 'hairc',
                n: AV_HAIRC.length,
                label: 'Hair color'
            }, {
                key: 'face',
                n: AV_NFACE,
                label: 'Facial hair'
            }, {
                key: 'acc',
                n: AV_NACC,
                label: 'Accessory'
            }, {
                key: 'jersey',
                n: AV_JERSEY.length,
                label: 'Jersey',
                list: AV_JERSEY
            }, {
                key: 'bg',
                n: AV_BG.length,
                label: 'Background'
            }];

            
return { AV_SKIN: AV_SKIN, AV_HAIRC: AV_HAIRC, AV_JERSEY: AV_JERSEY, AV_BG: AV_BG, AV_NHAIR: AV_NHAIR, AV_NFACE: AV_NFACE, AV_NACC: AV_NACC, AV_NBODY: AV_NBODY, AV_LAYERS: AV_LAYERS };
})();
