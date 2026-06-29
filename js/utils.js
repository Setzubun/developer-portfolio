export function initTypedHero(message) {
    const el = document.getElementById("typed-text");
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        el.textContent = message;
        return;
    }

    let i = 0;
    function type() {
        if (i <= message.length) {
            el.textContent = message.slice(0, i);
            i++;
            setTimeout(type, 90);
        }
    }
    type();
}