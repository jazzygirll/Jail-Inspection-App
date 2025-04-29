// SweetAlert2 setup assumed in your index.html via CDN

const questions = {
    "West Tower": {
      "Maintenance Deficiencies": [
        "Light out",
        "INOP combo",
        "Sink INOP",
        "Toilet INOP",
        "Smoke cage missing"
      ],
      "Jail Deficiencies": [
        "Intercom INOP",
        "Dirty vent/cell",
        "Graffiti",
        "Gnats",
        "Paper on light/vent"
      ],
      "Fire Safety": [
        "Fire extinguisher present and charged",
        "Unlabeled chemical bottles"
      ]
    },
    "Frank Crowley": {
      "Maintenance Deficiencies": [
        "Light out",
        "Combo INOP (sink/toilet)",
        "Drain clogged/missing",
        "Smoke cage missing/damaged",
        "Intercom clogged/INOP",
        "Leaks present",
        "Graffiti present",
        "Dirty cell conditions",
        "Paper on light",
        "Dirty vent",
        "Dirty combo",
        "Gnats present"
      ]
    },
    "Intake": {
      "Maintenance Deficiencies": [
        "Smoke cage missing",
        "Intercom INOP",
        "Intercom screw missing",
        "Drain clogged",
        "Floor drain issue",
        "Light out",
        "Sink water pressure issue",
        "Sink INOP",
        "Toilet INOP",
        "Combo INOP"
      ],
      "Jail Deficiencies": [
        "Food trays present",
        "Gnats",
        "Graffiti",
        "Dirty cell/vent/combo",
        "Phone INOP",
        "Phone wire exposed"
      ]
    },
    "North Tower": {
      "Maintenance Deficiencies": [
        "Fire extinguisher present",
        "Light out",
        "Combo INOP",
        "Dirty cells or vent areas",
        "Graffiti present",
        "Paper on light or vent",
        "Unlabeled chemical bottles",
        "Intercom INOP",
        "Sink INOP",
        "Toilet INOP",
        "Door INOP",
        "Smoke cage missing",
        "Gnats",
        "Food trays",
        "Shower INOP"
      ]
    },
    "Kays": {
      "Maintenance Deficiencies": [
        "Light out",
        "No spill kit",
        "Extinguishers missing",
        "Cutdown tool missing",
        "Air pack missing",
        "Dirty gym",
        "Door handle broke/loose",
        "Intercom INOP",
        "Toilet INOP",
        "Sink INOP",
        "Combo INOP",
        "Shower INOP",
        "Drain clogged",
        "Unlabeled chemical bottles",
        "Graffiti",
        "Gnats",
        "Paper on light/vent",
        "Phone INOP",
        "Wire exposed"
      ]
    },
    "Release": {
      "Maintenance Deficiencies": [
        "Extinguishers outdated",
        "Spill kit missing",
        "Light out",
        "Sink water pressure issue",
        "Sink INOP",
        "Toilet INOP",
        "Combo INOP",
        "Door INOP",
        "Smoke cage missing",
        "Intercom INOP",
        "Graffiti",
        "Gnats",
        "Dirty vent/cell/combo",
        "Paper on light/vent",
        "Phone INOP",
        "Wire exposed"
      ]
    },
    "Gill-Hernandez": {
      "Maintenance Deficiencies": [
        "Restroom combo INOP",
        "Light out",
        "Damage to vent",
        "Door INOP",
        "Sink water pressure issue",
        "Sink INOP",
        "Combo INOP",
        "Paper on light/vent",
        "Food trays present",
        "Graffiti",
        "Gnats",
        "Dirty vent/cell/dayroom",
        "Dirty shower",
        "Dirty combo",
        "Phone INOP",
        "Wire exposed"
      ]
    }
  };
  // Load questions when location changes
document.getElementById('location').addEventListener('change', function () {
    const selectedLocation = this.value;
    const areaDiv = document.getElementById('areas');
    areaDiv.innerHTML = ''; // Clear old questions
  
    if (questions[selectedLocation]) {
      for (const [section, items] of Object.entries(questions[selectedLocation])) {
        // Create subheading for each section
        const sectionHeader = document.createElement('h3');
        sectionHeader.textContent = section;
        sectionHeader.style.marginTop = '20px';
        areaDiv.appendChild(sectionHeader);
  
        // Add questions under each section
        items.forEach(question => {
          const block = document.createElement('div');
          block.classList.add('question-block');
          block.innerHTML = `
            <label>${question}</label>
            <select required>
              <option value="">Select</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <input type="text" placeholder="Notes (if any)">
          `;
          areaDiv.appendChild(block);
        });
      }
    }
  });
  // ✅ Handle required notes if 'Fail' is selected
document.addEventListener('change', function (e) {
    if (
      e.target.tagName === 'SELECT' &&
      e.target.parentElement.classList.contains('question-block')
    ) {
      const notesInput = e.target.parentElement.querySelector('input');
      notesInput.required = (e.target.value === 'Fail'); // Require notes if FAIL
    }
  });
  
  // ✅ Handle form submission
  document.getElementById('inspectionForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block'; // 👉🏽 Show the spinner
  
    const inspectorName = document.getElementById('inspectorName').value;
    const inspectorEmail = document.getElementById('inspectorEmail').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
  
    const questionBlocks = document.querySelectorAll('.question-block');
    const questionsData = Array.from(questionBlocks).map(block => ({
      question: block.querySelector('label').innerText,
      status: block.querySelector('select').value,
      notes: block.querySelector('input').value,
      area: location
    }));
  
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inspectorName,
        inspectorEmail,
        location,
        date,
        questions: questionsData
      })
    })
      .then(response => response.json())
      .then(data => {
        spinner.style.display = 'none'; // Hide spinner
        Swal.fire({
          icon: 'success',
          title: '✅ Inspection Submitted!',
          text: 'Your inspection report was successfully saved and emailed!',
          width: 400,
          confirmButtonColor: '#4CAF50',
          background: '#f9f9f9',
          color: '#333'
        });
        this.reset(); // Clear form
        document.getElementById('areas').innerHTML = ''; // Clear questions
      })
      
      .catch(error => {
        console.error('❌ Error submitting report:', error);
        spinner.style.display = 'none'; // Hide spinner
        Swal.fire({
          icon: 'error',
          title: '❌ Submission Failed',
          text: 'There was an error submitting your report. Please try again later.',
          width: 400,
          confirmButtonColor: '#dc3545',
          background: '#fff0f0',
          color: '#333'
        });
      });
      
  
  
    // ✅ Send data to the backend
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inspectorName,
        inspectorEmail,
        location,
        date,
        questions: questionsData
      })
    })
      .then(response => response.json())
      .then(data => {
        Swal.fire({
          icon: 'success',
          title: 'Report Submitted!',
          text: 'Your inspection report has been saved and emailed successfully!',
          confirmButtonColor: '#007bff'
        });
        this.reset(); // Clear the form
        document.getElementById('areas').innerHTML = ''; // Clear the questions
      })
      .catch(error => {
        console.error('❌ Error submitting report:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'There was an error submitting the report. Please try again.',
          confirmButtonColor: '#dc3545'
        });
      });
  });
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('✅ Service Worker Registered'))
      .catch(error => console.error('Service Worker Error:', error));
  }

  let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBanner = document.createElement('div');
  installBanner.innerHTML = `
    <div style="background: #007bff; color: white; padding: 15px; text-align: center; font-size: 18px;">
      📲 Install Jail Inspection App on your device! <button id="installBtn" style="margin-left: 10px; padding: 8px 15px; background: white; color: #007bff; border: none; border-radius: 5px; cursor: pointer;">Install</button>
    </div>
  `;
  document.body.appendChild(installBanner);

  document.getElementById('installBtn').addEventListener('click', () => {
    installBanner.remove();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  });
});

  
  