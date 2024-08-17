function toggleCustomActivity(timeOfDay) {
    const selectElement = document.getElementById(timeOfDay);
    const customInputElement = document.getElementById(`${timeOfDay}-custom`);
    if (selectElement.value === 'custom') {
        customInputElement.style.display = 'block';
    } else {
        customInputElement.style.display = 'none';
    }
}

function addCustomTime() {
    const container = document.getElementById('custom-times-container');
    const index = container.children.length;
    const timeId = `custom-time-${index}`;
    const activityId = `custom-activity-${index}`;
    const customTimeHtml = `
        <div class="custom-time-row" id="custom-time-row-${index}">
            <input type="text" id="${timeId}" class="custom-time-input" placeholder="Enter custom time or event">
            <select id="${activityId}" class="activity-select" onchange="toggleCustomActivity('${activityId}')">
                <option value="movement">Rolling on Peanut Ball</option>
                <option value="tactile">Play with Playdough</option>
                <option value="proprioceptive">Jumping Jacks</option>
                <option value="custom">Custom</option>
            </select>
            <input type="text" id="${activityId}-custom" class="custom-activity-input" placeholder="Enter your custom activity" style="display:none">
            <button type="button" onclick="deleteCustomTime(${index})">Delete</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', customTimeHtml);
}

function deleteCustomTime(index) {
    const row = document.getElementById(`custom-time-row-${index}`);
    row.remove();
}

function generatePlan() {
    const age = document.getElementById('age').value;

    const beforeBreakfast = getActivity('before-breakfast');
    const afterBreakfast = getActivity('after-breakfast');
    const beforeLunch = getActivity('before-lunch');
    const afterLunch = getActivity('after-lunch');
    const beforeDinner = getActivity('before-dinner');
    const afterDinner = getActivity('after-dinner');

    let plan = `
        <div class="plan-item morning">
            <strong>Before Breakfast:</strong> ${beforeBreakfast}
        </div>
        <div class="plan-item morning">
            <strong>After Breakfast:</strong> ${afterBreakfast}
        </div>
        <div class="plan-item afternoon">
            <strong>Before Lunch:</strong> ${beforeLunch}
        </div>
        <div class="plan-item afternoon">
            <strong>After Lunch:</strong> ${afterLunch}
        </div>
        <div class="plan-item evening">
            <strong>Before Dinner:</strong> ${beforeDinner}
        </div>
        <div class="plan-item evening">
            <strong>After Dinner:</strong> ${afterDinner}
        </div>
    `;

    const customTimes = document.getElementById('custom-times-container').children;
    for (let i = 0; i < customTimes.length; i++) {
        const timeId = `custom-time-${i}`;
        const activityId = `custom-activity-${i}`;
        const customTime = document.getElementById(timeId).value;
        const customActivity = getActivity(activityId);

        plan += `
            <div class="plan-item custom">
                <strong>${customTime}:</strong> ${customActivity}
            </div>
        `;
    }

    document.getElementById('result').innerHTML = plan;

    // Scroll to top of the page to view the generated plan
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getActivity(timeOfDay) {
    const selectElement = document.getElementById(timeOfDay);
    if (selectElement.value === 'custom') {
        const customInputElement = document.getElementById(`${timeOfDay}-custom`);
        return customInputElement.value || 'Custom Activity';
    }
    return selectElement.options[selectElement.selectedIndex].text;
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const plan = document.getElementById('result').innerHTML;
    doc.fromHTML(plan, 10, 10);
    doc.save('sensory-diet-plan.pdf');
}

function importPlan(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const importedPlan = e.target.result;
            document.getElementById('result').innerHTML = importedPlan;
        };
        reader.readAsText(file);
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}
