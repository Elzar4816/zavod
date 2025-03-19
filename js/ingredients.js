function openEditModal(id, productId, rawMaterialId, quantity) {
    document.getElementById('editId').value = id;
    document.getElementById('editProductId').value = productId;
    document.getElementById('editRawMaterialId').value = rawMaterialId;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editModal').style.display = 'flex';
}

function openDeleteModal(id) {
    console.log("Открытие модального окна для удаления. ID: ", id);
    document.getElementById('deleteId').value = id; // Заполняем скрытое поле ID
    document.getElementById('deleteModal').style.display = 'flex'; // Показываем модальное окно
}


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Фильтрация по продукту
document.getElementById('product_id').addEventListener('change', function() {
    let selectedProductId = this.value;

    // Сохраняем выбранный продукт в localStorage
    localStorage.setItem('selectedProductId', selectedProductId);

    // Фильтруем строки на основе выбранного продукта
    document.querySelectorAll('.ingredient-row').forEach(row => {
        row.style.display = (!selectedProductId || row.getAttribute('data-product-id') === selectedProductId) ? '' : 'none';
    });
});

// Восстановление фильтра при загрузке страницы
window.addEventListener('load', function() {
    const savedProductId = localStorage.getItem('selectedProductId');
    if (savedProductId) {
        // Восстанавливаем выбранное значение фильтра
        document.getElementById('product_id').value = savedProductId;

        // Применяем фильтр
        document.querySelectorAll('.ingredient-row').forEach(row => {
            row.style.display = (row.getAttribute('data-product-id') === savedProductId) ? '' : 'none';
        });
    }
});

// Для формы добавления ингредиента
document.getElementById("ingredientForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Останавливаем стандартную отправку формы

    let formData = new FormData(this);

    fetch("/ingredient/create", {
        method: "POST",
        body: formData
    })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
            if (result.status === 409) { // Если ошибка дубликата
                // Показываем предупреждение браузера
                alert(result.body.error);
            } else if (result.status === 400) { // Если ошибка валидации
                alert(result.body.error);
            } else {
                // Перезагрузка страницы при успехе
                window.location.reload();
            }
        })
        .catch(error => console.error("Ошибка:", error));
});

async function createIngredient() {
    const product_id = document.getElementById("product_id").value;
    const raw_material_id = document.getElementById("raw_material_id").value;
    const quantity = document.getElementById("quantity").value;

    console.log("Отправка запроса на создание ингредиента", { product_id, raw_material_id, quantity });

    try {
        const response = await fetch("/ingredient/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_id: Number(product_id),
                raw_material_id: Number(raw_material_id),
                quantity: Number(quantity)
            })
        });

        const result = await response.json();
        console.log("Ответ сервера:", result);

        if (response.ok) {
            location.reload();
        } else {
            console.error("Ошибка при добавлении ингредиента", result);
            alert("Ошибка: " + (result.error || "Неизвестная ошибка"));
        }
    } catch (error) {
        console.error("Ошибка сети или выполнения запроса:", error);
        alert("Ошибка сети: " + error.message);
    }
}

async function updateIngredient() {
    const id = document.getElementById("editId").value;
    const product_id = document.getElementById("editProductId").value;
    const raw_material_id = document.getElementById("editRawMaterialId").value;
    const quantity = document.getElementById("editQuantity").value;

    console.log("Отправка запроса на обновление ингредиента", { id, product_id, raw_material_id, quantity });

    try {
        const response = await fetch(`/ingredient/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_id: Number(product_id),
                raw_material_id: Number(raw_material_id),
                quantity: Number(quantity) })
        });

        const result = await response.json();
        console.log("Ответ сервера:", result);

        if (response.ok) {
            location.reload();
        } else {
            console.error("Ошибка при обновлении ингредиента", result);
            alert("Ошибка: " + (result.error || "Неизвестная ошибка"));
        }
    } catch (error) {
        console.error("Ошибка сети или выполнения запроса:", error);
        alert("Ошибка сети: " + error.message);
    }
}

async function deleteIngredient() {
    const id = document.getElementById("deleteId").value;
    console.log("Отправка запроса на удаление ингредиента с ID:", id);

    try {
        const response = await fetch(`/ingredient/delete/${id}`, { method: "DELETE" });
        console.log("Ответ от сервера при удалении:", response);

        if (response.ok) {
            console.log("Ингредиент успешно удален");
            location.reload(); // Перезагружаем страницу для обновления данных
        } else {
            const result = await response.json();
            console.error("Ошибка при удалении ингредиента:", result);
            alert("Ошибка: " + (result.error || "Неизвестная ошибка"));
        }
    } catch (error) {
        console.error("Ошибка сети или выполнения запроса:", error);
        alert("Ошибка сети: " + error.message);
    }
}


