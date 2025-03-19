function createPurchase() {
    const rawMaterialId = document.getElementById('raw_material_id').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const totalAmount = parseFloat(document.getElementById('total_amount').value);
    const employeeId = document.getElementById('employee_id').value;

    if (isNaN(quantity) || isNaN(totalAmount)) {
        alert('Количество и сумма должны быть числами');
        return;
    }

    fetch('/purchases/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            raw_material_id: Number(rawMaterialId),
            quantity,
            total_amount: totalAmount,
            employee_id: Number(employeeId)
        }),
    })
        .then(response => response.json())  // Используем .json() для обработки JSON ответа
        .then(data => {
            if (data.id) {
                alert('Закупка добавлена!');
                window.location.reload();
            } else {
                // Показываем сообщение об ошибке от сервера
                alert(data.error);
            }
        })
        .catch(error => {
            console.error("Ошибка при запросе:", error);
            alert('Ошибка при разборе ответа сервера');
        });
}


let currentDeleteId = null;

function openDeleteModal(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

function deletePurchase() {
    fetch(`/purchases/delete/${currentDeleteId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Закупка удалена') {
                alert('Закупка удалена!');
                window.location.reload();
            } else {
                alert('Ошибка при удалении');
            }
        })
        .catch(error => {
            alert('Ошибка: ' + error);
        });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}