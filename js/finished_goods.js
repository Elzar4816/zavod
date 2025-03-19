
function createFinishedGood() {
    const name = document.getElementById('name').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const totalAmount = parseFloat(document.getElementById('total_amount').value);
    const unitId = document.getElementById('unit_id').value;

    if (isNaN(quantity) || isNaN(totalAmount)) {
        alert('Количество и общая сумма должны быть числами');
        return;
    }

    fetch('/finished-good/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            quantity,
            total_amount: totalAmount,
            unit_id: Number(unitId),
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                window.location.reload(); // Обновляем страницу
            } else {
                alert('Ошибка при добавлении продукции');
            }
        });
}

function openEditModal(id, name, quantity, unitId, totalAmount) {
    document.getElementById('editName').value = name;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editTotalAmount').value = totalAmount;
    document.getElementById('editUnitId').value = unitId;
    window.currentEditId = id; // Сохраняем ID для обновления
    document.getElementById('editModal').style.display = 'flex';
}

function updateFinishedGood() {
    const name = document.getElementById('editName').value;
    const quantity = parseFloat(document.getElementById('editQuantity').value);
    const totalAmount = parseFloat(document.getElementById('editTotalAmount').value);
    const unitId = document.getElementById('editUnitId').value;
    const id = window.currentEditId;

    if (isNaN(quantity) || isNaN(totalAmount)) {
        alert('Количество и общая сумма должны быть числами');
        return;
    }

    fetch(`/finished-good/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            quantity,
            total_amount: totalAmount,
            unit_id: Number(unitId),
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                window.location.reload(); // Обновляем страницу
            } else {
                alert('Ошибка при обновлении продукции');
            }
        });
}

function openDeleteModal(id) {
    window.currentDeleteId = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

function deleteFinishedGood() {
    const id = window.currentDeleteId;

    fetch(`/finished-good/delete/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Готовая продукция удалена') {
                window.location.reload(); // Обновляем страницу
            } else {
                alert('Ошибка при удалении продукции');
            }
        })
        .catch(error => {
            alert('Ошибка при удалении продукции: ' + error);
        });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}