function openEditModal(id, name) {
    document.getElementById('editName').value = name;
    window.selectedUnitId = id; // Сохраняем ID для редактирования
    document.getElementById('editModal').style.display = 'flex';
}

function openDeleteModal(id) {
    window.selectedUnitId = id; // Сохраняем ID для удаления
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function createUnit() {
    const name = document.getElementById("name").value;
    if (!name) {
        alert("Название не может быть пустым");
        return;
    }

    try {
        const response = await fetch("/unit/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const result = await response.json();
        if (response.ok) {
            window.location.reload();
        } else {
            alert(result.error || "Ошибка при добавлении единицы измерения");
        }
    } catch (error) {
        console.error("Ошибка сети или выполнения запроса:", error);
        alert("Ошибка сети: " + error.message);
    }
}

async function updateUnit() {
    const name = document.getElementById("editName").value;
    if (!name) {
        alert("Название не может быть пустым");
        return;
    }

    try {
        const response = await fetch(`/unit/update/${window.selectedUnitId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const result = await response.json();
        if (response.ok) {
            window.location.reload();
        } else {
            alert(result.error || "Ошибка при обновлении единицы измерения");
        }
    } catch (error) {
        console.error("Ошибка сети или выполнения запроса:", error);
        alert("Ошибка сети: " + error.message);
    }
}

async function deleteUnit() {
    try {
        const response = await fetch(`/unit/delete/${window.selectedUnitId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const result = await response.json();
            alert(result.error || "Ошибка при удалении единицы измерения");
        }
    } catch (error) {
        console.error("Ошибка сети или выполнения запроса:", error);
        alert("Ошибка сети: " + error.message);
    }
}