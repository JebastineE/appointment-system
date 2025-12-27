let currentRescheduleData = null;

document.addEventListener("DOMContentLoaded", () => {
    refreshDoctorSelect();
    render();
    renderAppointments();
    
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (activeUser && document.getElementById("userGreeting")) {
        document.getElementById("userGreeting").textContent = `Hello, ${activeUser.name || activeUser.email}`;
    }
});

function refreshDoctorSelect() {
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const select = document.getElementById("slotDocSelect");
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose Profile --</option>';
    doctors.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
    });
}

function addDoctor() {
    const name = document.getElementById("docName").value.trim();
    const spec = document.getElementById("docSpec").value;
    if (!name) {
        alert("Please enter the doctor's name before saving.");
        return;
    }
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    doctors.push({ id: Date.now(), name, spec, slots: [] });
    localStorage.setItem("doctors", JSON.stringify(doctors));
    document.getElementById("docName").value = "";
    refreshDoctorSelect();
    render();
}

function addSlot() {
    const docId = document.getElementById("slotDocSelect").value;
    const date = document.getElementById("slotDate").value;
    const time = document.getElementById("slotTime").value;
    if (!docId) {
        alert("Please select a target doctor.");
        return;
    }
    if (!date || !time) {
        alert("Please provide both a date and a time.");
        return;
    }
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doc = doctors.find(d => d.id == docId);
    if (doc) {
        doc.slots.push({ id: Date.now(), date, time, patient: null });
        localStorage.setItem("doctors", JSON.stringify(doctors));
        render();
    }
}

function render() {
    const list = document.getElementById("doctorList");
    if (!list) return;
    list.innerHTML = "";
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    doctors.forEach(d => {
        const card = document.createElement("div");
        card.className = "card";
        
        let slotRows = d.slots.length ? d.slots.map(s => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding:0.75rem 0.5rem">${s.date}<br><strong>${s.time}</strong></td>
                <td style="padding:0.5rem">
                    <span style="color:${s.patient ? 'var(--danger)' : 'var(--success)'}; font-weight:bold;">
                        ${s.patient ? 'Booked' : 'Available'}
                    </span>
                </td>
                <td style="padding:0.5rem; text-align:right;">
                    <button onclick="deleteSlot(${d.id}, ${s.id})" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.75rem; text-decoration:underline;">Delete Slot</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="3" style="padding:1rem; text-align:center;">No slots found</td></tr>';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
                <div>
                    <h3 style="margin:0">${d.name}</h3>
                    <p style="color:var(--primary); font-weight:700; font-size:0.8rem; text-transform:uppercase;">${d.spec}</p>
                </div>
                <button onclick="removeDoctor(${d.id})" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.8rem; text-decoration:underline;">Remove Doctor Profile</button>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                <tr style="text-align:left; border-bottom: 2px solid var(--border);">
                    <th style="padding:0.5rem">Date/Time</th>
                    <th style="padding:0.5rem">Status</th>
                    <th style="padding:0.5rem; text-align:right;">Action</th>
                </tr>
                ${slotRows}
            </table>
        `;
        list.appendChild(card);
    });
}

function deleteSlot(docId, slotId) {
    if (!confirm("Are you sure you want to delete this specific slot? If it is booked, the appointment will be lost.")) return;
    
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doc = doctors.find(d => d.id == docId);
    if (doc) {
        doc.slots = doc.slots.filter(s => s.id != slotId);
        localStorage.setItem("doctors", JSON.stringify(doctors));
        
        // Also mark as cancelled in history if it was booked
        const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");
        const record = history.find(h => h.slotId == slotId && h.status !== 'Cancelled');
        if (record) {
            record.status = 'Cancelled';
            record.cancelReason = "Slot deleted by Admin";
            localStorage.setItem("hospital_history", JSON.stringify(history));
        }
        
        render();
        renderAppointments();
    }
}

function renderAppointments() {
    const list = document.getElementById("appointmentList");
    if (!list) return;
    list.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");

    if (history.length === 0) {
        list.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);'>No active or history bookings found.</p>";
        return;
    }

    [...history].reverse().forEach(record => {
        const isCancelled = record.status === 'Cancelled';
        const isRescheduled = record.previousTime != null;
        const card = document.createElement("div");
        card.className = `card ${isCancelled ? 'cancelled-card' : ''}`;
        
        card.innerHTML = `
            <div style="font-size: 0.95rem; line-height: 2.2; color: var(--text-dark);">
                <div><strong>Doctor Name:</strong> ${record.docName}</div>
                <div><strong>Specialization:</strong> ${record.spec}</div>
                <div><strong>Patient Name:</strong> ${record.patientName || 'N/A'}</div>
                <div><strong>Appointment Date:</strong> ${isRescheduled ? record.previousDate : record.date}</div>
                <div><strong>Appointment Time:</strong> ${isRescheduled ? record.previousTime : record.time}</div>
                <div style="margin-top: 5px;">
                    <span class="status-badge ${isCancelled ? 'status-cancelled' : 'status-booked'}">
                        ${record.status}
                    </span>
                </div>
                ${isRescheduled && !isCancelled ? `<div style="color: #2563eb; font-weight: 600;"><strong>Rescheduled To:</strong> ${record.time}</div>` : ''}
                ${record.cancelReason ? `<div style="font-size:0.85rem; color:var(--danger); margin-top:5px; line-height:1.4;"><strong>Reason:</strong> ${record.cancelReason}</div>` : ''}
            </div>
            ${!isCancelled ? `
                <div style="display:flex; gap:10px; margin-top:1.5rem;">
                    <button class="btn-primary" style="flex:1; background:var(--success);" onclick="openRescheduleModal(${record.docId}, ${record.slotId})">Reschedule</button>
                    <button class="btn-primary" style="flex:1; background:var(--danger);" onclick="cancelAppointmentAdmin(${record.docId}, ${record.slotId})">Cancel Appointment</button>
                </div>
            ` : ''}
        `;
        list.appendChild(card);
    });
}

function cancelAppointmentAdmin(docId, slotId) {
    if (!confirm("Are you sure you want to cancel this appointment? It will remain in history as 'Cancelled'.")) return;
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doc = doctors.find(d => d.id == docId);
    if (doc) {
        const slot = doc.slots.find(s => s.id == slotId);
        if (slot) slot.patient = null;
        localStorage.setItem("doctors", JSON.stringify(doctors));
    }

    const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");
    const record = history.find(h => h.slotId == slotId && h.status !== 'Cancelled');
    if (record) {
        record.status = 'Cancelled';
        record.cancelReason = "Cancelled by Administration";
        localStorage.setItem("hospital_history", JSON.stringify(history));
    }

    render();
    renderAppointments();
}

function openRescheduleModal(docId, slotId) {
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doc = doctors.find(d => d.id == docId);
    if (!doc) return;
    
    const slot = doc.slots.find(s => s.id == slotId);
    if (!slot || !slot.patient) return;

    currentRescheduleData = { docId, oldSlotId: slotId };
    const summaryContainer = document.getElementById("rescheduleContext");
    summaryContainer.innerHTML = `
        <div style="font-size:0.9rem; background:var(--bg-light); padding:1rem; border-radius:10px; margin-bottom:1rem; border:1px solid var(--border);">
            <div><strong>Patient:</strong> ${slot.patient.name}</div>
            <div><strong>Doctor:</strong> ${doc.name}</div>
            <div><strong>Time:</strong> ${slot.date} @ ${slot.time}</div>
        </div>
    `;
    
    const select = document.getElementById("availableSlotsSelect");
    select.innerHTML = '<option value="">-- Choose New Time --</option>';
    doc.slots.forEach(s => {
        if (!s.patient) {
            const opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = `${s.date} @ ${s.time}`;
            select.appendChild(opt);
        }
    });
    document.getElementById("rescheduleModal").style.display = "flex";
}

function closeRescheduleModal() {
    document.getElementById("rescheduleModal").style.display = "none";
}

function confirmReschedule() {
    const newSlotId = document.getElementById("availableSlotsSelect").value;
    if (!newSlotId) return;

    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doc = doctors.find(d => d.id == currentRescheduleData.docId);
    if (!doc) return;

    const oldSlot = doc.slots.find(s => s.id == currentRescheduleData.oldSlotId);
    const newSlot = doc.slots.find(s => s.id == newSlotId);
    if (!oldSlot || !newSlot) return;

    const patientEmail = oldSlot.patient.bookedByEmail;
    
    newSlot.patient = { ...oldSlot.patient };
    oldSlot.patient = null;
    localStorage.setItem("doctors", JSON.stringify(doctors));

    const history = JSON.parse(localStorage.getItem("hospital_history") || "[]");
    const record = history.find(h => h.slotId == currentRescheduleData.oldSlotId && h.bookedByEmail == patientEmail && h.status !== 'Cancelled');
    
    if (record) {
        record.previousDate = record.previousDate || record.date;
        record.previousTime = record.previousTime || record.time;
        
        // Sync full info in case doctor changed
        record.slotId = newSlot.id;
        record.docId = doc.id;
        record.docName = doc.name;
        record.spec = doc.spec;
        record.date = newSlot.date;
        record.time = newSlot.time;
        
        localStorage.setItem("hospital_history", JSON.stringify(history));
    }

    closeRescheduleModal();
    render();
    renderAppointments();
}

function removeDoctor(id) {
    if (!confirm("Permanently delete this doctor profile and all associated slots?")) return;
    let doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    doctors = doctors.filter(d => d.id != id);
    localStorage.setItem("doctors", JSON.stringify(doctors));
    refreshDoctorSelect();
    render();
    renderAppointments();
}