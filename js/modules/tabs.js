export function initTabs(tabList) {
    if (!tabList) return;
    const tabBtns = tabList.querySelectorAll('.tab-btn');

    tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Deactivate all
            tabBtns.forEach(function (b) {
                b.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.tab-panel').forEach(function (panel) {
                panel.setAttribute('aria-hidden', 'true');
            });
            // Activate clicked
            btn.setAttribute('aria-selected', 'true');
            const panelId = btn.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) panel.setAttribute('aria-hidden', 'false');
        });

        // Keyboard navigation
        btn.addEventListener('keydown', function (e) {
            const btnsArray = Array.from(tabBtns);
            const idx = btnsArray.indexOf(btn);
            let next;
            if (e.key === 'ArrowRight') {
                next = btnsArray[(idx + 1) % btnsArray.length];
            } else if (e.key === 'ArrowLeft') {
                next = btnsArray[(idx - 1 + btnsArray.length) % btnsArray.length];
            } else if (e.key === 'Home') {
                next = btnsArray[0];
            } else if (e.key === 'End') {
                next = btnsArray[btnsArray.length - 1];
            }
            if (next) {
                e.preventDefault();
                next.click();
                next.focus();
            }
        });
    });
}
