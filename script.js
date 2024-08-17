// Show the popup when the page loads
window.onload = function () {
    document.getElementById("disclaimer-popup").style.display = "block";
};

// Function to close the popup
function closePopup() {
    document.getElementById("disclaimer-popup").style.display = "none";
}

// Function to toggle custom time input field
function toggleCustomTime(id) {
    const select = document.getElementById(id);
    const customInput = document.getElementById(`custom-time-${id}`);
    if (select.value === "Custom") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
    }
}

// Function to toggle custom mood input field
function toggleCustomMood(id) {
    const select = document.getElementById(`mood-${id}`);
    const customInput = document.getElementById(`custom-mood-${id}`);
    if (select.value === "Custom") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
    }
}

// Function to toggle custom activity input field
function toggleCustomActivity(id) {
    const select = document.getElementById(`activity-${id}`);
    const customInput = document.getElementById(`custom-activity-${id}`);
    if (select.value === "Custom") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
    }
}

// Object to track mood changes for summary
let moodChanges = {
    totalActivities: 0,
    positiveToCalm: 0,
    calmToPositive: 0,
    positiveToNegative: 0,
    calmToNegative: 0,
    negativeToCalm: 0,
    totalMoodImprovement: 0, // Tracks overall positive mood transitions
    totalMoodDecline: 0      // Tracks overall negative mood transitions
};

// Function to reset moodChanges
function resetMoodChanges() {
    moodChanges.totalActivities = 0;
    moodChanges.positiveToCalm = 0;
    moodChanges.calmToPositive = 0;
    moodChanges.positiveToNegative = 0;
    moodChanges.calmToNegative = 0;
    moodChanges.negativeToCalm = 0;
    moodChanges.totalMoodImprovement = 0;
    moodChanges.totalMoodDecline = 0;
}

// Function to track mood transitions after each activity
function trackMoodTransition(moodBefore, moodAfter) {
    if (moodBefore === "Positive" && moodAfter === "Calm") {
        moodChanges.positiveToCalm++;
    } else if (moodBefore === "Calm" && moodAfter === "Positive") {
        moodChanges.calmToPositive++;
        moodChanges.totalMoodImprovement++;
    } else if (moodBefore === "Positive" && moodAfter === "Negative") {
        moodChanges.positiveToNegative++;
        moodChanges.totalMoodDecline++;
    } else if (moodBefore === "Calm" && moodAfter === "Negative") {
        moodChanges.calmToNegative++;
        moodChanges.totalMoodDecline++;
    } else if (moodBefore === "Negative" && moodAfter === "Calm") {
        moodChanges.negativeToCalm++;
        moodChanges.totalMoodImprovement++;
    }
}

// Function to get the current date in a readable format
function getCurrentDate() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to generate the plan
function generatePlan() {
    resetMoodChanges();  // Reset the moodChanges object

    const currentDate = getCurrentDate(); // Get current date
    const rows = document.querySelectorAll(".sensory-plan-table tbody tr");
    let planContainer = document.createElement("div");
    planContainer.classList.add("plan-container");

    rows.forEach((row) => {
        const timeOfDay = row.cells[0].textContent.trim();
        const activitySelect = row.querySelector('select[id^="activity"]');
        const activity =
            activitySelect.value === "Custom"
                ? row.querySelector('input[id^="custom-activity"]').value
                : activitySelect.value;
        const timeSpentSelect = row.querySelector('select[id^="time"]');
        const timeSpent =
            timeSpentSelect.value === "Custom"
                ? row.querySelector('input[id^="custom-time"]').value
                : timeSpentSelect.value;
        const moodBeforeSelect = row.querySelector('select[id^="mood-before"]');
        const moodBefore =
            moodBeforeSelect.value === "Custom"
                ? row.querySelector('input[id^="custom-mood-before"]').value
                : moodBeforeSelect.value;
        const moodAfterSelect = row.querySelector('select[id^="mood-after"]');
        const moodAfter =
            moodAfterSelect.value === "Custom"
                ? row.querySelector('input[id^="custom-mood-after"]').value
                : moodAfterSelect.value;
        const notes = row.querySelector('input[id^="notes"]').value.trim();

        if (activity && timeSpent) {
            // Track the mood transition for each activity
            trackMoodTransition(moodBefore, moodAfter);
            moodChanges.totalActivities++;  // Increment the total activity count

            let planItem = `
                <div class="plan-item">
                    <strong>${timeOfDay}:</strong> ${activity} for ${timeSpent} minutes<br>
                    Mood Before: ${moodBefore}, Mood After: ${moodAfter}<br>
                    Notes: ${notes}
                </div>`;
            planContainer.innerHTML += planItem;
        }
    });

    document.getElementById("result").innerHTML = `<h3>Plan for ${currentDate}</h3>`; // Add the current date to the plan
    document.getElementById("result").appendChild(planContainer);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Generate daily summary at the end of the plan
    generateSummary(currentDate);
}

// Function to generate the daily summary
function generateSummary(currentDate) {
    let summaryHtml = `
        <h3>Daily Summary for ${currentDate}</h3>
        <p>Total Activities: ${moodChanges.totalActivities}</p>
        <p>Positive to Calm Transitions: ${moodChanges.positiveToCalm}</p>
        <p>Calm to Positive Transitions: ${moodChanges.calmToPositive}</p>
        <p>Positive to Negative Transitions: ${moodChanges.positiveToNegative}</p>
        <p>Calm to Negative Transitions: ${moodChanges.calmToNegative}</p>
        <p>Negative to Calm Transitions: ${moodChanges.negativeToCalm}</p>
        <p>Overall Mood Improvement: ${moodChanges.totalMoodImprovement > 0 ? "Positive" : "Neutral/Negative"}</p>
        <p>Overall Mood Decline: ${moodChanges.totalMoodDecline > 0 ? "Negative" : "Neutral/Positive"}</p>
    `;
    document.getElementById('daily-summary').innerHTML = summaryHtml;
}

// Function to export the plan as a text file
function exportPlan() {
    const planContent = document.getElementById("result").innerText;

    if (!planContent || planContent.trim() === "") {
        alert("Please generate a plan first.");
        return;
    }

    const blob = new Blob([planContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "sensory_diet_plan.txt";

    // Append link to the body (necessary for Firefox)
    document.body.appendChild(link);

    // Trigger the download by simulating a click
    link.click();

    // Remove the link after download
    document.body.removeChild(link);
}