console.log("public.js loaded");

function handleSeeMore(button) {

    console.log("See more clicked");

    const title = button.getAttribute("data-title");
    const description = button.getAttribute("data-description");
    const image = button.getAttribute("data-image");

    const overlay = document.getElementById("product-modal-overlay");

    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalImage = document.getElementById("modal-image");

    modalTitle.innerText = title;
    modalDescription.innerText = description;
    modalImage.src = image;

    overlay.classList.add("open");

    document.body.style.overflow = "hidden";
}

function closeProductModal() {

    const overlay = document.getElementById("product-modal-overlay");

    overlay.classList.remove("open");

    document.body.style.overflow = "auto";
}

document.addEventListener("click", function (e) {

    const overlay = document.getElementById("product-modal-overlay");

    if (e.target === overlay) {
        closeProductModal();
    }
});

document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){
        closeProductModal();
    }

});