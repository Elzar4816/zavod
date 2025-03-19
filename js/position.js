
async function createPosition() {
    const name = document.getElementById("name").value;
    if (!name) return alert("Введите название позиции");

    const response = await fetch("/position/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Ошибка при создании позиции");
    }
}

async function updatePosition() {
    const id = document.getElementById("editId").value;
    const name = document.getElementById("editName").value;

    const response = await fetch(`/position/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Ошибка при обновлении позиции");
    }
}

async function deletePosition() {
    const id = document.getElementById("deleteId").value;

    const response = await fetch(`/position/delete/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Ошибка при удалении позиции");
    }
}

function openEditModal(id, name) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editModal').style.display = 'flex';
}

function openDeleteModal(id) {
    document.getElementById('deleteId').value = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}