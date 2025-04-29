// Load reports when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/reports')
      .then(response => response.json())
      .then(reports => {
        const tableBody = document.querySelector('#reportsTable tbody');
        reports.forEach(report => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${report.id}</td>
            <td>${report.inspector_name}</td>
            <td>${report.inspector_email}</td>
            <td>${report.location}</td>
            <td>${report.date}</td>
            <td>
              <button class="view-btn" data-id="${report.id}">View</button>
              <button class="download-btn" data-id="${report.id}">Download PDF</button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error fetching reports:', error);
        Swal.fire('Error', 'Could not load reports. Please try again later.', 'error');
      });
  });
  
  // Handle View and Download actions
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-btn')) {
      const reportId = e.target.getAttribute('data-id');
      viewReport(reportId);
    }
  
    if (e.target.classList.contains('download-btn')) {
      const reportId = e.target.getAttribute('data-id');
      window.open(`/api/report/${reportId}/pdf`, '_blank'); // Adjust backend route if needed
    }
  });
  
  // View report details (SweetAlert2 popup)
  function viewReport(reportId) {
    fetch(`/api/report/${reportId}`)
      .then(response => response.json())
      .then(report => {
        const questionDetails = report.questions
          .map(q => `<b>Question:</b> ${q.question}<br><b>Status:</b> ${q.status}<br><b>Notes:</b> ${q.notes || 'N/A'}<hr>`)
          .join('');
  
        Swal.fire({
          title: `Report #${report.id} - ${report.location}`,
          html: `
            <b>Inspector:</b> ${report.inspector_name}<br>
            <b>Email:</b> ${report.inspector_email}<br>
            <b>Date:</b> ${report.date}<br><hr>
            ${questionDetails}
          `,
          width: '600px',
          confirmButtonText: 'Close'
        });
      })
      .catch(error => {
        console.error('Error fetching report details:', error);
        Swal.fire('Error', 'Could not load report details.', 'error');
      });
  }

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

  