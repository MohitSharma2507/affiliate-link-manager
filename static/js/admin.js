/* =========================================================
   AffiliateHub Admin Panel JavaScript
========================================================= */

/* ─── Modal Functions ───────────────────────────────── */
function openModal(id) {

    const modal = document.getElementById(id);

    modal.classList.add("open");

    document.body.classList.add("modal-open");
}

function closeModal(id) {

    const modal = document.getElementById(id);

    modal.classList.remove("open");

    document.body.classList.remove("modal-open");
}

function closeModalIfOverlay(event, id) {
    if (event.target.id === id) {
        closeModal(id);
    }
}

/* ─── Affiliate Links ───────────────────────────────── */

function addLinkRow() {
    const container = document.getElementById("links-container");

    if (!container) return;

    const row = document.createElement("div");

    row.className = "link-row";

    row.innerHTML = `
        <input 
            type="text" 
            name="link_label[]" 
            placeholder="Label (e.g. Amazon)"
        />

        <input 
            type="url" 
            name="link_url[]" 
            placeholder="https://affiliate-link.com"
        />

        <button 
            type="button" 
            class="remove-link" 
            onclick="removeLink(this)"
        >
            ✕
        </button>
    `;

    container.appendChild(row);

    // Smooth animation
    row.style.opacity = "0";
    row.style.transform = "translateY(10px)";

    setTimeout(() => {
        row.style.transition = "all 0.25s ease";
        row.style.opacity = "1";
        row.style.transform = "translateY(0)";
    }, 10);
}

function removeLink(button) {
    const row = button.parentElement;

    // Prevent removing last row
    const allRows = document.querySelectorAll(".link-row");

    if (allRows.length === 1) {
        row.querySelectorAll("input").forEach(input => {
            input.value = "";
        });

        return;
    }

    row.style.opacity = "0";
    row.style.transform = "translateX(20px)";

    setTimeout(() => {
        row.remove();
    }, 200);
}

/* ─── Delete Confirmation ───────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    const deleteForms = document.querySelectorAll(
        'form[action*="/delete"]'
    );

    deleteForms.forEach(form => {

        form.addEventListener("submit", function (e) {

            const confirmed = confirm(
                "Are you sure you want to delete this product?"
            );

            if (!confirmed) {
                e.preventDefault();
            }
        });

    });

});

/* ─── File Upload Preview ───────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    const imageInputs = document.querySelectorAll(
        'input[type="file"][name="image"]'
    );

    imageInputs.forEach(input => {

        input.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            // Validate size
            const maxSize = 5 * 1024 * 1024;

            if (file.size > maxSize) {
                alert("Image size must be under 5MB");
                this.value = "";
                return;
            }

            // Validate type
            const allowed = [
                "image/png",
                "image/jpeg",
                "image/webp",
                "image/gif"
            ];

            if (!allowed.includes(file.type)) {
                alert("Invalid image format");
                this.value = "";
                return;
            }

        });

    });

});

/* ─── Auto Hide Alerts ──────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    const alerts = document.querySelectorAll(".alert");

    alerts.forEach(alert => {

        setTimeout(() => {

            alert.style.transition = "all 0.4s ease";
            alert.style.opacity = "0";
            alert.style.transform = "translateY(-10px)";

            setTimeout(() => {
                alert.remove();
            }, 400);

        }, 3500);

    });

});

/* ─── Keyboard Shortcuts ────────────────────────────── */

document.addEventListener("keydown", (e) => {

    // ESC closes modals
    if (e.key === "Escape") {

        const modals = document.querySelectorAll(".modal-overlay.open");

        modals.forEach(modal => {
            modal.classList.remove("open");
        });

        document.body.style.overflow = "auto";
    }

});

/* ─── Product Card Hover Effects ────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".admin-product-card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-4px)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
        });

    });

});

/* ─── Loading State for Forms ───────────────────────── */

document.addEventListener("DOMContentLoaded", () => {

    const forms = document.querySelectorAll("form");

    forms.forEach(form => {

        form.addEventListener("submit", () => {

            const submitBtn = form.querySelector(
                'button[type="submit"]'
            );

            if (!submitBtn) return;

            submitBtn.disabled = true;

            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = "Saving...";

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 4000);

        });

    });

});

/* ─── Smooth Page Fade In ───────────────────────────── */

window.addEventListener("load", () => {

    document.body.style.opacity = "1";

});

/* Initial fade state */
document.body.style.opacity = "0";
document.body.style.transition = "opacity 0.35s ease";
/* =====================================
   MOBILE SIDEBAR
===================================== */

function toggleSidebar() {

    const sidebar = document.getElementById("sidebar");

    const overlay = document.getElementById("sidebar-overlay");

    sidebar.classList.toggle("sidebar-open");

    overlay.classList.toggle("overlay-show");
}

function closeSidebar() {

    const sidebar = document.getElementById("sidebar");

    const overlay = document.getElementById("sidebar-overlay");

    sidebar.classList.remove("sidebar-open");

    overlay.classList.remove("overlay-show");
}/* =====================================
   MOBILE SIDEBAR
===================================== */

function toggleSidebar() {

    const sidebar = document.getElementById("sidebar");

    const overlay = document.getElementById("sidebar-overlay");

    sidebar.classList.toggle("sidebar-open");

    overlay.classList.toggle("overlay-show");
}

function closeSidebar() {

    const sidebar = document.getElementById("sidebar");

    const overlay = document.getElementById("sidebar-overlay");

    sidebar.classList.remove("sidebar-open");

    overlay.classList.remove("overlay-show");
}

/* =====================================
   DELETE MODAL
===================================== */

let deleteForm = null;

function openDeleteModal(form) {

    deleteForm = form;

    document
        .getElementById("delete-modal")
        .classList.add("show");
}

function closeDeleteModal() {

    deleteForm = null;

    document
        .getElementById("delete-modal")
        .classList.remove("show");
}


/* CONFIRM DELETE */
document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", function () {

        if (deleteForm) {

            deleteForm.submit();
        }
    });
/* =========================================================
   End
========================================================= */
