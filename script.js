async function searchTrials() {
    const condition = document.getElementById("condition").value;
    const location = document.getElementById("location").value;
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "<p>Searching real clinical trials...</p>";

    const url =
        `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(condition)}&query.locn=${encodeURIComponent(location)}&filter.overallStatus=RECRUITING&pageSize=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        resultsDiv.innerHTML = "<h2>Trial Results</h2>";

        if (!data.studies || data.studies.length === 0) {
            resultsDiv.innerHTML += "<p>No recruiting trials found.</p>";
            return;
        }

        for (const study of data.studies) {
            const protocol = study.protocolSection;

            const title =
                protocol.identificationModule?.briefTitle || "No title available";

            const nctId =
                protocol.identificationModule?.nctId || "";

            const status =
                protocol.statusModule?.overallStatus || "Status unavailable";

            const eligibility =
                protocol.eligibilityModule?.eligibilityCriteria || "Eligibility criteria unavailable";

            const locations =
                protocol.contactsLocationsModule?.locations || [];

            const locationText =
                locations.length > 0
                    ? locations.slice(0, 3).map(loc =>
                        `${loc.city || "City not listed"}, ${loc.country || "Country not listed"}`
                    ).join("; ")
                    : "No location listed";

            const aiResponse = await fetch("http://localhost:3000/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eligibility: eligibility
                })
            });

            const aiData = await aiResponse.json();

            resultsDiv.innerHTML += `
                <div class="card">
                    <h3>${title}</h3>

                    <p><strong>Status:</strong> ${status}</p>

                    <p><strong>Locations:</strong> ${locationText}</p>

                    <p><strong>Eligibility:</strong></p>
                    <p>${eligibility.slice(0, 700)}...</p>

                    <div class="score" style="
color:
${aiData.score >= 80 ? 'green' :
  aiData.score >= 60 ? 'orange' :
  'red'};
">
    Match Score: ${aiData.score}%
</div>

<p><strong>Plain-English Summary:</strong></p>
<pre>${aiData.summary}</pre>

                    <p>
                        <a href="https://clinicaltrials.gov/study/${nctId}" target="_blank">
                            View Full Trial
                        </a>
                    </p>
                </div>
            `;
        }

    } catch (error) {
        resultsDiv.innerHTML = "<p>Something went wrong. Try again.</p>";
        console.error(error);
    }
}