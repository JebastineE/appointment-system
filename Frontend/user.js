/**
 * user.js - Patient dashboard logic
 * For Viva: This script fetches slots from localStorage (acting as our DB),
 * filters them, and handles the booking logic ensuring no double bookings occur.
 */

document.addEventListener('DOMContentLoaded', function() {
    renderSlots();
});

function renderSlots() {
    const slotDisplay = document.getElementById('slotDisplay');
    // Fetch slots from local storage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    slotDisplay.innerHTML = "";

    if (appointments.length === 0) {
        slotDisplay.innerHTML = "<p>No slots have been created by the staff yet.</p>";
        return;
    }

    appointments.forEach((slot, index) => {
        const slotCard = document.createElement('div');
        slotCard.className = 'slot-item' + (slot.isBooked ? ' status-booked' : '');
        
        // Define UI based on booking status
        const statusText = slot.isBooked ? "Not Available" : "Available";
        const buttonHtml = slot.isBooked 
            ? `<p style="font-size: 0.8rem; color: #991b1b; font-weight: bold;">BOOKED</p>` 
            : `<button class="btn-primary" onclick="confirmBooking(${index})">Book Slot</button>`;

        slotCard.innerHTML = `
            <h3>${slot.time}</h3>
            <p>${slot.date}</p>
            <p style="margin: 10px 0; font-weight: 600;">${statusText}</p>
            ${buttonHtml}
        `;
        slotDisplay.appendChild(slotCard);
    });
}

function confirmBooking(index) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Safety check: ensure the slot isn't already booked (Preventing double booking)
    if (appointments[index].isBooked) {
        alert("Sorry, this slot was just taken.");
        return;
    }

    // Mark as booked
    appointments[index].isBooked = true;
    appointments[index].bookedBy = "user@mail.com"; // Placeholder for the current user

    // Save back to storage
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Show confirmation
    const msgContainer = document.getElementById('userMessageContainer');
    msgContainer.innerHTML = `<div class="success-msg">Success! Your appointment for ${appointments[index].date} at ${appointments[index].time} is confirmed.</div>`;

    // Refresh display
    renderSlots();
}