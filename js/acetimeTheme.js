window.acetimeTheme = {
    get: function () {
        return localStorage.getItem("acetime-theme") || "light";
    },

    set: function (theme) {
        const normalized = theme === "dark" || theme === "system" ? theme : "light";
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dark = normalized === "dark" || (normalized === "system" && prefersDark);

        document.body.classList.toggle("ac-dark", dark);
        localStorage.setItem("acetime-theme", normalized);
    }
};

window.acetimeStorage = {
    get: function (key) { return localStorage.getItem(key); },
    set: function (key, value) { localStorage.setItem(key, value); },
    remove: function (key) { localStorage.removeItem(key); }
};
