fetch('http://localhost:5000/api/problems/seed', { method: 'POST' })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
