const title = document.getElementById("titulo");
const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("productos");
const carrito = document.getElementById("listaCarrito");
const modalDetail = document.getElementById("modal-detail");

let webColor = "#c6c7ff";

// creo una variable global para luego llenarla con los valores que traiga del back
let products = [];

// traigo los productos del backend

const fetchProducts = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/products", { method: "GET" });
    products = await response.json(); 
    renderProducts(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// llamamos a la función para traer los productos
window.onload = () => {
  fetchProducts();
};

document.getElementById("searchButton").addEventListener("click", () => {
  const text = searchInput.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(text)
  );
  renderProducts(filteredProducts);
});

searchInput.addEventListener("input", () => {
  const text = searchInput.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(text)
  );
  renderProducts(filteredProducts);
});

document.querySelectorAll(".dropdown-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const sortType = item.getAttribute("data-sort");
    let sortedProducts = [...products];
    if (sortType === "price-asc")
      sortedProducts.sort((a, b) => a.price - b.price);
    else if (sortType === "price-desc")
      sortedProducts.sort((a, b) => b.price - a.price);
    renderProducts(sortedProducts);
  });
});

document.querySelectorAll(".item-categoria").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const category = item.getAttribute("data-sort");
    const filteredProducts =
      category === "Todas"
        ? products
        : products.filter((product) => product.category === category);
    renderProducts(filteredProducts);
  });
});

function openDetailModal(product) {
  product.stopPropagation();

  modalDetail.classList.add("is-active");
  const productDetail = products.find((p) => p.name === product.target.id);

  modalDetail.querySelector(".modal-card-title").textContent =
    productDetail.name;
  document.getElementById("modal-image").src = productDetail.image;
  document.getElementById("modal-description").textContent =
    productDetail.description;
  document.getElementById(
    "modal-price"
  ).textContent = `${productDetail.price} USD`;
}

function renderProducts(products) {
  cardsContainer.innerHTML =
    products.length === 0
      ? `<div class="notification has-text-centered"><p class="title is-4">No se encontraron productos</p></div>`
      : products.map((product) => renderCard(product)).join("");
  attachDragEvents();

  document.querySelectorAll(".product").forEach(($product) => {
    $product.addEventListener("click", openDetailModal);
  });
}

function attachDragEvents() {
  document.querySelectorAll(".product").forEach((product) => {
    product.addEventListener("dragstart", drag);
  });
}

function allowDrop(event) {
  event.preventDefault();
}

document.getElementById("carrito").addEventListener("dragover", allowDrop);
document.getElementById("carrito").addEventListener("drop", drop);

const categorias = [
  "Accesorios",
  "Periféricos",
  "Audio",
  "Pantallas",
  "Almacenamiento",
  "Wearables",
];

const productCategorySelect = document.getElementById("productCategory");

categorias.forEach((categoria) => {
  const option = document.createElement("option");
  option.value = categoria;
  option.textContent = categoria;
  productCategorySelect.appendChild(option);
});

document.addEventListener("DOMContentLoaded", () => {
  function openModal($el) {
    $el.classList.add("is-active");
  }

  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  document.querySelectorAll(".js-modal-trigger").forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      openModal($target);
    });
  });

  document
    .querySelectorAll(".modal-background, .delete, .modal-card-foot .button")
    .forEach(($close) => {
      const $target = $close.closest(".modal");

      $close.addEventListener("click", () => {
        closeModal($target);
      });
    });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  const saveProductButton = document.getElementById("saveProductButton");
  const productForm = document.getElementById("productForm");

  saveProductButton.addEventListener("click", async () => {
    if (productForm.checkValidity()) {
      const name = document.getElementById("productName").value;
      const description = document.getElementById("productDescription").value;
      const image = document.getElementById("productImage").value;
      const price = parseFloat(document.getElementById("productPrice").value);
      const category = document.getElementById("productCategory").value; 
  
      const newProduct = {
        name,
        description,
        image,
        price,
        category,
      };
  
      // Enviar el producto al backend
      try {
        const response = await fetch("http://localhost:3000/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        });
  
        if (response.ok) {
          const savedProduct = await response.json(); // Recibir el producto guardado con su ID del backend
          addProductToList(savedProduct); // Agregar el producto a la lista que cree local
          closeAllModals();
          productForm.reset();
        } else {
          console.error("Error saving product:", response.statusText);
        }
      } catch (error) {
        console.error("Error saving product:", error);
      }
    } else {
      alert("Por favor, completa todos los campos.");
    }
  });

  function addProductToList(product) {
    products.push(product);
    renderProducts(products);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
  attachEventListeners();
});

function attachEventListeners() {
  document
    .getElementById("searchButton")
    .addEventListener("click", filterAndRenderProducts);
  searchInput.addEventListener("input", filterAndRenderProducts);
  document.getElementById("dropdown").addEventListener("click", toggleDropdown);
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", sortProducts);
  });
  document
    .getElementById("dropdown-categoria")
    .addEventListener("click", toggleDropdown);
  document.querySelectorAll(".item-categoria").forEach((item) => {
    item.addEventListener("click", filterByCategory);
  });
  document.getElementById("carrito").addEventListener("dragover", allowDrop);
  document.getElementById("carrito").addEventListener("drop", drop);
  title.addEventListener("click", toggleConfetti);
}

function toggleDropdown() {
  this.classList.toggle("is-active");
}


function drag(event) {
  event.dataTransfer.setData("text", event.target.dataset.productId);
}

function drop(event) {
  event.preventDefault();
  const productId = event.dataTransfer.getData("text");
  const product = products.find((p) => p.name === productId);

  if (product) {
    const existingItem = carrito.querySelector(
      `div[data-product-id="${productId}"]`
    );
    if (existingItem) {
      const quantityElement = existingItem.querySelector(".quantity");
      let quantity = parseInt(quantityElement.textContent);
      quantityElement.textContent = quantity + 1;
    } else {
      addItemToCart(product);
    }
  }
}

function addItemToCart(product) {
  const item = document.createElement("div");
  item.setAttribute("data-product-id", product.name);
  item.className = "box my-3 accent-color";
  item.innerHTML = `
    <div class="is-flex is-justify-content-space-between">
      <div>
        <b>${product.name}</b> - $${product.price}
        <span class="quantity">0</span> unidad(es)
      </div>
      <div>
        <button onclick="increaseQuantity('${product.name}', 1)">+</button>
        <button onclick="increaseQuantity('${product.name}', -1)">-</button>
      </div>
    </div>
  `;
  carrito.appendChild(item);
}

function increaseQuantity(productId, change) {
  const productElement = carrito.querySelector(
    `div[data-product-id="${productId}"]`
  );
  const quantityElement = productElement.querySelector(".quantity");
  let quantity = parseInt(quantityElement.textContent);
  quantity = Math.max(1, quantity + change); // Asegura que la cantidad no sea menor que 1
  quantityElement.textContent = quantity;
}

function sortProducts(event) {
  event.preventDefault();
  const sortType = this.getAttribute("data-sort");
  let sortedProducts = [...products];
  if (sortType === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }
  renderProducts(sortedProducts);
}

function filterByCategory(event) {
  event.preventDefault();
  const category = this.getAttribute("data-sort");
  const filteredProducts =
    category === "Todas"
      ? products
      : products.filter((product) => product.category === category);
  renderProducts(filteredProducts);
}

function filterAndRenderProducts() {
  const text = searchInput.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(text)
  );
  renderProducts(filteredProducts);
}

function toggleConfetti(e) {
  e.preventDefault();
  const rect = title.getBoundingClientRect();
  const x = (rect.left + rect.right) / 2 / window.innerWidth;
  const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
  confetti({
    particleCount: 20,
    spread: 200,
    origin: { x: x, y: y },
  });
  toggleAccentColor();
}

title.addEventListener("click", function () {
  webColor = `hsl(${Math.random() * 360}, 100%, 80%)`;
  setAccentColors(webColor);

  const emojis = ["🚀", "🌈", "🦄", "🌟", "🎉", "🎈", "🎊", "🔥", "💥", "🌲"];

  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  this.textContent = "Humildify " + randomEmoji;
});

function setAccentColors(color) {
  const elementsColor = Array.from(
    document.getElementsByClassName("accent-color")
  );
  const elementsBackground = Array.from(
    document.getElementsByClassName("accent-background")
  );
  const elementsShadow = Array.from(
    document.getElementsByClassName("accent-shadow")
  );

  elementsColor.forEach((element) => {
    element.style.color = color;
  });

  elementsBackground.forEach((element) => {
    element.style.backgroundColor = color;
  });

  elementsShadow.forEach((element) => {
    element.style.boxShadow = `0px 0px 20px -8px ${color}`;
  });

  elementsShadow.forEach((element) => {
    element.addEventListener("focus", () => {
      element.style.borderColor = color;
    });

    element.addEventListener("blur", () => {
      element.style.borderColor = "";
    });
  });
}

function renderCard(product) {
  return `
    <div class="cell product" draggable="true" id="${product.name}" data-product-id="${product.name}">
      <div class="card accent-shadow">
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${product.image}" class=""full-width alt="${product.name}" />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${product.name}</p>
              <p class="subtitle is-4">${product.price}</p>
            </div>
          </div>
          </div>
          <footer class="card-footer">
          <button class="card-footer-item button is-danger delete-button" data-product-id="${product.id}">Eliminar</button>
          <button class="card-footer-item button is-info edit-button" data-product-id="${product.id}">Editar</button>
          </footer>
          </div>
        </div>
      </div>
    </div>`;
}

function toggleAccentColor() {
  webColor = `hsl(${Math.random() * 360}, 100%, 80%)`;
  setAccentColors(webColor);
  title.textContent = "Humildify " + getEmoji();
}

function getEmoji() {
  const emojis = ["🚀", "🌈", "🦄", "🌟", "🎉", "🎈", "🎊", "🔥", "💥", "🌲"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}


// Funcion para el botón de eliminar producto
// Capturar los eventos de los botones de eliminar
function attachEventListeners() {
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", deleteProduct);
  });
}

// Función para eliminar el producto
function deleteProduct(event) {
  const productId = event.target.getAttribute("data-product-id"); // Obtener el id del producto desde el atributo data-product-id

  // Llamada al backend para eliminar el producto
  fetch(`http://localhost:3000/api/products/${productId}`, { method: "DELETE" })
    .then(() => {
      // Actualizar la lista de productos tras eliminarlo
      products = products.filter((p) => p.id !== productId);
      renderProducts(products); // Volver a renderizar los productos
    })
    .catch((error) => console.error("Error deleting product:", error));
}


// Funcion para el botón de editar producto
// Capturar los eventos de los botones de editar
function attachEventListeners() {
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", editProduct);
  });
}

// Función para editar el producto
function editProduct(event) {
  const productId = event.target.getAttribute("data-product-id"); // Obtener el id del producto desde el atributo data-product-id
  const newProductName = prompt("Ingresá el nuevo nombre:"); 
  const newProductPrice = prompt("Ingresá el nuevo precio:");

  // Datos a enviar en el cuerpo de la solicitud PUT
  const updatedProductData = {
    name: newProductName,
    price: newProductPrice,
  };

  // Llamada al backend para actualizar el producto
  fetch(`http://localhost:3000/api/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProductData),
  })
    .then((response) => response.json())
    .then((updatedProduct) => {
      // Actualizar la lista de productos tras editarlo
      products = products.map((p) => (p.id === productId ? updatedProduct : p));
      renderProducts(products); // Volver a renderizar los productos
    })
    .catch((error) => console.error("Error editing product:", error));
}