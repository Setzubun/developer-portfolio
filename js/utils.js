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

export function sortValue(project) {
    if (project.current || project.status === "In Progress") return Infinity;
    const ref = project.endDate || project.startDate;
    if (!ref) return -Infinity;
    const [y, m] = ref.split("-").map(Number);
    return y * 12 + (m || 0);
}

export function sortByRecency(projects) {
    return [...projects].sort((a, b) => sortValue(b) - sortValue(a));
}

export function formatMonth(yyyyMm) {
    if (!yyyyMm) return "";
    const [y, m] = yyyyMm.split("-").map(Number);
    return new Date(y, (m || 1) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function dateLabel(project) {
    const start = formatMonth(project.startDate);
    const end = project.current || project.status === "In Progress" ? "Present" : formatMonth(project.endDate);
    if (start && end) return `${start} – ${end}`;
    return start || end || "";
}