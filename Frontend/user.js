let selectedSlotInfo = null;
let cancelSlotId = null;

document.addEventListener("DOMContentLoaded", () => {
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const select = document.getElementById("doctorSelect");
    if(!select) return;

    doctors.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = `${d.name} (${d.spec})`;
        select.appendChild(opt);
    });

    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (activeUser && document.getElementById("userGreeting")) {
        document.getElementById("userGreeting").textContent = `Hello, ${activeUser.name || activeUser.email}`;
    }

    const cancelReasonInput = document.getElementById('cancelReasonText');
    if (cancelReasonInput) {
        cancelReasonInput.addEventListener('input', function(e) {
            const words = this.value.trim().split(/\s+/);
            if (words.length > 50) {
                const limitedWords = words.slice(0, 50);
                this.value = limitedWords.join(' ');
            }
        });
    }

    renderUserHistory();
});

function loadSlots() {
    const docId = document.getElementById("doctorSelect").value;
    const container = document.getElementById("slots");
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    container.innerHTML = "";
    if (!docId) return;

    const doc = doctors.find(d => d.id == docId);
    if (doc && doc.slots && doc.slots.length > 0) {
        doc.slots.forEach((slot) => {
            const card = document.createElement("div");
            card.className = `slot-card ${slot.patient ? 'booked' : ''}`;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
                    <div>
                        <div class="slot-date" style="text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; margin-bottom:0.25rem;">${slot.date}</div>
                        <div class="slot-time" style="font-size:1.4rem; font-weight:800; margin:0;">${slot.time}</div>
                    </div>
                </div>
                <div class="slot-status" style="margin-top:auto;">
                    ${slot.patient ? `<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">Reserved</p>` : `<button class="btn-primary" style="padding:0.6rem; font-size:0.85rem;">Book Now</button>`}
                </div>
            `;
            if (!slot.patient) card.onclick = () => openBookingModal(doc.id, slot.id, doc.name, slot);
            container.appendChild(card);
        });
    }
}

function openBookingModal(docId, slotId, docName, slot) {
    selectedSlotInfo = { docId, slotId };
    document.getElementById("bookingDetailText").innerText = `Booking with ${docName} on ${slot.date} at ${slot.time}`;
    document.getElementById("bookingModal").style.display = "flex";
}

function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
}

function confirmBooking() {
    const name = document.getElementById("pName").value;
    const age = document.getElementById("pAge").value;
    const gender = document.getElementById("pGender").value;
    const phone = document.getElementById("pContact").value;
    if (!name || !age || !phone) {
        alert("Please complete all fields.");
        return;
    }

    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doc = doctors.find(d => d.id == selectedSlotInfo.docId);
    const slot = doc ? doc.slots.find(s => s.id == selectedSlotInfo.slotId) : null;
    
    if (slot) {
        slot.patient = { name, age, gender, phone, bookedByEmail: activeUser.email };
        localStorage.setItem("doctors", JSON.stringify(doctors));

        const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");
        history.push({
            slotId: slot.id,
            docId: doc.id,
            docName: doc.name,
            spec: doc.spec,
            date: slot.date,
            time: slot.time,
            patientName: name,
            status: 'Booked',
            bookedByEmail: activeUser.email
        });
        localStorage.setItem("hospital_history", JSON.stringify(history));

        alert("Appointment Scheduled.");
        closeBookingModal();
        loadSlots();
        renderUserHistory();
    }
}

function renderUserHistory() {
    const list = document.getElementById("userHistory");
    if (!list) return;
    list.innerHTML = "";
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (!activeUser) return;

    const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");
    const userRecords = history.filter(h => h.bookedByEmail === activeUser.email);

    if (userRecords.length > 0) {
        userRecords.reverse().forEach(record => {
            const isCancelled = record.status === 'Cancelled';
            const isRescheduled = record.previousTime != null;
            const card = document.createElement("div");
            card.className = `card fade-in ${isCancelled ? 'cancelled-card' : ''}`;
            
            let timingHtml = `
                <div style="background:var(--bg-light); padding:1rem; border-radius:10px; margin: 1rem 0; border:1px solid var(--border);">
                    <div style="font-size:0.9rem;"><strong>Date:</strong> ${record.date}</div>
                    <div style="font-size:0.9rem;"><strong>Time:</strong> ${record.time}</div>
                </div>
            `;
            
            if (isRescheduled && !isCancelled) {
                timingHtml = `
                    <div style="background:#f0f7ff; padding:1rem; border-radius:10px; margin: 1rem 0; border:1px solid #c2e0ff;">
                        <div style="font-size:0.75rem; color:var(--primary); font-weight:700; text-transform:uppercase; margin-bottom:0.4rem;">Timing Updated</div>
                        <div style="font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
                            <span style="text-decoration:line-through; color:var(--text-muted);">${record.previousTime}</span>
                            <span style="font-weight:800; color:var(--primary);">→ ${record.time}</span>
                        </div>
                        <div style="font-size:0.85rem; margin-top:0.2rem;"><strong>New Date:</strong> ${record.date}</div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <div style="font-weight:800; color:var(--text-dark); font-size:1.1rem; margin-bottom:0.1rem;">${record.docName}</div>
                        <div style="color:var(--primary); font-size:0.75rem; font-weight:700; text-transform:uppercase;">${record.spec}</div>
                    </div>
                    <span class="status-badge ${isCancelled ? 'status-cancelled' : 'status-booked'}">${record.status}</span>
                </div>
                
                ${timingHtml}

                ${!isCancelled ? `<button onclick="openCancelModal(${record.slotId})" style="padding: 5px 12px; font-size: 0.75rem; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancel Appointment</button>` : ''}
                ${record.cancelReason ? `<div style="font-size:0.8rem; color:var(--danger); margin-top:8px; line-height:1.4;"><strong>Reason:</strong> ${record.cancelReason}</div>` : ''}
            `;
            list.appendChild(card);
        });
    } else {
        list.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 2rem;'>No history.</p>";
    }
}

function openCancelModal(slotId) {
    cancelSlotId = slotId;
    document.getElementById('cancelReasonText').value = "";
    document.getElementById('userCancelModal').style.display = "flex";
}

function closeCancelModal() {
    document.getElementById('userCancelModal').style.display = "none";
}

function submitCancellation() {
    const reasonText = document.getElementById('cancelReasonText').value.trim();
    if (!reasonText) return alert("Please enter a reason.");

    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    doctors.forEach(doc => {
        const slot = doc.slots.find(s => s.id == cancelSlotId);
        if (slot) slot.patient = null;
    });
    localStorage.setItem("doctors", JSON.stringify(doctors));

    const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");
    const record = history.find(h => h.slotId == cancelSlotId && h.status !== 'Cancelled');
    if (record) {
        record.status = 'Cancelled';
        record.cancelReason = reasonText;
        localStorage.setItem("hospital_history", JSON.stringify(history));
    }

    alert("Appointment cancelled.");
    closeCancelModal();
    loadSlots();
    renderUserHistory();
}