
// Функция для создания или обновления бюджета
function createBudget() {
    const totalAmount = parseFloat(document.getElementById('total_amount').value);

    if (isNaN(totalAmount)) {
        alert('Сумма бюджета должна быть числом');
        return;
    }

    fetch('/budget/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total_amount: totalAmount })
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                window.location.reload(); // Перезагружаем страницу после успешного добавления
            } else {
                alert(data.error);
            }
        });
}

// Функция для редактирования бюджета
function openEditModal(id, totalAmount) {
    document.getElementById('editId').value = id;
    document.getElementById('editTotalAmount').value = totalAmount;
    document.getElementById('editModal').style.display = 'flex';
}

// Функция для обновления бюджета
function updateBudget() {
    const id = document.getElementById('editId').value;
    const totalAmount = parseFloat(document.getElementById('editTotalAmount').value);

    if (isNaN(totalAmount)) {
        alert('Сумма бюджета должна быть числом');
        return;
    }

    fetch(`/budget/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total_amount: totalAmount })
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                window.location.reload(); // Перезагружаем страницу после успешного обновления
            } else {
                alert('Ошибка при обновлении бюджета');
            }
        });
}

// Функция для удаления бюджета
function openDeleteModal(id) {
    document.getElementById('deleteModal').style.display = 'flex';
    window.currentDeleteId = id;
}

// Функция для подтверждения удаления бюджета
function deleteBudget() {
    const id = window.currentDeleteId;

    fetch(`/budget/delete/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Бюджет удален') {
                window.location.reload(); // Перезагружаем страницу после удаления
            } else {
                alert('Ошибка при удалении бюджета');
            }
        });
}

// Функция для закрытия модального окна
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}