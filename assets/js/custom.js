var header = document.getElementById("header");
var sticky = header ? header.offsetTop : 0;
window.onscroll = function() { myFunction() };

function myFunction() {
    if (!header) return;
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
        var debug = {
            path: path,
            isViPath: isViPath,
            currentLang: currentLang,
            pref: pref
        };

        // Respect stored preference
        if (pref === 'en' || pref === 'vi') {
            if (pref !== currentLang) {
                var file = path.replace(/^\//, '');
                if (isViPath) file = file.replace(/^vi\//, '');
                if (!file || file === '') {
                    file = 'index.html';
                }
                var target = pref === 'vi' ? ('/vi/' + file) : ('/' + file);
                debug.redirectTarget = target;
                window.__mediaxLangDebug = debug;
                window.location.replace(target + window.location.search + window.location.hash);
            }
            window.__mediaxLangDebug = debug;
            return;
        }

        // No preference yet: only auto-redirect from English pages
        if (!isViPath) {
            var lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
            var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
            var langLower = (lang || '').toLowerCase();
            var isVi = langLower.startsWith('vi') || langLower.indexOf('vi-') !== -1 || tz === 'Asia/Ho_Chi_Minh' || tz === 'Asia/Saigon';
            debug.lang = lang;
            debug.tz = tz;
            debug.isVi = isVi;
            if (isVi) {
                var file2 = path.replace(/^\//, '');
                if (!file2 || file2 === '') {
                    file2 = 'index.html';
                }
                try { localStorage.setItem(PREF_KEY, 'vi'); } catch (e) {}
                debug.redirectTarget = '/vi/' + file2;
                window.__mediaxLangDebug = debug;
                window.location.replace('/vi/' + file2 + window.location.search + window.location.hash);
            }
        }
        window.__mediaxLangDebug = debug;
    } catch (e) {}
})();

// Mobile header dropdown toggle (Products)
(function () {
    var dropdownItems = document.querySelectorAll('.header .nav-item-dropdown');
    if (!dropdownItems.length) return;

    var mql = window.matchMedia('(max-width: 991px)');
    var isMobile = function () { return mql.matches; };

    var setOpen = function (item, open) {
        if (!item) return;
        item.classList.toggle('is-open', open);
        var link = item.querySelector('.nav-link');
        if (link) {
            link.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    };

    var closeAll = function (except) {
        dropdownItems.forEach(function (item) {
            if (item !== except) setOpen(item, false);
        });
    };

    dropdownItems.forEach(function (item, index) {
        var link = item.querySelector('.nav-link');
        var panel = item.querySelector('.nav-dropdown');
        if (!link || !panel) return;

        if (!panel.id) {
            panel.id = 'nav-dropdown-panel-' + (index + 1);
        }
        link.setAttribute('aria-controls', panel.id);
        link.setAttribute('aria-expanded', 'false');

        link.addEventListener('click', function (e) {
            if (!isMobile()) return;
            e.preventDefault();
            var isOpen = item.classList.contains('is-open');
            if (!isOpen) closeAll(item);
            setOpen(item, !isOpen);
        });
    });

    document.addEventListener('click', function (e) {
        if (!isMobile()) return;
        var target = e.target;
        if (!target || !target.closest) return;
        if (!target.closest('.nav-item-dropdown')) {
            closeAll();
        }
    });

    var collapse = document.getElementById('navbar-header');
    if (collapse && collapse.addEventListener) {
        collapse.addEventListener('hidden.bs.collapse', function () {
            closeAll();
        });
    }

    if (mql.addEventListener) {
        mql.addEventListener('change', function (e) {
            if (!e.matches) closeAll();
        });
    } else if (mql.addListener) {
        mql.addListener(function (e) {
            if (!e.matches) closeAll();
        });
    }
})();
