fetch('/api/test').then(res => {
    console.log(res)
    window.result = res.json();
})
