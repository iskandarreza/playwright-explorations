document.getElementById('submit').addEventListener('click',  () => {
  console.debug('submit')
})

window.browsers = []
document.getElementById('add').addEventListener('click', () => {
  const selection = document.querySelector('#browserType select').value
  const tag = document.createElement('span')

  tag.innerText = selection
  document.querySelector('.selected-browsers').appendChild(tag)
  window.browsers.push(selection)
})