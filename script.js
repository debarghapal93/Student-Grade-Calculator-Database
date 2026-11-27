const marks = document.querySelectorAll('.mark');

function update() {
  let total = 0;
  marks.forEach(m => {
    const val = parseFloat(m.value);
    if (!isNaN(val) && val >= 0) {
      total += val;
    }
  });
  document.getElementById('total').textContent = total;
  document.getElementById('percent').textContent = (total / 5).toFixed(2);
}

marks.forEach(m => m.addEventListener('input', update));

document.getElementById('markForm').addEventListener('submit', e => {
  for (const m of marks) {
    const v = Number(m.value);
    if (m.value.trim() === '' || !Number.isInteger(v) || v < 0 || v > 100) {
      alert('Marks must be whole numbers between 0 and 100.');
      m.focus();
      e.preventDefault();
      return;
    }
  }
});
