const markInputs = document.querySelectorAll('.mark');
const totalSpan = document.getElementById('total');
const percentSpan = document.getElementById('percent');
const markForm = document.getElementById('markForm');
const alertBox = document.getElementById('alertBox');
const submitBtn = document.getElementById('submitBtn');

function showAlert(message, type = 'error') {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = 'block';
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert() {
  alertBox.textContent = '';
  alertBox.style.display = 'none';
  alertBox.className = 'alert';
}

function updatePreview() {
  let total = 0;
  markInputs.forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val) && val >= 0) {
      total += val;
    }
  });
  totalSpan.textContent = total;
  percentSpan.textContent = (total / 5.0).toFixed(2);
}

markInputs.forEach(input => {
  input.addEventListener('input', updatePreview);
});

markForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const roll_no = document.getElementById('roll_no').value.trim();
  const name = document.getElementById('name').value.trim();
  const class_name = document.getElementById('class_name').value.trim();

  if (!roll_no || !name || !class_name) {
    showAlert('Please fill in Roll Number, Name, and Class.');
    return;
  }

  const payload = { roll_no, name, class_name };

  for (const input of markInputs) {
    const rawVal = input.value.trim();
    if (rawVal === '') {
      showAlert(`Please enter marks for ${input.previousSibling?.textContent?.trim() || input.name}.`);
      input.focus();
      return;
    }
    const val = Number(rawVal);
    if (!Number.isInteger(val) || val < 0 || val > 100) {
      showAlert('Marks must be whole numbers between 0 and 100.');
      input.focus();
      return;
    }
    payload[input.name] = val;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Calculating & Saving...';

  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Failed to save record. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Calculate and Save';
      return;
    }

    // Success! Show summary and redirect
    const s = data.student;
    showAlert(
      `✓ Saved! Roll: ${s.roll_no} | Total: ${s.total}/500 (${s.percentage}%) | Grade: ${s.grade} | Result: ${s.result}. Redirecting to records...`,
      'success'
    );

    setTimeout(() => {
      window.location.href = 'results.html';
    }, 1200);
  } catch (err) {
    console.error('Fetch error:', err);
    showAlert('Network error: Unable to connect to server. Please check your connection.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Calculate and Save';
  }
});
