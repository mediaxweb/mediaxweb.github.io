window.onscroll = function() { myFunction() };

var header = document.getElementById("header");
var sticky = header.offsetTop;

function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky-header");
    } else {
        header.classList.remove("sticky-header");
    }
}
// swap-page
var transactionSettingClicked = document.querySelector("#transaction__setting-icon");
var transactionSettingShow = document.querySelector("#transaction__setting-description");

if (transactionSettingClicked) {
    transactionSettingClicked.addEventListener("click", () => {
        transactionSettingShow.classList.toggle("active");
    });
}

// Language preference + redirect
(function () {
    try {
        var PREF_KEY = 'mediax_lang';
        var path = window.location.pathname || '';
        var isViPath = path.indexOf('/vi/') === 0;
        var currentLang = isViPath ? 'vi' : 'en';

        // Capture manual selection
        var switchLinks = document.querySelectorAll('.lang-switcher a');
        if (switchLinks && switchLinks.length) {
            switchLinks.forEach(function (link) {
                var lang = link.getAttribute('data-lang');
                var img = link.querySelector('img.lang-flag');
                if (img && img.getAttribute('src')) {
                    var src = img.getAttribute('src');
                    if (src.indexOf('flag-vn') !== -1) lang = 'vi';
                    if (src.indexOf('flag-us') !== -1) lang = 'en';
                }
                if (!lang) {
                    lang = link.getAttribute('href') && link.getAttribute('href').indexOf('/vi/') !== -1 ? 'vi' : 'en';
                }
                link.setAttribute('data-lang', lang);
                link.addEventListener('click', function () {
                    try { localStorage.setItem(PREF_KEY, lang); } catch (e) {}
                });
            });
        }

        var pref = null;
        try { pref = localStorage.getItem(PREF_KEY); } catch (e) {}

        // Respect stored preference
        if (pref === 'en' || pref === 'vi') {
            if (pref !== currentLang) {
                var file = path.replace(/^\\//, '');
                if (isViPath) file = file.replace(/^vi\\//, '');
                if (!file || file === '') {
                    file = 'index.html';
                }
                var target = pref === 'vi' ? ('/vi/' + file) : ('/' + file);
                window.location.replace(target + window.location.search + window.location.hash);
            }
            return;
        }

        // No preference yet: only auto-redirect from English pages
        if (!isViPath) {
            var lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
            var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
            var langLower = (lang || '').toLowerCase();
            var isVi = langLower.startsWith('vi') || langLower.indexOf('vi-') !== -1 || tz === 'Asia/Ho_Chi_Minh' || tz === 'Asia/Saigon';
            if (isVi) {
                var file2 = path.replace(/^\\//, '');
                if (!file2 || file2 === '') {
                    file2 = 'index.html';
                }
                window.location.replace('/vi/' + file2 + window.location.search + window.location.hash);
            }
        }
    } catch (e) {}
})();
