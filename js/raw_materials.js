function createRawMaterial() {
    const name = document.getElementById('name').value;
    const quantity = parseFloat(document.getElementById('quantity').value); // преобразуем в число
    const totalAmount = parseFloat(document.getElementById('total_amount').value); // преобразуем в число
    const unitId = document.getElementById('unit_id').value;

    if (isNaN(quantity) || isNaN(totalAmount)) {
        alert('Количество и общая сумма должны быть числами');
        return;
    }

    fetch('/raw-material/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            quantity,
            total_amount: Number(totalAmount),
            unit_id: Number(unitId),
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                alert('Сырье добавлено!');
                window.location.reload(); // Обновляем страницу, чтобы отобразить изменения
            } else {
                alert('Ошибка при добавлении сырья');
            }
        });
}


function openEditModal(id, name, quantity, totalAmount, unitId) {
    document.getElementById('editName').value = name;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editTotalAmount').value = totalAmount;
    document.getElementById('editUnitId').value = unitId;
    document.getElementById('editModal').style.display = 'flex';

    // Сохраняем ID для обновления
    window.currentEditId = id;
}

function updateRawMaterial() {
    const name = document.getElementById('editName').value;
    const quantity = parseFloat(document.getElementById('editQuantity').value); // преобразуем в число
    const totalAmount = parseFloat(document.getElementById('editTotalAmount').value); // преобразуем в число
    const unitId = document.getElementById('editUnitId').value;
    const id = window.currentEditId;

    if (isNaN(quantity) || isNaN(totalAmount)) {
        alert('Количество и общая сумма должны быть числами');
        return;
    }

    fetch(`/raw-material/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            quantity,
            total_amount: totalAmount,
            unit_id: Number(unitId), // преобразуем в число
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                alert('Сырье обновлено!');
                window.location.reload();
            } else {
                alert('Ошибка при обновлении сырья');
            }
        });
}


function openDeleteModal(id) {
    window.currentDeleteId = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

function deleteRawMaterial() {
    const id = window.currentDeleteId;

    fetch(`/raw-material/delete/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Сырье удалено') { // Обновлено сообщение
                alert('Сырье удалено!');
                window.location.reload(); // Перезагружаем страницу, чтобы отобразить изменения
            } else {
                alert('Ошибка при удалении сырья');
            }
        })
        .catch(error => {
            alert('Ошибка при удалении сырья: ' + error);
        });
}


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}