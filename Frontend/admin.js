/**
 * admin.js - Staff/Admin logic
 * For Viva: This file allows administrators to perform CRUD operations on 
 * the appointment schedule by modifying the data in localStorage.
 */

document.addEventListener('DOMContentLoaded', function() {
    refreshAdminSlots();
});

function addNewSlot() {
    const dateInput = document.getElementById('newDate');
    const timeInput = document.getElementById('newTime');

    if (!dateInput.value || !timeInput.value) {
        alert("Please provide both a date and a time.");
        return;
    }

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // Create the slot object
    const newEntry = {
        date: dateInput.value,
        time: timeInput.value,
        isBooked: false,
        bookedBy: null,
        id: Date.now() // Unique ID based on timestamp
    };

    appointments.push(newEntry);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Clear inputs
    dateInput.value = "";
    timeInput.value = "";

    refreshAdminSlots();
}

function refreshAdminSlots() {
    const adminList = document.getElementById('adminSlotList');
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    adminList.innerHTML = "";

    if (appointments.length === 0) {
        adminList.innerHTML = "<p>No slots created yet.</p>";
        return;
    }

    appointments.forEach((slot, index) => {
        const item = document.createElement('div');
        item.className = 'slot-item';
        
        const status = slot.isBooked ? 
            `<span style="color: #991b1b; font-weight:bold;">Booked</span>` : 
            `<span style="color: #16a34a; font-weight:bold;">Available</span>`;

        item.innerHTML = `
            <h3>${slot.time}</h3>
            <p>${slot.date}</p>
            <p style="margin: 5px 0;">Status: ${status}</p>
            <button class="btn-delete" onclick="removeSlot(${index})">Remove Slot</button>
        `;
        adminList.appendChild(item);
    });
}

function removeSlot(index) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Double check with user before deletion
    if (confirm("Are you sure you want to delete this slot?")) {
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        refreshAdminSlots();
    }
}