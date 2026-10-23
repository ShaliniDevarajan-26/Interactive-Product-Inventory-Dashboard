// Interactive Product Inventory & Analytics Dashboard
// Demonstrates variables, data types, conversion, conditionals, loops, functions,
// scope, objects, arrays, forEach(), filter() and map().

"use strict";

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Laptop", price: 800, added: "Sample data" },
  { id: 2, name: "Mouse", price: 25, added: "Sample data" }
];
let products = SAMPLE_PRODUCTS.map(product => ({ ...product }));
let nextId = 3;

const $ = selector => document.querySelector(selector);
const money = amount => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(amount);

function getCategory(price) {
  // switch assigns a category badge based on a dynamic price range.
  const range = price < 50 ? "budget" : price < 500 ? "standard" : "premium";
  switch (range) {
    case "budget": return "Budget";
    case "standard": return "Standard";
    case "premium": return "Premium";
    default: return "Standard";
  }
}

function calculateTotal(items = products) {
  // Local scope: total is intentionally not available outside this function.
  let total = 0;
  items.forEach(item => { total += item.price; });
  return total;
}

const getAffordable = (items, limit = 200) =>
  items.filter(item => item.price < limit);

function validateProduct(name, price) {
  if (!name || !name.trim()) return "Please enter a product name.";
  if (!Number.isFinite(price) || price <= 0) return "Enter a price greater than zero.";
  if (name.trim().length > 60) return "Product name must be 60 characters or fewer.";
  // Check duplicate names without being case-sensitive.
  for (const item of products) {
    if (item.name.toLowerCase() === name.trim().toLowerCase()) {
      return "A product with this name already exists.";
    }
  }
  return "";
}

function renderStats() {
  const affordable = getAffordable(products);
  const premium = products.filter(item => getCategory(item.price) === "Premium");
  $("#totalProducts").textContent = products.length;
  $("#totalValue").textContent = money(calculateTotal());
  $("#affordableCount").textContent = affordable.length;
  $("#premiumCount").textContent = premium.length;
}

function renderProducts() {
  const searchTerm = $("#search").value.trim().toLowerCase();
  const selectedCategory = $("#categoryFilter").value;
  const visibleProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === "All" || getCategory(product.price) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const rows = $("#productRows");
  rows.replaceChildren();
  visibleProducts.forEach(product => {
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    const nameWrap = document.createElement("div");
    nameWrap.className = "product-name";
    const icon = document.createElement("span");
    icon.className = "product-icon";
    icon.textContent = product.name.charAt(0).toUpperCase();
    const name = document.createElement("span");
    name.textContent = product.name;
    nameWrap.append(icon, name);
    nameCell.append(nameWrap);

    const priceCell = document.createElement("td");
    priceCell.className = "price";
    priceCell.textContent = money(product.price);

    const categoryCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge ${getCategory(product.price)}`;
    badge.textContent = getCategory(product.price);
    categoryCell.append(badge);

    const addedCell = document.createElement("td");
    addedCell.textContent = product.added;
    const actionCell = document.createElement("td");
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${product.name}`);
    remove.addEventListener("click", () => removeProduct(product.id));
    actionCell.append(remove);
    tr.append(nameCell, priceCell, categoryCell, addedCell, actionCell);
    rows.append(tr);
  });

  $("#empty").hidden = visibleProducts.length > 0;
  $("#resultCount").textContent = `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"}`;
}

function renderAnalytics() {
  const affordable = getAffordable(products);
  const list = $("#affordableList");
  list.replaceChildren();
  if (!affordable.length) {
    const message = document.createElement("p");
    message.className = "no-items";
    message.textContent = "No products currently fall under $200.";
    list.append(message);
  } else {
    affordable.forEach(product => {
      const line = document.createElement("div");
      line.className = "affordable-item";
      const label = document.createElement("span");
      label.textContent = product.name;
      const price = document.createElement("strong");
      price.textContent = money(product.price);
      line.append(label, price);
      list.append(line);
    });
  }

  const formatted = products.map(product => `${product.name.toUpperCase()}: ${money(product.price)}`);
  $("#report").textContent = [
    `Inventory count: ${products.length}`,
    `Total inventory value: ${money(calculateTotal())}`,
    `Affordable items: ${JSON.stringify(affordable.map(item => item.name))}`,
    `Formatted report: ${JSON.stringify(formatted)}`
  ].join("\n");
}

function render() {
  renderStats();
  renderProducts();
  renderAnalytics();
}

function removeProduct(id) {
  products = products.filter(product => product.id !== id);
  render();
  toast("Product removed from inventory.");
}

function toast(message) {
  const target = $("#toast");
  target.textContent = message;
  target.classList.add("show");
  window.setTimeout(() => target.classList.remove("show"), 2300);
}

const dialog = $("#addDialog");
$("#openAdd").addEventListener("click", () => {
  $("#formError").textContent = "";
  $("#productForm").reset();
  dialog.showModal();
  $("#productName").focus();
});
function closeDialog() { dialog.close(); }
$("#closeDialog").addEventListener("click", closeDialog);
$("#cancelAdd").addEventListener("click", closeDialog);

$("#productForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#productName").value.trim();
  // Explicit type conversion from form text to number.
  const price = Number($("#productPrice").value);
  const error = validateProduct(name, price);
  if (error) {
    $("#formError").textContent = error;
    return;
  }
  products.push({ id: nextId++, name, price, added: "Just now" });
  closeDialog();
  render();
  toast(`${name} added successfully.`);
});

$("#search").addEventListener("input", renderProducts);
$("#categoryFilter").addEventListener("change", renderProducts);
$("#reset").addEventListener("click", () => {
  products = SAMPLE_PRODUCTS.map(product => ({ ...product }));
  nextId = 3;
  $("#search").value = "";
  $("#categoryFilter").value = "All";
  render();
  toast("Sample inventory restored.");
});
$("#copyReport").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#report").textContent);
    toast("Report copied to clipboard.");
  } catch {
    toast("Clipboard access unavailable. Select and copy the report.");
  }
});

// Small loop demonstration in the browser console.
for (let index = 0; index < products.length; index++) {
  if (!products[index]) continue;
  // Initial product roster is logged for assignment practice.
  console.log(`Product: ${products[index].name} - ${money(products[index].price)}`);
}
render();
